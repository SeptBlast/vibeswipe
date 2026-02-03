import GlassView from "@/components/GlassView";
import { db } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { JournalEntry, MOODS } from "@/types/journal";
import { calculateJournalStreak } from "@/utils/journalStreak";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useAudioPlayer } from "expo-audio";
import { BlurView } from "expo-blur";
import { useFocusEffect, useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Appbar, Avatar, IconButton, Text, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function JournalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { preferences } = useNotifications();
  const insets = useSafeAreaInsets();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [showActionsForId, setShowActionsForId] = useState<string | null>(null);
  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    longestStreak: number;
  }>({ currentStreak: 0, longestStreak: 0 });

  const fetchJournals = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, CollectionNames.JOURNALS),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const fetchedEntries: JournalEntry[] = [];
      const marks: any = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data() as JournalEntry;
        fetchedEntries.push({ ...data, id: doc.id });

        // Mark the date with mood color as dot
        const moodColor = MOODS[data.mood]?.color || theme.colors.primary;
        marks[data.dateString] = {
          marked: true,
          dotColor: moodColor,
          selected: data.dateString === selectedDate,
          selectedColor: theme.colors.primaryContainer,
          selectedTextColor: theme.colors.onPrimaryContainer,
        };
      });

      setEntries(fetchedEntries);
      setMarkedDates(marks);

      // Calculate streak data
      const streak = await calculateJournalStreak(user.uid);
      setStreakData({
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
      });
    } catch (error) {
      console.error("Error fetching journals: ", error);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [user]);

  // Refetch journals when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchJournals();
    }, [user]),
  );

  // Filter entries for selected date
  const todaysEntries = entries.filter((e) => e.dateString === selectedDate);

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteDoc(doc(db, CollectionNames.JOURNALS, entryId));
      await fetchJournals();
    } catch (error) {
      console.error("Error deleting journal:", error);
    }
  };

  const handlePinEntry = async (entryId: string, currentPinned: boolean) => {
    try {
      await updateDoc(doc(db, CollectionNames.JOURNALS, entryId), {
        pinned: !currentPinned,
      });
      await fetchJournals();
    } catch (error) {
      console.error("Error pinning journal:", error);
    }
  };

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleFabPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
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
              title="Mood Journal"
              titleStyle={{ fontWeight: "600" }}
            />
            <Text
              variant="labelLarge"
              style={{ fontWeight: "bold", color: "#ed9e1f", marginRight: 8 }}
            >
              {streakData.currentStreak.toString()} 🔥
            </Text>
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
              { paddingTop: insets.top + liquidGlass.spacing.intimate },
            ]}
          >
            <View>
              <Text
                variant="headlineSmall"
                style={[styles.headerTitle, { color: theme.colors.onSurface }]}
              >
                Mood Journal
              </Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.streakBadge}>
                <Text
                  variant="labelLarge"
                  style={{ fontWeight: "bold", color: "#ed9e1f" }}
                >
                  {streakData.currentStreak.toString()} 🔥
                </Text>
              </View>
              <IconButton
                icon="account-circle"
                size={28}
                iconColor={theme.colors.onSurface}
                onPress={() => router.push("/profile")}
              />
            </View>
          </BlurView>
        )}

        <GlassView
          variant="card"
          intensity="medium"
          style={styles.calendarCard}
        >
          <Calendar
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: theme.colors.onSurfaceVariant,
              selectedDayBackgroundColor: theme.colors.primaryContainer,
              selectedDayTextColor: theme.colors.onPrimaryContainer,
              todayTextColor: theme.colors.secondary,
              dayTextColor: theme.colors.onSurface,
              textDisabledColor: `${theme.colors.onSurfaceVariant}40`,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.onSurface,
              textDayFontWeight: "500",
              textMonthFontWeight: "700",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 12,
            }}
          />
        </GlassView>

        <ScrollView
          style={styles.entriesList}
          contentContainerStyle={styles.entriesContent}
          showsVerticalScrollIndicator={false}
        >
          <Text
            variant="titleMedium"
            style={[styles.entriesTitle, { color: theme.colors.onSurface }]}
          >
            {selectedDate}
          </Text>
          {todaysEntries.length === 0 ? (
            <GlassView
              variant="card"
              intensity="light"
              style={styles.emptyCard}
            >
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                No entries for this day.
              </Text>
            </GlassView>
          ) : (
            todaysEntries.map((entry) => {
              const hasAudio = !!entry.audioUrl;
              const showActions = showActionsForId === entry.id;
              return (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  hasAudio={hasAudio}
                  showActions={showActions}
                  theme={theme}
                  router={router}
                  onShowActions={() => setShowActionsForId(entry.id)}
                  onHideActions={() => setShowActionsForId(null)}
                  onPin={() => handlePinEntry(entry.id, (entry as any).pinned)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                />
              );
            })
          )}
        </ScrollView>

        {/* New Journal FAB - Bottom Right */}
        <Pressable
          onPress={() => router.push("/journal/new")}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          style={styles.fabContainer}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View
              style={[
                styles.fab,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Ionicons name="add" size={28} color={theme.colors.onPrimary} />
            </View>
          </Animated.View>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

// JournalEntryCard Component with Swipe Gesture
function JournalEntryCard({
  entry,
  hasAudio,
  showActions,
  theme,
  router,
  onShowActions,
  onHideActions,
  onPin,
  onDelete,
}: {
  entry: JournalEntry;
  hasAudio: boolean;
  showActions: boolean;
  theme: any;
  router: any;
  onShowActions: () => void;
  onHideActions: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const translateX = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        return (
          Math.abs(gestureState.dx) > 5 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0 && gestureState.dx > -120) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -60) {
          // Swipe threshold
          Animated.spring(translateX, {
            toValue: -100,
            useNativeDriver: true,
          }).start();
          onShowActions();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          onHideActions();
        }
      },
    }),
  ).current;

  React.useEffect(() => {
    if (!showActions) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [showActions]);

  return (
    <GlassView variant="card" intensity="medium" style={styles.entryCard}>
      <View style={styles.swipeContainer}>
        {/* Action Buttons Behind */}
        <View style={styles.actionButtons}>
          <Pressable
            onPress={() => {
              onPin();
              onHideActions();
            }}
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Ionicons
              name={(entry as any).pinned ? "pin" : "pin-outline"}
              size={16}
              color="#fff"
            />
          </Pressable>
          <Pressable
            onPress={() => {
              onDelete();
              onHideActions();
            }}
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.error },
            ]}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
          </Pressable>
        </View>

        {/* Swipeable Content */}
        <Animated.View
          style={[
            styles.swipeableContent,
            {
              transform: [{ translateX }],
              backgroundColor: theme.dark
                ? "rgba(30, 30, 30, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Pressable
            onPress={() => router.push(`/journal/${entry.id}`)}
            onLongPress={showActions ? onHideActions : onShowActions}
            delayLongPress={500}
          >
            <View style={styles.entryHeader}>
              <View style={styles.entryTitleRow}>
                <Avatar.Icon
                  size={36}
                  icon={MOODS[entry.mood].icon}
                  style={{ backgroundColor: MOODS[entry.mood].color }}
                />
                <View style={styles.entryTitleText}>
                  <View style={styles.titleWithIcons}>
                    <Text
                      variant="titleSmall"
                      style={{ color: theme.colors.onSurface }}
                    >
                      {MOODS[entry.mood].label}
                    </Text>
                    {hasAudio && (
                      <Ionicons
                        name="mic"
                        size={14}
                        color={theme.colors.primary}
                        style={{ marginLeft: 6 }}
                      />
                    )}
                  </View>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </GlassView>
  );
}

// AudioPlayer Component (kept for potential future use)
function AudioPlayer({
  audioUrl,
  audioDuration,
  theme,
}: {
  audioUrl: string;
  audioDuration: number;
  theme: any;
}) {
  const player = useAudioPlayer(audioUrl);

  return (
    <View style={audioPlayerStyles.container}>
      <View style={audioPlayerStyles.controls}>
        <IconButton
          icon={player.playing ? "pause" : "play"}
          size={24}
          iconColor={theme.colors.primary}
          onPress={() => (player.playing ? player.pause() : player.play())}
        />
        <View style={audioPlayerStyles.info}>
          <Ionicons name="mic" size={16} color={theme.colors.primary} />
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}
          >
            {audioDuration}s
          </Text>
        </View>
      </View>
    </View>
  );
}

