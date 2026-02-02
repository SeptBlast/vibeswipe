import GlassView from "@/components/GlassView";
import { MultiAvatar } from "@/components/MultiAvatar";
import { db } from "@/configs/firebaseConfig";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { BlurView } from "expo-blur";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  Appbar,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: number;
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [otherUserName, setOtherUserName] = useState("Chat");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserPhotoURL, setOtherUserPhotoURL] = useState<string | null>(
    null,
  );
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id || !user) return;

    // Fetch chat info to get participants
    const fetchChatInfo = async () => {
      try {
        const chatDoc = await getDoc(doc(db, "chats", id as string));
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          const otherUserId = chatData.participants?.find(
            (uid: string) => uid !== user.uid,
          );
          if (otherUserId) {
            setOtherUserId(otherUserId);
            const userDoc = await getDoc(doc(db, "users", otherUserId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setOtherUserName(userData.anonymousAlias || "User");
              setOtherUserPhotoURL(userData.photoURL || null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching chat info:", error);
      }
    };

    fetchChatInfo();

    const messagesRef = collection(db, "chats", id as string, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [id, user]);

  const sendMessage = async () => {
    if (!user || !inputText.trim()) return;

    const text = inputText.trim();
    setInputText("");

    // Animate send button
    const sendAnimation = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(sendAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(sendAnimation, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 400,
      }),
    ]).start();

    try {
      // 1. Add message to subcollection
      const messagesRef = collection(db, "chats", id as string, "messages");
      await addDoc(messagesRef, {
        text,
        senderId: user.uid,
        createdAt: Date.now(),
      });

      // 2. Update last message in chat doc
      const chatRef = doc(db, "chats", id as string);
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTimestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Floating Glass Header */}
        {Platform.OS === "android" ? (
          <Appbar.Header elevated>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content
              title={otherUserName}
              titleStyle={{ fontSize: 20, fontWeight: "600" }}
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
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <IconButton
                icon="arrow-left"
                iconColor={theme.colors.onSurface}
                size={24}
              />
            </Pressable>
            <Text
              variant="titleLarge"
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              {otherUserName}
            </Text>
            <View style={{ width: 48 }} />
          </BlurView>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.uid;
            return (
              <View
                style={[
                  styles.messageRow,
                  isMe ? styles.myMessageRow : styles.theirMessageRow,
                ]}
              >
                {!isMe && otherUserId && (
                  <MultiAvatar
                    userId={otherUserId}
                    photoURL={otherUserPhotoURL}
                    size={36}
                  />
                )}
                <GlassView
                  variant="overlay"
                  intensity={isMe ? "medium" : "light"}
                  elevation={false}
                  style={[
                    styles.messageBubble,
                    isMe
                      ? [
                          styles.myMessageBubble,
                          { backgroundColor: theme.colors.primaryContainer },
                        ]
                      : [
                          styles.theirMessageBubble,
                          { backgroundColor: theme.colors.surfaceVariant },
                        ],
                  ]}
                >
                  <Text
                    style={{
                      color: isMe
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceVariant,
                      fontSize: 15,
                      lineHeight: 22,
                    }}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={{
                      color: isMe
                        ? `${theme.colors.onPrimaryContainer}99`
                        : `${theme.colors.onSurfaceVariant}99`,
                      fontSize: 10,
                      alignSelf: "flex-end",
                      marginTop: 4,
                    }}
                  >
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </Text>
                </GlassView>
              </View>
            );
          }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          style={styles.messageList}
          contentContainerStyle={{
            paddingTop: 80,
            paddingBottom: liquidGlass.spacing.breathe,
          }}
          showsVerticalScrollIndicator={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          style={styles.keyboardAvoidingView}
        >
          <BlurView
            intensity={liquidGlass[theme.dark ? "dark" : "light"].blur.strong}
            tint={theme.dark ? "dark" : "light"}
            style={[
              styles.inputContainer,
              {
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessage}
                multiline
                maxLength={500}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                  },
                ]}
                outlineColor="transparent"
                activeOutlineColor={theme.colors.primary}
                contentStyle={{ paddingRight: 48 }}
              />
              <Pressable
                onPress={sendMessage}
                style={[
                  styles.sendButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                disabled={!inputText.trim()}
              >
                <IconButton
                  icon="send"
                  iconColor={theme.colors.onPrimary}
                  size={20}
                />
              </Pressable>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: liquidGlass.spacing.intimate,
    paddingVertical: liquidGlass.spacing.intimate,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    marginLeft: -8,
  },
  headerTitle: {
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: liquidGlass.spacing.cozy,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: liquidGlass.spacing.cozy,
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  theirMessageRow: {
    justifyContent: "flex-start",
  },
  avatar: {
    marginRight: liquidGlass.spacing.intimate,
  },
  messageBubble: {
    padding: liquidGlass.spacing.cozy,
    maxWidth: "75%",
  },
  myMessageBubble: {
    borderTopLeftRadius: liquidGlass.corners.medium,
    borderTopRightRadius: liquidGlass.corners.medium,
    borderBottomLeftRadius: liquidGlass.corners.medium,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    borderTopLeftRadius: liquidGlass.corners.medium,
    borderTopRightRadius: liquidGlass.corners.medium,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: liquidGlass.corners.medium,
  },
  keyboardAvoidingView: {
    // Ensures composer stays above keyboard
  },
  inputContainer: {
    paddingHorizontal: liquidGlass.spacing.cozy,
    paddingTop: liquidGlass.spacing.comfortable,
    // paddingBottom set dynamically with insets for safe area
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    minHeight: 48,
    maxHeight: 120,
    borderRadius: liquidGlass.corners.medium,
    paddingRight: 56,
  },
  sendButton: {
    position: "absolute",
    right: 4,
    top: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
