import GlassView from "@/components/GlassView";
import { MultiAvatar } from "@/components/MultiAvatar";
import PostCard from "@/components/PostCard";
import { db } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { useAuth } from "@/contexts/AuthContext";
import { Comment, EmotionType, Post } from "@/types/feed";
import { formatDistanceToNow } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!id) return;

    // Fetch Post
    const unsubPost = onSnapshot(doc(db, CollectionNames.POSTS, id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPost({
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toMillis()
              : data.createdAt || Date.now(),
        } as Post);
      }
    });

    // Fetch Comments from subcollection
    const commentsRef = collection(db, CollectionNames.POSTS, id, "comments");
    const qComments = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubComments = onSnapshot(qComments, async (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(fetchedComments);

      // Fetch user photos for comment authors
      const userIds = [...new Set(fetchedComments.map((c) => c.userId))];
      const photos: Record<string, string> = {};
      for (const userId of userIds) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.photoURL) {
              photos[userId] = userData.photoURL;
            }
          }
        } catch (error) {
          console.error("Error fetching user photo:", error);
        }
      }
      setUserPhotos(photos);
      setLoading(false);
    });

    return () => {
      unsubPost();
      unsubComments();
    };
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !id) return;

    try {
      // Fetch user's anonymousAlias
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userAlias = userDoc.exists()
        ? userDoc.data()?.anonymousAlias || "User"
        : "User";

      const commentData = {
        userId: user.uid,
        anonymousAlias: userAlias,
        text: newComment.trim(),
        createdAt: Date.now(),
      };

      // Add comment to subcollection
      await addDoc(
        collection(db, CollectionNames.POSTS, id, "comments"),
        commentData,
      );

      // Update comment count on post
      await updateDoc(doc(db, CollectionNames.POSTS, id), {
        commentCount: increment(1),
      });

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleReaction = async (emotion: EmotionType) => {
    if (!user || !id || !post) return;
    const postRef = doc(db, CollectionNames.POSTS, id);
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

  if (loading) {
    return (
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.container}
      >
        <ActivityIndicator
          animating={true}
          color="#fff"
          style={{ marginTop: 50 }}
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            onPress={() => router.back()}
          />
          <Text
            variant="titleMedium"
            style={{ color: "#fff", fontWeight: "bold" }}
          >
            Comments
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() =>
            post ? (
              <PostCard
                post={post}
                onLike={() => {}}
                onComment={() => {}}
                onReact={handleReaction}
                currentUserId={user?.uid}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <GlassView style={styles.commentCard} intensity="light">
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <MultiAvatar
                  userId={item.userId}
                  photoURL={userPhotos[item.userId]}
                  size={30}
                  style={{ marginRight: 10 }}
                />
                <View>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {item.anonymousAlias}
                  </Text>
                  <Text style={{ color: "#ccc", fontSize: 10 }}>
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </Text>
                </View>
              </View>
              <Text style={{ color: "#eee", marginTop: 5 }}>{item.text}</Text>
            </GlassView>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <GlassView style={styles.inputContainer} intensity="strong">
            <TextInput
              mode="flat"
              placeholder="Write a vibe..."
              placeholderTextColor="#ccc"
              value={newComment}
              onChangeText={setNewComment}
              style={styles.input}
              textColor="#fff"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              right={
                <TextInput.Icon
                  icon="send"
                  color="#fff"
                  onPress={handleAddComment}
                />
              }
            />
          </GlassView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  commentCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    overflow: "hidden",
  },
  inputContainer: {
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 25,
    height: 50,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});
