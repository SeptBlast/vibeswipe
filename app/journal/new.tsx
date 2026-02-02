import GlassView from "@/components/GlassView";
import MoodSelector from "@/components/MoodSelector";
import GlassButton from "@/components/ui/GlassButton";
import { db, storage } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { MoodType } from "@/types/journal";
import { MOOD_VALUES } from "@/utils/moodStats";
import { format } from "date-fns";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { BlurView } from "expo-blur";
import { Stack, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Appbar,
  IconButton,
  Switch,
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

  const [mood, setMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(audioUri || undefined);

  // Initialize audio mode on component mount
  useEffect(() => {
    const initAudioMode = async () => {
      try {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          //   staysActiveInBackground: false,
        });
      } catch (error) {
        console.error("Failed to initialize audio mode", error);
      }
    };

    initAudioMode();
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permissions first
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        alert("Microphone permission is required to record audio");
        return;
      }

      // Prepare the recorder before starting recording
      await recorder.prepareToRecordAsync();
      await recorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording", error);
      alert("Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      const duration = recorderState.durationMillis;

      if (uri) {
        setAudioUri(uri);
        // Duration is in milliseconds, convert to seconds
        setAudioDuration(Math.floor(duration / 1000));
      }

      setIsRecording(false);
    } catch (error) {
      console.error("Failed to stop recording", error);
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    try {
      player.play();
    } catch (error) {
      console.error("Failed to play audio", error);
    }
  };

  const uploadAudio = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `${Date.now()}.m4a`;
    const storageRef = ref(storage, `journal_audio/${user?.uid}/${filename}`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  const deleteAudio = () => {
    player.pause();
    setAudioUri(null);
    setAudioDuration(0);
  };

  const handleSave = async () => {
    if (!user || !mood) return;
    if (!note.trim() && !audioUri) {
      alert("Please add a note or audio recording");
      return;
    }

    setLoading(true);
    try {
      let audioUrl: string | undefined;

      if (audioUri) {
        audioUrl = await uploadAudio(audioUri);
      }

      // 1. Add Journal Entry
      await addDoc(collection(db, CollectionNames.JOURNALS), {
        userId: user.uid,
        mood,
        note,
        audioUrl,
        audioDuration,
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
          isAnonymousProfile: isAnonymous, // user preference from journal? or global setting?
          // user requirements said "person should have access to toggle if he want to be annonymous or not"
          // assuming this is a global profile setting, but updating here for freshness
        },
        { merge: true },
      );

      router.back();
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("Failed to save entry");
    } finally {
      setLoading(false);
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
              variant="titleMedium"
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <GlassView variant="card" intensity="medium" style={styles.section}>
              <Text
                variant="titleMedium"
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                How are you feeling?
              </Text>
              <MoodSelector selectedMood={mood} onSelect={setMood} />
            </GlassView>

            <GlassView variant="card" intensity="medium" style={styles.section}>
              <Text
                variant="titleMedium"
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Write your thoughts...
              </Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={8}
                placeholder="Today I feel..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={note}
                onChangeText={setNote}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                  },
                ]}
                outlineColor="transparent"
                activeOutlineColor={theme.colors.primary}
              />
            </GlassView>

            <GlassView variant="card" intensity="medium" style={styles.section}>
              <Text
                variant="titleMedium"
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Or record an audio note
              </Text>

              {!audioUri ? (
                <View style={styles.audioControls}>
                  {!isRecording ? (
                    <Pressable
                      onPress={startRecording}
                      style={[
                        styles.audioButton,
                        {
                          backgroundColor: theme.colors.surfaceVariant,
                          borderRadius: liquidGlass.corners.medium,
                        },
                      ]}
                    >
                      <IconButton
                        icon="microphone"
                        size={24}
                        iconColor={theme.colors.primary}
                      />
                      <Text
                        variant="labelLarge"
                        style={{ color: theme.colors.onSurface }}
                      >
                        Start Recording
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={stopRecording}
                      style={[
                        styles.audioButton,
                        {
                          backgroundColor: theme.colors.primary,
                          borderRadius: liquidGlass.corners.medium,
                        },
                      ]}
                    >
                      <IconButton
                        icon="stop-circle"
                        size={24}
                        iconColor={theme.colors.onPrimary}
                      />
                      <Text
                        variant="labelLarge"
                        style={{ color: theme.colors.onPrimary }}
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
                      size={32}
                      iconColor={theme.colors.primary}
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
                      icon={player.playing ? "pause" : "play"}
                      size={24}
                      iconColor={theme.colors.primary}
                      onPress={playAudio}
                    />
                    <IconButton
                      icon="delete"
                      size={24}
                      iconColor={theme.colors.error}
                      onPress={deleteAudio}
                    />
                  </View>
                </View>
              )}
            </GlassView>

            <GlassView variant="card" intensity="medium" style={styles.section}>
              <View style={styles.row}>
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.onSurface }}
                >
                  Post Anonymously?
                </Text>
                <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
              </View>
            </GlassView>

            <View style={styles.buttonContainer}>
              <GlassButton
                variant="primary"
                onPress={handleSave}
                disabled={!mood || loading}
                style={styles.saveButton}
              >
                {loading ? "Saving..." : "Save Entry"}
              </GlassButton>
            </View>
          </ScrollView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: liquidGlass.spacing.comfortable,
    paddingTop: 90,
    paddingBottom: liquidGlass.spacing.breathe * 2,
  },
  section: {
    marginBottom: liquidGlass.spacing.comfortable,
  },
  sectionTitle: {
    marginBottom: liquidGlass.spacing.cozy,
    fontWeight: "600",
  },
  input: {
    minHeight: 150,
    borderRadius: liquidGlass.corners.medium,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  audioControls: {
    alignItems: "center",
  },
  audioButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: liquidGlass.spacing.intimate,
    padding: liquidGlass.spacing.comfortable,
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: liquidGlass.spacing.cozy,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: liquidGlass.corners.medium,
  },
  audioInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  audioDetails: {
    flex: 1,
  },
  audioActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: liquidGlass.spacing.comfortable,
  },
  saveButton: {
    width: "100%",
  },
});
