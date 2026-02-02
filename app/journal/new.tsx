import GlassView from "@/components/GlassView";
import GlassButton from "@/components/ui/GlassButton";
import { db, storage } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { MOODS, MoodType } from "@/types/journal";
import { MOOD_VALUES } from "@/utils/moodStats";
import { Filter } from "bad-words";
import { format } from "date-fns";
import {
  AudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { BlurView } from "expo-blur";
import { File } from "expo-file-system";
import { Stack, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
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

export default function NewJournalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [mood, setMood] = useState<MoodType>("happy");
  const [note, setNote] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);

  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.5)).current;

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const playerRef = useRef<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio mode once on mount
  useEffect(() => {
    const initAudio = async () => {
      try {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      } catch (error) {
        // Silently ignore - we'll try again when recording starts
        console.log("Audio mode will be initialized on first recording");
      }
    };
    initAudio();
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permissions first
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        alert("Microphone permission is required to record audio");
        return;
      }

      // Ensure audio mode is set (in case mount initialization failed)
      try {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      } catch (e) {
        // Continue anyway - recorder might still work
      }

      // Start recording
      await recorder.record();
      setRecordingStartTime(Date.now());
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording", error);
      alert("Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri; // It's a property, not a method

      // Calculate duration manually from start time
      const recordingEndTime = Date.now();
      const durationMs = recordingEndTime - recordingStartTime;
      const duration = Math.floor(durationMs / 1000);

      if (uri) {
        setAudioUri(uri);
        setAudioDuration(
          duration > 0
            ? duration
            : Math.floor(recorderState.durationMillis / 1000),
        );
      }

      setIsRecording(false);
    } catch (error) {
      console.error("Failed to stop recording", error);
      setIsRecording(false);
    }
  };

  const playAudio = async () => {
    try {
      if (!audioUri) return;

      if (isPlaying && playerRef.current) {
        playerRef.current.pause();
        setIsPlaying(false);
      } else {
        // Create player if it doesn't exist
        if (!playerRef.current) {
          playerRef.current = new AudioPlayer(audioUri);
        }

        playerRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Failed to play audio", error);
      setIsPlaying(false);
    }
  };

  const uploadAudio = async (uri: string) => {
    if (!user) throw new Error("No user logged in");

    try {
      // Create a File instance - it implements Blob interface
      const file = new File(uri);

      const filename = `${Date.now()}.m4a`;
      const storageRef = ref(storage, `journal_audio/${user.uid}/${filename}`);

      // Upload with explicit metadata for content type validation
      const metadata = {
        contentType: "audio/m4a",
      };

      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error("Upload audio error:", error);
      throw error;
    }
  };

  const deleteAudio = () => {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.remove();
      playerRef.current = null;
    }
    setIsPlaying(false);
    setAudioUri(null);
    setAudioDuration(0);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!note.trim() && !audioUri) {
      alert("Please add a note or audio recording");
      return;
    }

    // Check for profanity in note
    if (note.trim()) {
      const filter = new Filter();
      if (filter.isProfane(note)) {
        alert(
          "Your journal entry contains inappropriate language. Please revise your content to comply with our community guidelines.",
        );
        return;
      }
    }

    setLoading(true);
    try {
      let audioUrl: string | undefined;

      if (audioUri) {
        setIsUploading(true);
        audioUrl = await uploadAudio(audioUri);
        setIsUploading(false);
      }

      // 1. Add Journal Entry
      await addDoc(collection(db, CollectionNames.JOURNALS), {
        userId: user.uid,
        mood,
        note,
        ...(audioUrl && { audioUrl }), // Only include if audioUrl exists
        ...(audioUrl && { audioDuration }), // Only include if audio was recorded
        isAnonymous,
        createdAt: Date.now(),
        dateString: format(new Date(), "yyyy-MM-dd"),
      });

      // 2. Update User Stats for Connection Matching
      const userRef = doc(db, CollectionNames.USERS, user.uid);
      const userSnap = await getDoc(userRef);

      let currentHistory: number[] = [];
      if (userSnap.exists()) {
        const data = userSnap.data();
        currentHistory = data.moodHistory || [];
      }

      // Keep last 7 entries for simplicity or last 7 days
      const newVal = MOOD_VALUES[mood];
      const newHistory = [newVal, ...currentHistory].slice(0, 7);
      const avgMood = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;

      await setDoc(
        userRef,
        {
          uid: user.uid,
          displayName: user.displayName || "Vibe User",
          lastMood: mood,
          averageMood: avgMood,
          moodHistory: newHistory,
          lastActive: Date.now(),
          isAnonymousProfile: isAnonymous,
        },
        { merge: true },
      );

      // Show success animation
      setShowSuccess(true);
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate back after animation
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("Failed to save entry");
    } finally {
      setLoading(false);
      setIsUploading(false);
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
            <Appbar.Content title="New Journal Entry" />
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
              iconColor={theme.colors.onSurface}
              onPress={() => router.back()}
              style={styles.backButton}
            />
            <Text
              variant="titleLarge"
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              New Journal Entry
            </Text>
            <View style={{ width: 48 }} />
          </BlurView>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Main Input Card */}
            <GlassView
              variant="card"
              intensity="medium"
              style={styles.mainCard}
            >
              <TextInput
                mode="outlined"
                placeholder="How's your day going? Write your thoughts..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={note}
                onChangeText={setNote}
                style={[
                  styles.input,
                  {
                    backgroundColor: "transparent",
                    color: theme.colors.onSurface,
                  },
                ]}
                multiline
                autoFocus
                outlineColor="transparent"
                activeOutlineColor="transparent"
              />

              {/* Audio Recording Section */}
              {!audioUri ? (
                <View style={styles.audioSection}>
                  {!isRecording ? (
                    <Pressable
                      onPress={startRecording}
                      style={[
                        styles.recordButton,
                        {
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        },
                      ]}
                    >
                      <IconButton
                        icon="microphone"
                        size={20}
                        iconColor={theme.colors.primary}
                        style={{ margin: 0 }}
                      />
                      <Text
                        variant="labelMedium"
                        style={{ color: theme.colors.onSurfaceVariant }}
                      >
                        Record Audio Note
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={stopRecording}
                      style={[
                        styles.recordButton,
                        {
                          backgroundColor: theme.colors.errorContainer,
                        },
                      ]}
                    >
                      <IconButton
                        icon="stop-circle"
                        size={20}
                        iconColor={theme.colors.error}
                        style={{ margin: 0 }}
                      />
                      <Text
                        variant="labelMedium"
                        style={{ color: theme.colors.error }}
                      >
                        Stop Recording
                      </Text>
                    </Pressable>
                  )}
                </View>
              ) : (
                <View style={styles.audioPreview}>
                  <View style={styles.audioInfo}>
                    <IconButton
                      icon="music-note"
                      size={24}
                      iconColor={theme.colors.primary}
                      style={{ margin: 0 }}
                    />
                    <View style={styles.audioDetails}>
                      <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.onSurface }}
                      >
                        Audio Recording
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{ color: theme.colors.onSurfaceVariant }}
                      >
                        {audioDuration}s
                      </Text>
                    </View>
                  </View>
                  <View style={styles.audioActions}>
                    <IconButton
                      icon={isPlaying ? "pause" : "play"}
                      size={20}
                      iconColor={theme.colors.primary}
                      onPress={playAudio}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={deleteAudio}
                    />
                  </View>
                </View>
              )}

              {isUploading && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                  <Text
                    variant="bodySmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginLeft: 8,
                    }}
                  >
                    Uploading audio...
                  </Text>
                </View>
              )}

              {/* Compact Mood Selector */}
              <View style={styles.compactMoodRow}>
                <Text
                  variant="labelMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Mood
                </Text>
                <View style={styles.compactMoodButtons}>
                  {(Object.keys(MOODS) as MoodType[]).map((moodKey) => (
                    <Pressable
                      key={moodKey}
                      onPress={() => setMood(moodKey)}
                      style={[
                        styles.compactMoodButton,
                        {
                          backgroundColor:
                            mood === moodKey
                              ? theme.colors.primaryContainer
                              : "transparent",
                        },
                      ]}
                    >
                      <IconButton
                        icon={MOODS[moodKey].icon}
                        size={18}
                        iconColor={
                          mood === moodKey
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant
                        }
                        style={{ margin: 0 }}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Bottom Action Bar */}
              <View style={styles.actionBar}>
                <View style={styles.actionButtons}>
                  <Pressable
                    onPress={() => setIsAnonymous(!isAnonymous)}
                    style={[
                      styles.anonymousButton,
                      {
                        backgroundColor: isAnonymous
                          ? theme.colors.tertiaryContainer
                          : "transparent",
                      },
                    ]}
                  >
                    <IconButton
                      icon="incognito"
                      size={18}
                      iconColor={
                        isAnonymous
                          ? theme.colors.tertiary
                          : theme.colors.onSurfaceVariant
                      }
                      style={{ margin: 0 }}
                    />
                  </Pressable>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: isAnonymous
                        ? theme.colors.tertiary
                        : theme.colors.onSurfaceVariant,
                    }}
                  >
                    {isAnonymous ? "Anonymous" : "Public"}
                  </Text>
                </View>

                <GlassButton
                  variant="primary"
                  onPress={handleSave}
                  disabled={
                    (!note.trim() && !audioUri) || loading || isUploading
                  }
                  style={styles.saveButton}
                >
                  {loading ? "Saving..." : "Save"}
                </GlassButton>
              </View>
            </GlassView>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Success Animation Overlay */}
        {showSuccess && (
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successOpacity,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.successContent,
                {
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <View
                style={[
                  styles.successIcon,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <IconButton
                  icon="check"
                  size={48}
                  iconColor="#fff"
                  style={{ margin: 0 }}
                />
              </View>
              <Text
                variant="headlineSmall"
                style={[
                  styles.successText,
                  { color: theme.colors.onBackground },
                ]}
              >
                Entry Saved!
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Your journal entry has been saved
              </Text>
            </Animated.View>
          </Animated.View>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: liquidGlass.spacing.comfortable,
    paddingTop: Platform.OS === "ios" ? 90 : 8,
    paddingBottom: liquidGlass.spacing.breathe * 2,
  },
  mainCard: {
    padding: liquidGlass.spacing.comfortable,
  },
  input: {
    minHeight: 120,
    borderRadius: liquidGlass.corners.medium,
    textAlignVertical: "top",
    fontSize: 16,
    lineHeight: 24,
  },
  audioSection: {
    marginTop: liquidGlass.spacing.cozy,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: liquidGlass.spacing.cozy,
    borderRadius: liquidGlass.corners.medium,
    gap: liquidGlass.spacing.intimate,
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: liquidGlass.spacing.cozy,
    padding: liquidGlass.spacing.cozy,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: liquidGlass.corners.medium,
  },
  audioInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: liquidGlass.spacing.intimate,
  },
  audioDetails: {
    flex: 1,
  },
  audioActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: liquidGlass.spacing.cozy,
    padding: liquidGlass.spacing.cozy,
    borderRadius: liquidGlass.corners.small,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  compactMoodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: liquidGlass.spacing.cozy,
    marginTop: liquidGlass.spacing.cozy,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  compactMoodButtons: {
    flexDirection: "row",
    gap: 4,
  },
  compactMoodButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: liquidGlass.spacing.cozy,
    marginTop: liquidGlass.spacing.cozy,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: liquidGlass.spacing.intimate,
  },
  anonymousButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    paddingHorizontal: liquidGlass.spacing.comfortable,
    paddingVertical: liquidGlass.spacing.intimate,
    minWidth: 100,
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  successContent: {
    alignItems: "center",
    gap: liquidGlass.spacing.cozy,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: liquidGlass.spacing.intimate,
  },
  successText: {
    fontWeight: "700",
    textAlign: "center",
  },
});
