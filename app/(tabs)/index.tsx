import CreatePostFAB from "@/components/CreatePostFAB";
import PostCard from "@/components/PostCard";
import { db } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Comment, EmotionType, Post } from "@/types/feed";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Appbar, IconButton, Text, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function WallScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // ... existing state ...
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentsMap, setCommentsMap] = useState<{
    [postId: string]: Comment[];
  }>({});
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const { user } = useAuth(); // Assuming AuthContext exposes user
  const router = useRouter();

  // Fetch blocked users
  const fetchBlockedUsers = async () => {
    if (!user) return;
    try {
      const blockedSnapshot = await getDocs(
        collection(db, CollectionNames.USERS, user.uid, "blockedUsers"),
      );
      const blockedIds = blockedSnapshot.docs.map((doc) => doc.id);
      setBlockedUserIds(blockedIds);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  };

  const fetchPosts = async () => {
    if (!user) return; // Guard against unauthenticated fetch
    try {
      const q = query(
        collection(db, CollectionNames.POSTS),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          // Validate required fields
          if (!data.userId || !doc.id) {
            console.warn("Skipping invalid post:", doc.id, data);
            return null;
          }
          return {
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toMillis()
                : data.createdAt || Date.now(),
            reactions: data.reactions || 0,
            commentCount: data.commentCount || 0,
            likedBy: data.likedBy || [],
          };
        })
        .filter((post) => post !== null) as Post[];

      // Filter out posts from blocked users
      const filteredPosts = fetchedPosts.filter(
        (post) => !blockedUserIds.includes(post.userId),
      );
      setPosts(filteredPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchBlockedUsers();
    fetchPosts();
    // Optional: Real-time listener
    const unsubscribe = onSnapshot(
      query(
        collection(db, CollectionNames.POSTS),
        orderBy("createdAt", "desc"),
      ),
      (snapshot) => {
        const fetchedPosts = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            // Validate required fields
            if (!data.userId || !doc.id) {
              console.warn("Skipping invalid post in realtime:", doc.id, data);
              return null;
            }
            return {
              id: doc.id,
              ...data,
              createdAt:
                data.createdAt instanceof Timestamp
                  ? data.createdAt.toMillis()
                  : data.createdAt || Date.now(),
              reactions: data.reactions || 0,
              commentCount: data.commentCount || 0,
              likedBy: data.likedBy || [],
            };
          })
          .filter((post) => post !== null) as Post[];

        // Filter out posts from blocked users
        const filteredPosts = fetchedPosts.filter(
          (post) => !blockedUserIds.includes(post.userId),
        );
        setPosts(filteredPosts);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [user, blockedUserIds]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const fetchCommentsForPost = async (postId: string) => {
    try {
      // Fetch from subcollection instead of top-level collection
      const q = query(
        collection(db, CollectionNames.POSTS, postId, "comments"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toMillis()
              : data.createdAt || Date.now(),
        };
      }) as Comment[];
      setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async (post: Post) => {
    if (!user) return;
    const postRef = doc(db, CollectionNames.POSTS, post.id);
    const isLiked = post.likedBy?.includes(user.uid);

    try {
      if (isLiked) {
        // Unlike
        await updateDoc(postRef, {
          reactions: increment(-1),
          likedBy: arrayRemove(user.uid),
        });
      } else {
        // Like
        await updateDoc(postRef, {
          reactions: increment(1),
          likedBy: arrayUnion(user.uid),
        });
      }
    } catch (e) {
      console.error("Error toggling like:", e);
    }
  };

  const handleReaction = async (post: Post, emotion: EmotionType) => {
    if (!user) return;
    const postRef = doc(db, CollectionNames.POSTS, post.id);
    const hasReacted = post.emotionReactions?.[emotion]?.includes(user.uid);
    const fieldPath = `emotionReactions.${emotion}`;

    try {
      if (hasReacted) {
        // Remove reaction if clicking the same emotion
        await updateDoc(postRef, {
          [fieldPath]: arrayRemove(user.uid),
        });
      } else {
        // First, remove user from all other emotion reactions
        const updateObj: any = {};
        const allEmotions: EmotionType[] = [
          "love",
          "celebrate",
          "support",
          "insightful",
          "curious",
        ];

        allEmotions.forEach((em) => {
          if (post.emotionReactions?.[em]?.includes(user.uid)) {
            updateObj[`emotionReactions.${em}`] = arrayRemove(user.uid);
          }
        });

        // If user had any previous reactions, remove them first
        if (Object.keys(updateObj).length > 0) {
          await updateDoc(postRef, updateObj);
        }

        // Then add the new reaction
        await updateDoc(postRef, {
          [fieldPath]: arrayUnion(user.uid),
        });
      }
    } catch (e) {
      console.error("Error toggling emotion:", e);
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    if (!user) return;

    try {
      const userDoc = await getDocs(
        query(
          collection(db, CollectionNames.USERS),
          where("uid", "==", user.uid),
        ),
      );
      const userData = userDoc.docs[0]?.data();

      // Add comment to subcollection (not top-level collection)
      await addDoc(collection(db, CollectionNames.POSTS, postId, "comments"), {
        userId: user.uid,
        displayName: userData?.alias || "Anonymous",
        text: commentText,
        createdAt: Date.now(),
      });

      // Update comment count
      const postRef = doc(db, CollectionNames.POSTS, postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
      });

      // Refresh comments for this post
      await fetchCommentsForPost(postId);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header - Material Design 3 on Android, Liquid Glass on iOS */}
        {Platform.OS === "android" ? (
          <Appbar.Header
            elevated
            style={{ backgroundColor: theme.colors.surface }}
          >
            <Appbar.Content title="Let's Vibe" />
            <Appbar.Action
              icon="account-circle"
              onPress={() => router.push("/profile")}
            />
          </Appbar.Header>
        ) : (
          <BlurView
            intensity={liquidGlass[theme.dark ? "dark" : "light"].blur.medium}
            tint={theme.dark ? "dark" : "light"}
            style={[
              styles.floatingHeader,
              { paddingTop: insets.top + liquidGlass.spacing.cozy },
            ]}
          >
            <Text
              variant="headlineSmall"
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              Let's Vibe
            </Text>
            <IconButton
              icon="account-circle"
              size={28}
              iconColor={theme.colors.onSurface}
              onPress={() => router.push("/profile")}
            />
          </BlurView>
        )}

        <FlatList
          data={posts.filter((post) => post && post.id && post.userId)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={user?.uid}
              comments={commentsMap[item.id] || []}
              onLike={() => handleLike(item)}
              onReact={(emotion) => handleReaction(item, emotion)}
              onComment={(commentText) => handleComment(item.id, commentText)}
              onFetchComments={() => fetchCommentsForPost(item.id)}
            />
          )}
          contentContainerStyle={{
            paddingTop: Platform.OS === "ios" ? 80 : 8,
            paddingBottom: 120,
            paddingHorizontal: 4,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No vibes yet. Be the first to share!
                </Text>
              </View>
            ) : null
          }
        />

        <CreatePostFAB />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: liquidGlass.spacing.comfortable,
    paddingVertical: liquidGlass.spacing.cozy,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingVertical: liquidGlass.spacing.breathe * 3,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
