import BlockUserBottomSheet from "@/components/bottomsheets/BlockUserBottomSheet";
import ChatSettingsBottomSheet, {
  ChatRetentionPeriod,
} from "@/components/bottomsheets/ChatSettingsBottomSheet";
import ReportBottomSheet from "@/components/bottomsheets/ReportBottomSheet";
import GlassView from "@/components/GlassView";
import { MultiAvatar } from "@/components/MultiAvatar";
import { db } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { ReportReason } from "@/types/moderation";
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
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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
  const [otherUserName, setOtherUserName] = useState("Loading...");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserPhotoURL, setOtherUserPhotoURL] = useState<string | null>(
    null,
  );
  const flatListRef = useRef<FlatList>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);
  const [nextAction, setNextAction] = useState<"report" | "block" | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [chatRetention, setChatRetention] =
    useState<ChatRetentionPeriod>("forever");

  useEffect(() => {
    if (!id || !user) return;

    // Fetch chat info to get participants and settings
    const fetchChatInfo = async () => {
      console.log("=== Starting fetchChatInfo ===");
      console.log("Chat ID:", id);
      console.log("Current User:", user?.uid);

      try {
        const chatDoc = await getDoc(doc(db, "chats", id as string));
        console.log("Chat doc exists:", chatDoc.exists());

        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          console.log("Chat data:", chatData);

          // Get retention setting
          if (chatData.messageRetention) {
            setChatRetention(chatData.messageRetention);
          }

          const otherUserId = chatData.participants?.find(
            (uid: string) => uid !== user.uid,
          );
          console.log("Other user ID:", otherUserId);

          if (otherUserId) {
            setOtherUserId(otherUserId);

            // Check if current user is blocked by the other user
            const blockedDoc = await getDoc(
              doc(
                db,
                CollectionNames.USERS,
                otherUserId,
                "blockedUsers",
                user.uid,
              ),
            );
            console.log("Blocked doc exists:", blockedDoc.exists());
            if (blockedDoc.exists()) {
              setIsBlocked(true);
            }

            // Fetch other user's profile
            const userDoc = await getDoc(
              doc(db, CollectionNames.USERS, otherUserId),
            );
            console.log("User doc exists:", userDoc.exists());

            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log("Fetched user data:", userData);
              console.log("anonymousAlias:", userData?.anonymousAlias);

              // Set name with multiple fallbacks
              const displayName = userData?.anonymousAlias || "Anonymous User";

              console.log("Setting display name to:", displayName);
              setOtherUserName(displayName);
              setOtherUserPhotoURL(userData?.photoURL || null);
            } else {
              console.warn("User document does not exist:", otherUserId);
              setOtherUserName("Anonymous User");
            }
          } else {
            console.warn("Could not find other user in participants");
            setOtherUserName("Unknown User");
          }
        } else {
          console.warn("Chat document does not exist:", id);
          setOtherUserName("Chat");
        }
      } catch (error) {
        console.error("Error fetching chat info:", error);
        setOtherUserName("User");
      }

      console.log("=== Completed fetchChatInfo ===");
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

    // Check if user is blocked
    if (isBlocked) {
      Alert.alert(
        "Unable to Send",
        "You can't send messages in this conversation.",
      );
      return;
    }

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

  const handleReport = async (reason: ReportReason, description: string) => {
    if (!user || !otherUserId) return;

    try {
      await addDoc(collection(db, "reports"), {
        reporterId: user.uid,
        contentId: id,
        contentType: "chat",
        contentOwnerId: otherUserId,
        reason: reason,
        description: description,
        status: "pending",
        createdAt: Date.now(),
      });

      setReportVisible(false);
    } catch (error) {
      console.error("Error reporting user:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  const handleBlock = async (reason: string) => {
    if (!user || !otherUserId) return;

    try {
      await setDoc(
        doc(db, CollectionNames.USERS, user.uid, "blockedUsers", otherUserId),
        {
          blockedUserId: otherUserId,
          blockedAt: Date.now(),
          reason: reason,
        },
      );

      // Also report
      await addDoc(collection(db, "reports"), {
        reporterId: user.uid,
        contentId: id,
        contentType: "chat",
        contentOwnerId: otherUserId,
        reason: "harassment",
        description: `User blocked from chat: ${reason}`,
        status: "pending",
        createdAt: Date.now(),
      });

      setBlockVisible(false);
      Alert.alert(
        "User Blocked",
        "You won't receive messages from this user anymore.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("Error blocking user:", error);
      Alert.alert("Error", "Failed to block user. Please try again.");
    }
  };

  const handleRetentionChange = async (period: ChatRetentionPeriod) => {
    if (!id) return;

    try {
      const chatRef = doc(db, "chats", id as string);
      await updateDoc(chatRef, {
        messageRetention: period,
      });
      setChatRetention(period);
    } catch (error) {
      console.error("Error updating retention:", error);
      Alert.alert("Error", "Failed to update message timer. Please try again.");
    }
  };

  const getRetentionLabel = () => {
    switch (chatRetention) {
      case "24h":
        return "Messages disappear after 24 hours";
      case "1week":
        return "Messages disappear after 1 week";
      case "1month":
        return "Messages disappear after 30 days";
      case "forever":
        return "Messages are saved";
      default:
        return "";
    }
  };

  const getRetentionIcon = () => {
    switch (chatRetention) {
      case "24h":
        return "clock-fast";
      case "1week":
        return "clock-outline";
      case "1month":
        return "calendar-clock";
      case "forever":
        return "infinity";
      default:
        return "timer-sand";
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
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setSettingsVisible(true)}
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
            <Pressable onPress={() => setSettingsVisible(true)}>
              <IconButton
                icon="dots-vertical"
                iconColor={theme.colors.onSurface}
                size={24}
              />
            </Pressable>
          </BlurView>
        )}

        {/* Retention Period Indicator */}
        {chatRetention !== "forever" && (
          <Pressable
            onPress={() => setSettingsVisible(true)}
            style={[
              styles.retentionBanner,
              {
                backgroundColor: theme.dark
                  ? "rgba(127, 124, 230, 0.15)"
                  : "rgba(127, 124, 230, 0.1)",
              },
            ]}
          >
            <IconButton
              icon={getRetentionIcon()}
              size={16}
              iconColor={theme.colors.primary}
              style={{ margin: 0 }}
            />
            <Text
              style={[styles.retentionText, { color: theme.colors.primary }]}
            >
              {getRetentionLabel()}
            </Text>
            <IconButton
              icon="chevron-right"
              size={14}
              iconColor={theme.colors.primary}
              style={{ margin: 0, opacity: 0.6 }}
            />
          </Pressable>
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
              {isBlocked ? (
                <View
                  style={[
                    styles.blockedContainer,
                    {
                      backgroundColor: theme.colors.errorContainer,
                      borderColor: theme.colors.error,
                    },
                  ]}
                >
                  <IconButton
                    icon="block-helper"
                    iconColor={theme.colors.error}
                    size={20}
                  />
                  <Text
                    style={[styles.blockedText, { color: theme.colors.error }]}
                  >
                    You can't send messages in this conversation
                  </Text>
                </View>
              ) : (
                <>
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
                </>
              )}
            </View>
          </BlurView>
        </KeyboardAvoidingView>

        {/* Bottom Sheets */}
        <ChatSettingsBottomSheet
          visible={settingsVisible}
          onDismiss={() => setSettingsVisible(false)}
          onReportUser={() => setNextAction("report")}
          onBlockUser={() => setNextAction("block")}
          onModalHide={() => {
            if (nextAction === "report") {
              setReportVisible(true);
            } else if (nextAction === "block") {
              setBlockVisible(true);
            }
            setNextAction(null);
          }}
          currentRetention={chatRetention}
          onRetentionChange={handleRetentionChange}
          userName={otherUserName}
        />

        <ReportBottomSheet
          visible={reportVisible}
          onDismiss={() => setReportVisible(false)}
          onSubmit={handleReport}
          contentType="user"
        />

        <BlockUserBottomSheet
          visible={blockVisible}
          onDismiss={() => setBlockVisible(false)}
          onConfirm={handleBlock}
          userName={otherUserName}
        />
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
  retentionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: liquidGlass.spacing.cozy,
    marginTop: Platform.OS === "ios" ? 80 : 8,
    marginBottom: 8,
    borderRadius: liquidGlass.corners.medium,
    gap: 4,
  },
  retentionText: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
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
  blockedContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: liquidGlass.corners.medium,
    borderWidth: 1,
    gap: 8,
  },
  blockedText: {
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
});