const audioPlayerStyles = StyleSheet.create({
  container: {
    marginTop: liquidGlass.spacing.cozy,
    paddingTop: liquidGlass.spacing.cozy,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: liquidGlass.spacing.intimate,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
  },
});

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
    paddingVertical: liquidGlass.spacing.intimate,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: liquidGlass.spacing.intimate,
  },
  streakBadge: {
    paddingHorizontal: liquidGlass.spacing.intimate,
    paddingVertical: 4,
  },
  calendarCard: {
    marginTop: Platform.OS === "ios" ? 90 : 8,
    marginHorizontal: liquidGlass.spacing.cozy,
    marginBottom: liquidGlass.spacing.comfortable,
    padding: liquidGlass.spacing.intimate,
  },
  entriesList: {
    flex: 1,
  },
  entriesContent: {
    paddingHorizontal: liquidGlass.spacing.cozy,
    paddingBottom: 120,
  },
  entriesTitle: {
    fontWeight: "600",
    marginBottom: liquidGlass.spacing.cozy,
  },
  emptyCard: {
    padding: liquidGlass.spacing.breathe,
    alignItems: "center",
  },
  emptyText: {
    fontStyle: "italic",
    textAlign: "center",
  },
  entryCard: {
    marginBottom: liquidGlass.spacing.cozy,
    padding: 0,
    overflow: "hidden",
  },
  swipeContainer: {
    position: "relative",
  },
  actionButtons: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: liquidGlass.spacing.cozy,
    zIndex: 0,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: liquidGlass.spacing.intimate,
  },
  swipeableContent: {
    padding: liquidGlass.spacing.comfortable,
    borderRadius: liquidGlass.corners.large,
    zIndex: 1,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: liquidGlass.spacing.intimate,
    flex: 1,
  },
  entryTitleText: {
    flex: 1,
  },
  titleWithIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandedContent: {
    marginTop: liquidGlass.spacing.cozy,
    paddingTop: liquidGlass.spacing.cozy,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  entryNote: {
    lineHeight: 22,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  fabContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 125 : 76,
    right: liquidGlass.spacing.comfortable,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
