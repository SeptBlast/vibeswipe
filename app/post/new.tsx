import GlassView from "@/components/GlassView";
import GlassButton from "@/components/ui/GlassButton";
import { db, storage } from "@/configs/firebaseConfig";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { PostType } from "@/types/feed";
import { MOODS, MoodType } from "@/types/journal";
import { Filter } from "bad-words";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
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

export default function NewPostScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState<PostType>("text");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mood, setMood] = useState<MoodType>("happy");
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userAlias, setUserAlias] = useState<string>("Vibe User");

  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    fetchUserAlias();
  }, [user]);

  const fetchUserAlias = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserAlias(
          userData?.anonymousAlias || user.email?.split("@")[0] || "Vibe User",
        );
      }
    } catch (error) {
      console.error("Error fetching user alias:", error);
    }
  };

  const pickMedia = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload media.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);

        // Automatically detect type based on the asset
        if (asset.type === "video") {
          setMediaType("video");
        } else {
          setMediaType("image");
        }
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Error", "Failed to pick media.");
    }
  };

  const uploadMedia = async (uri: string): Promise<string> => {
    if (!user) throw new Error("No user logged in");

    const response = await fetch(uri);
    const blob = await response.blob();

    const extension = uri.split(".").pop();
    const filename = `${Date.now()}.${extension}`;
    const storageRef = ref(storage, `post_media/${user.uid}/${filename}`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  const handlePost = async () => {
    if (!user) return;
    if (!content.trim() && !mediaUri) {
      Alert.alert(
        "Content Required",
        "Please add some text or media to your vibe.",
      );
      return;
    }

    // Check for profanity
    if (content.trim()) {
      const filter = new Filter();
      if (filter.isProfane(content)) {
        Alert.alert(
          "Content Warning",
          "Your post contains inappropriate language. Please revise your content to comply with our community guidelines.",
        );
        return;
      }
    }

    setLoading(true);
    try {
      let mediaUrl: string | undefined;

      if (mediaUri) {
        setIsUploading(true);
        mediaUrl = await uploadMedia(mediaUri);
        setIsUploading(false);
      }

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        content,
        mediaType,
        ...(mediaUrl && { mediaUrl }), // Only include if mediaUrl exists
        mood: MOODS[mood].label,
        reactions: 0,
        commentCount: 0,
        createdAt: Date.now(),
        isAnonymous,
      });

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
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to post vibe.");
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
            <Appbar.Content title="New Vibe" />
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
              New Vibe
            </Text>
            <View style={{ width: 36 }} />
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
                placeholder="What's your vibe?"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={content}
                onChangeText={setContent}
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

              {/* Media Preview */}
              {mediaUri && (
                <View style={styles.mediaPreview}>
                  {mediaType === "image" ? (
                    <Image
                      source={{ uri: mediaUri }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.videoPlaceholder}>
                      <IconButton
                        icon="video"
                        size={48}
                        iconColor={theme.colors.primary}
                      />
                      <Text
                        variant="bodySmall"
                        style={{ color: theme.colors.onSurfaceVariant }}
                      >
                        Video selected
                      </Text>
                    </View>
                  )}
                  <IconButton
                    icon="close-circle"
                    size={24}
                    iconColor="#fff"
                    style={styles.removeMediaButton}
                    onPress={() => {
                      setMediaUri(null);
                      setMediaType("text");
                    }}
                  />
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
                    Uploading...
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
                  <IconButton
                    icon="attachment"
                    size={22}
                    iconColor={
                      mediaUri
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                    onPress={pickMedia}
                    disabled={isUploading}
                  />
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
                </View>

                <GlassButton
                  variant="primary"
                  onPress={handlePost}
                  disabled={
                    (!content.trim() && !mediaUri) || loading || isUploading
                  }
                  style={styles.shareButton}
                >
                  {loading ? "Posting..." : "Post"}
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
                Vibe Shared!
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Your vibe is now live on the wall
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
    gap: 4,
  },
  anonymousButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    paddingHorizontal: liquidGlass.spacing.comfortable,
    paddingVertical: liquidGlass.spacing.intimate,
    minWidth: 100,
  },
  mediaPreview: {
    marginTop: liquidGlass.spacing.cozy,
    borderRadius: liquidGlass.corners.medium,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: liquidGlass.corners.medium,
  },
  videoPlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: liquidGlass.corners.medium,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeMediaButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: liquidGlass.spacing.cozy,
    padding: liquidGlass.spacing.cozy,
    borderRadius: liquidGlass.corners.small,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
