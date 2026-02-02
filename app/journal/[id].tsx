import GlassView from "@/components/GlassView";
import { db } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { JournalEntry, MOODS } from "@/types/journal";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { BlurView } from "expo-blur";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Avatar, IconButton, Text, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function JournalDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const player = useAudioPlayer(entry?.audioUrl || undefined);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    if (!id || !user) return;
    try {
      const docRef = doc(db, CollectionNames.JOURNALS, id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEntry({ ...docSnap.data(), id: docSnap.id } as JournalEntry);
      }
    } catch (error) {
      console.error("Error fetching journal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async () => {
    if (!entry) return;
    try {
      await updateDoc(doc(db, CollectionNames.JOURNALS, entry.id), {
        pinned: !(entry as any).pinned,
      });
      setEntry({ ...entry, pinned: !(entry as any).pinned } as any);
    } catch (error) {
      console.error("Error pinning journal:", error);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    try {
      await deleteDoc(doc(db, CollectionNames.JOURNALS, entry.id));
      router.back();
    } catch (error) {
      console.error("Error deleting journal:", error);
    }
  };

  if (loading || !entry) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={["top"]}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Loading..." />
          </Appbar.Header>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        {Platform.OS === "android" ? (
          <Appbar.Header elevated>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title={MOODS[entry.mood].label} />
            <Appbar.Action
              icon={(entry as any).pinned ? "pin" : "pin-outline"}
              onPress={handlePin}
            />
            <Appbar.Action icon="delete-outline" onPress={handleDelete} />
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
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => router.back()}
              iconColor={theme.colors.onSurface}
            />
            <Text
              variant="titleLarge"
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              {MOODS[entry.mood].label}
            </Text>
            <View style={styles.headerActions}>
              <IconButton
                icon={(entry as any).pinned ? "pin" : "pin-outline"}
                size={20}
                onPress={handlePin}
                iconColor={theme.colors.primary}
              />
              <IconButton
                icon="delete-outline"
                size={20}
                onPress={handleDelete}
                iconColor={theme.colors.error}
              />
            </View>
          </BlurView>
        )}

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mood Card */}
          <GlassView variant="card" intensity="medium" style={styles.moodCard}>
            <View style={styles.moodHeader}>
              <Avatar.Icon
                size={56}
                icon={MOODS[entry.mood].icon}
                style={{ backgroundColor: MOODS[entry.mood].color }}
              />
              <View style={styles.moodInfo}>
                <Text
                  variant="headlineSmall"
                  style={{ color: theme.colors.onSurface }}
                >
                  {MOODS[entry.mood].label}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {new Date(entry.createdAt).toLocaleDateString()} •{" "}
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </GlassView>

          {/* Note Card */}
          {entry.note && (
            <GlassView
              variant="card"
              intensity="medium"
              style={styles.noteCard}
            >
              <Text
                variant="labelLarge"
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Journal Entry
              </Text>
              <Text
                variant="bodyLarge"
                style={[styles.noteText, { color: theme.colors.onSurface }]}
              >
                {entry.note}
              </Text>
            </GlassView>
          )}

          {/* Audio Card */}
          {entry.audioUrl && (
            <GlassView
              variant="card"
              intensity="medium"
              style={styles.audioCard}
            >
              <Text
                variant="labelLarge"
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Audio Recording
              </Text>
              <View style={styles.audioPlayer}>
                <IconButton
                  icon={player.playing ? "pause-circle" : "play-circle"}
                  size={48}
                  iconColor={theme.colors.primary}
                  onPress={() =>
                    player.playing ? player.pause() : player.play()
                  }
                />
                <View style={styles.audioInfo}>
                  <Ionicons name="mic" size={20} color={theme.colors.primary} />
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginLeft: 8,
                    }}
                  >
                    {entry.audioDuration || 0}s
                  </Text>
                </View>
              </View>
            </GlassView>
          )}
        </ScrollView>
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
    paddingVertical: liquidGlass.spacing.intimate,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontWeight: "600",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 100 : 16,
    paddingHorizontal: liquidGlass.spacing.cozy,
    paddingBottom: liquidGlass.spacing.breathe * 2,
  },
  moodCard: {
    padding: liquidGlass.spacing.comfortable,
    marginBottom: liquidGlass.spacing.comfortable,
  },
  moodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: liquidGlass.spacing.cozy,
  },
  moodInfo: {
    flex: 1,
  },
  noteCard: {
    padding: liquidGlass.spacing.comfortable,
    marginBottom: liquidGlass.spacing.comfortable,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: liquidGlass.spacing.cozy,
    letterSpacing: 0.5,
  },
  noteText: {
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  audioCard: {
    padding: liquidGlass.spacing.comfortable,
    marginBottom: liquidGlass.spacing.comfortable,
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    gap: liquidGlass.spacing.cozy,
  },
  audioInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
});
