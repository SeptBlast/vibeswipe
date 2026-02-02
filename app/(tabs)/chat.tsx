import { MultiAvatar } from "@/components/MultiAvatar";
import GlassCard from "@/components/ui/GlassCard";
import { db } from "@/configs/firebaseConfig";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTimestamp: number;
  type: "1:1" | "group";
  name?: string; // For groups
  otherUserName?: string; // For 1:1 chats
  otherUserAlias?: string; // For 1:1 chats
  otherUserPhotoURL?: string; // For 1:1 chats
  otherUserId?: string; // For 1:1 chats
}

// Separate component for chat item to use hooks properly
interface ChatItemProps {
  item: ChatRoom;
  onPress: (chatId: string) => void;
}

function ChatItem({ item, onPress }: ChatItemProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: liquidGlass.motion.spring.press.scale,
      useNativeDriver: true,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.chatItem, { transform: [{ scale: scaleAnim }] }]}
    >
      <Pressable
        onPress={() => onPress(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <GlassCard intensity="medium">
          <View style={styles.chatRow}>
            {item.type === "group" ? (
              <Avatar.Icon
                icon="account-group"
                size={48}
                style={[
                  styles.avatar,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              />
            ) : (
              <MultiAvatar
                userId={
                  item.otherUserId ||
                  item.participants.find((id) => id !== user?.uid) ||
                  ""
                }
                photoURL={item.otherUserPhotoURL}
                size={48}
              />
            )}
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text
                  variant="titleMedium"
                  style={[styles.chatTitle, { color: theme.colors.onSurface }]}
                  numberOfLines={1}
                >
                  {item.type === "group"
                    ? item.name
                    : item.otherUserAlias || item.otherUserName || "Chat"}
                </Text>
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {item.lastMessageTimestamp
                    ? formatDistanceToNow(item.lastMessageTimestamp)
                    : ""}
                </Text>
              </View>
              <Text
                variant="bodyMedium"
                style={[
                  styles.lastMessage,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={2}
              >
                {item.lastMessage || "No messages yet"}
              </Text>
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

export default function ChatListScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTimestamp", "desc"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatRoom[];

      // Fetch other user names for 1:1 chats
      const chatsWithNames = await Promise.all(
        fetchedChats.map(async (chat) => {
          if (chat.type === "1:1" && chat.participants.length === 2) {
            const otherUserId = chat.participants.find(
              (uid) => uid !== user.uid,
            );
            if (otherUserId) {
              try {
                const userDoc = await getDoc(doc(db, "users", otherUserId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    ...chat,
                    otherUserId,
                    otherUserName: userData.anonymousAlias || "User",
                    otherUserAlias: userData.anonymousAlias || "User",
                    otherUserPhotoURL: userData.photoURL || null,
                  };
                }
              } catch (error) {
                console.error("Error fetching user:", error);
              }
            }
          }
          return chat;
        }),
      );

      setChats(chatsWithNames);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
            <Appbar.Content
              title="Messages"
              titleStyle={{ fontWeight: "600" }}
            />
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
              Messages
            </Text>
            <IconButton
              icon="account-circle"
              size={28}
              iconColor={theme.colors.onSurface}
              onPress={() => router.push("/profile")}
            />
          </BlurView>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingTop: Platform.OS === "ios" ? 80 : 8,
              paddingBottom: 120,
              paddingHorizontal: liquidGlass.spacing.cozy,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ChatItem
                item={item}
                onPress={(chatId) => router.push(`/chat/${chatId}`)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text
                  variant="bodyLarge"
                  style={[
                    styles.emptyText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No chats yet.{"\n"}
                  Connect with someone to start a conversation!
                </Text>
              </View>
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatItem: {
    marginVertical: liquidGlass.spacing.tight,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: liquidGlass.spacing.cozy,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatTitle: {
    fontWeight: "600",
    flex: 1,
  },
  lastMessage: {
    lineHeight: 22,
    fontSize: 15,
  },
  emptyState: {
    paddingVertical: liquidGlass.spacing.breathe * 3,
    alignItems: "center",
    paddingHorizontal: liquidGlass.spacing.breathe,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 24,
  },
});
