import { MultiAvatar } from "@/components/MultiAvatar";
import GlassButton from "@/components/ui/GlassButton";
import GlassCard from "@/components/ui/GlassCard";
import { db } from "@/configs/firebaseConfig";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Chip,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface UserProfile {
  uid: string;
  anonymousAlias: string;
  averageMood: number;
  lastMood: string;
  isAnonymousProfile: boolean;
  photoURL?: string;
}

// Separate component for suggestion card to use hooks properly
interface SuggestionCardProps {
  item: UserProfile;
  onStartConversation: (user: UserProfile) => void;
  getCompatibilityScore: (averageMood: number) => number;
  getMatchReason: (compatibility: number) => string;
  getMoodColor: (averageMood: number) => string;
  getMoodEmoji: (mood: string) => string;
}

function SuggestionCard({
  item,
  onStartConversation,
  getCompatibilityScore,
  getMatchReason,
  getMoodColor,
  getMoodEmoji,
}: SuggestionCardProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const compatibility = getCompatibilityScore(item.averageMood);
  const matchReason = getMatchReason(compatibility);

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
      style={[styles.suggestionCard, { transform: [{ scale: scaleAnim }] }]}
    >
      <GlassCard intensity="medium">
        <View style={styles.profileSection}>
          {item.isAnonymousProfile ? (
            <Avatar.Icon
              icon="incognito"
              size={56}
              style={[
                styles.avatar,
                { backgroundColor: getMoodColor(item.averageMood) },
              ]}
            />
          ) : (
            <MultiAvatar userId={item.uid} photoURL={item.photoURL} size={56} />
          )}
          <View style={styles.profileInfo}>
            <Text
              variant="titleMedium"
              style={[styles.profileName, { color: theme.colors.onSurface }]}
            >
              {item.isAnonymousProfile
                ? "Anonymous Soul"
                : item.anonymousAlias || "Vibe User"}
            </Text>
            <View style={styles.moodBadges}>
              <Chip
                icon="chart-line"
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.colors.primaryContainer,
                  },
                ]}
                textStyle={{
                  fontSize: 11,
                  color: theme.colors.onPrimaryContainer,
                }}
              >
                Avg: {item.averageMood?.toFixed(1) || "?"}
              </Chip>
              <Chip
                icon="emoticon"
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.colors.secondaryContainer,
                  },
                ]}
                textStyle={{
                  fontSize: 11,
                  color: theme.colors.onSecondaryContainer,
                }}
              >
                {getMoodEmoji(item.lastMood)} {item.lastMood || "unknown"}
              </Chip>
            </View>
          </View>
        </View>

        {/* Compatibility Meter */}
        <View style={styles.compatibilitySection}>
          <View style={styles.compatibilityHeader}>
            <Text
              variant="labelMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Match Quality
            </Text>
            <Text
              variant="labelLarge"
              style={{
                color:
                  compatibility >= 70
                    ? theme.colors.secondary
                    : theme.colors.primary,
                fontWeight: "700",
              }}
            >
              {compatibility}%
            </Text>
          </View>
          <View
            style={[
              styles.compatibilityBar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <View
              style={[
                styles.compatibilityFill,
                {
                  width: `${compatibility}%`,
                  backgroundColor:
                    compatibility >= 70
                      ? theme.colors.secondary
                      : theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: 4,
              fontStyle: "italic",
            }}
          >
            {matchReason}
          </Text>
        </View>

        <View style={styles.actionSection}>
          <GlassButton
            variant="primary"
            onPress={() => onStartConversation(item)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.connectButton}
          >
            Start Conversation
          </GlassButton>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function ConnectScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [currentUserStats, setCurrentUserStats] = useState<UserProfile | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const fetchSuggestions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let myStats: UserProfile | null = null;

      if (userSnap.exists()) {
        myStats = userSnap.data() as UserProfile;
        setCurrentUserStats(myStats);
      }

      const q = query(collection(db, "users"), where("uid", "!=", user.uid));
      const querySnapshot = await getDocs(q);

      const potentials: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        potentials.push(doc.data() as UserProfile);
      });

      // Get blocked users
      const blockedSnapshot = await getDocs(
        collection(db, "users", user.uid, "blockedUsers"),
      );
      const blockedUserIds = blockedSnapshot.docs.map((doc) => doc.id);

      // Get users who blocked current user
      const allUsersSnapshot = await getDocs(collection(db, "users"));
      const usersWhoBlockedMe: string[] = [];
      for (const userDoc of allUsersSnapshot.docs) {
        if (userDoc.id === user.uid) continue;
        const blockedByThemDoc = await getDoc(
          doc(db, "users", userDoc.id, "blockedUsers", user.uid),
        );
        if (blockedByThemDoc.exists()) {
          usersWhoBlockedMe.push(userDoc.id);
        }
      }

      const myAvg = myStats?.averageMood || 3;
      const filtered = potentials.filter((p) => {
        // Filter out blocked users and users who blocked current user
        if (
          blockedUserIds.includes(p.uid) ||
          usersWhoBlockedMe.includes(p.uid)
        ) {
          return false;
        }
        const diff = Math.abs(p.averageMood - myAvg);
        return diff <= 1.5;
      });

      setSuggestions(filtered);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      happy: "😊",
      excited: "🤩",
      neutral: "😐",
      sad: "😔",
      stressed: "😰",
    };
    return moodMap[mood] || "🙂";
  };

  const getMoodColor = (moodValue: number) => {
    if (moodValue >= 4) return theme.colors.secondary;
    if (moodValue >= 3) return theme.colors.primary;
    return theme.colors.tertiary;
  };

  const getCompatibilityScore = (otherAvg: number) => {
    const myAvg = currentUserStats?.averageMood || 3;
    const diff = Math.abs(myAvg - otherAvg);
    const score = Math.max(0, 100 - diff * 35); // Scale difference to percentage
    return Math.round(score);
  };

  const getMatchReason = (score: number) => {
    if (score >= 85) return "Very similar emotional wavelength";
    if (score >= 70) return "Compatible vibes for meaningful connection";
    return "Close enough for interesting conversation";
  };

  const startConversation = async (otherUser: UserProfile) => {
    if (!user) return;

    try {
      // Check if current user has blocked the other user
      const currentUserBlockedDoc = await getDoc(
        doc(db, "users", user.uid, "blockedUsers", otherUser.uid),
      );
      if (currentUserBlockedDoc.exists()) {
        Alert.alert(
          "Cannot Connect",
          "You have blocked this user. Unblock them to start a conversation.",
        );
        return;
      }

      // Check if the other user has blocked current user
      const otherUserBlockedDoc = await getDoc(
        doc(db, "users", otherUser.uid, "blockedUsers", user.uid),
      );
      if (otherUserBlockedDoc.exists()) {
        Alert.alert(
          "Cannot Connect",
          "This user is not available for conversations.",
        );
        return;
      }

      // Check if a chat already exists between these two users
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", user.uid),
      );
      const querySnapshot = await getDocs(q);

      let existingChatId: string | null = null;

      // Check if any of the chats contain both users
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        if (
          chatData.participants.includes(user.uid) &&
          chatData.participants.includes(otherUser.uid) &&
          chatData.participants.length === 2
        ) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        // Navigate to existing chat
        router.push(`/chat/${existingChatId}`);
      } else {
        // Create new chat
        const newChatRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, otherUser.uid],
          lastMessage: "",
          lastMessageTimestamp: Date.now(),
          type: "1:1",
          createdAt: Date.now(),
        });

        // Navigate to new chat
        router.push(`/chat/${newChatRef.id}`);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
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
            <Appbar.Content
              title="Connect Mindfully"
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
            <View style={styles.headerLeft}>
              <Text
                variant="headlineSmall"
                style={[styles.headerTitle, { color: theme.colors.onSurface }]}
              >
                Connect Mindfully
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
              >
                Your vibe: {currentUserStats?.averageMood?.toFixed(1) || "N/A"}{" "}
                {getMoodEmoji(currentUserStats?.lastMood || "neutral")}
              </Text>
            </View>
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
            data={suggestions}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={{
              paddingTop: Platform.OS === "ios" ? 100 : 8,
              paddingBottom: 120,
              paddingHorizontal: liquidGlass.spacing.cozy,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SuggestionCard
                item={item}
                onStartConversation={startConversation}
                getCompatibilityScore={getCompatibilityScore}
                getMatchReason={getMatchReason}
                getMoodColor={getMoodColor}
                getMoodEmoji={getMoodEmoji}
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
                  No matches found yet.{"\n"}
                  Keep journaling to improve matches!
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
    paddingHorizontal: liquidGlass.spacing.cozy,
    paddingVertical: liquidGlass.spacing.cozy,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerLeft: {
    flex: 1,
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
  suggestionCard: {
    marginVertical: liquidGlass.spacing.intimate,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: liquidGlass.spacing.cozy,
  },
  avatar: {
    marginRight: liquidGlass.spacing.cozy,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontWeight: "600",
    marginBottom: liquidGlass.spacing.intimate / 2,
  },
  moodBadges: {
    flexDirection: "row",
    gap: liquidGlass.spacing.intimate / 2,
    flexWrap: "wrap",
  },
  chip: {
    height: 26,
  },
  compatibilitySection: {
    marginTop: liquidGlass.spacing.cozy,
    marginBottom: liquidGlass.spacing.intimate,
  },
  compatibilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: liquidGlass.spacing.tight,
  },
  compatibilityBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  compatibilityFill: {
    height: "100%",
    borderRadius: 4,
  },
  actionSection: {
    marginTop: liquidGlass.spacing.cozy,
  },
  connectButton: {
    width: "100%",
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
