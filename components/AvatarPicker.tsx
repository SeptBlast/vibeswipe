import { storage } from "@/configs/firebaseConfig";
import { liquidGlass } from "@/constants/theme";
import { generateAvatar } from "@/utils/avatarHelpers";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import { SvgXml } from "react-native-svg";
import GlassCard from "./ui/GlassCard";

interface AvatarPickerProps {
  visible: boolean;
  onDismiss: () => void;
  currentPhotoURL?: string | null;
  onRemovePhoto: () => Promise<void>;
  onUploadCustomPhoto: (photoURL: string) => Promise<void>;
  userId: string;
}

export function AvatarPicker({
  visible,
  onDismiss,
  currentPhotoURL,
  onRemovePhoto,
  onUploadCustomPhoto,
  userId,
}: AvatarPickerProps) {
  const theme = useTheme();
  const [isUploading, setIsUploading] = useState(false);

  const hasCustomPhoto =
    currentPhotoURL &&
    (currentPhotoURL.startsWith("http://") ||
      currentPhotoURL.startsWith("https://"));

  const handleRemovePhoto = async () => {
    try {
      await onRemovePhoto();
      onDismiss();
    } catch (error) {
      console.error("Error removing photo:", error);
      Alert.alert("Error", "Failed to remove photo. Please try again.");
    }
  };

  const handleUploadCustom = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to upload a profile picture.",
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setIsUploading(true);

      // Upload to Firebase Storage
      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const extension = imageUri.split(".").pop() || "jpg";
      const filename = `${Date.now()}.${extension}`;
      const storageRef = ref(storage, `profile_pictures/${userId}/${filename}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await onUploadCustomPhoto(downloadURL);
      onDismiss();
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={styles.dialog}
        dismissable={!isUploading}
      >
        <Dialog.Title>Your Avatar</Dialog.Title>
        <Dialog.Content>
          <GlassCard intensity="medium" style={styles.previewContainer}>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurface,
                marginBottom: liquidGlass.spacing.cozy,
              }}
            >
              {hasCustomPhoto
                ? "Your custom profile picture"
                : "Your unique generated avatar"}
            </Text>

            {/* Preview current avatar */}
            <View style={styles.avatarPreview}>
              <SvgXml xml={generateAvatar(userId)} width={120} height={120} />
            </View>

            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginTop: liquidGlass.spacing.cozy,
                textAlign: "center",
              }}
            >
              {hasCustomPhoto
                ? "You can upload a new photo or use your unique generated avatar"
                : "This avatar is uniquely generated for you. You can also upload a custom photo."}
            </Text>

            <Button
              mode="contained"
              onPress={handleUploadCustom}
              icon="camera"
              style={styles.uploadButton}
              loading={isUploading}
              disabled={isUploading}
            >
              {isUploading
                ? "Uploading..."
                : hasCustomPhoto
                  ? "Change Photo"
                  : "Upload Custom Photo"}
            </Button>

            {hasCustomPhoto && (
              <Button
                mode="text"
                onPress={handleRemovePhoto}
                icon="delete"
                style={styles.removeButton}
                disabled={isUploading}
                textColor={theme.colors.error}
              >
                Remove Custom Photo
              </Button>
            )}
          </GlassCard>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isUploading}>
            Close
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: "80%",
  },
  previewContainer: {
    padding: liquidGlass.spacing.comfortable,
    alignItems: "center",
  },
  avatarPreview: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: liquidGlass.spacing.cozy,
  },
  uploadButton: {
    marginTop: liquidGlass.spacing.comfortable,
    width: "100%",
  },
  removeButton: {
    marginTop: liquidGlass.spacing.intimate,
  },
});
