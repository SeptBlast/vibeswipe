import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { Text, useTheme } from "react-native-paper";

interface EditPostBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (content: string) => Promise<void>;
  initialContent: string;
}

export default function EditPostBottomSheet({
  visible,
  onDismiss,
  onSave,
  initialContent,
}: EditPostBottomSheetProps) {
  const theme = useTheme();
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      await onSave(content.trim());
      onDismiss();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setContent(initialContent);
    onDismiss();
  };

  const characterCount = content.length;
  const maxCharacters = 1000;
  const isValid = content.trim().length > 0 && characterCount <= maxCharacters;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={styles.modal}
      propagateSwipe
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver
      hideModalContentWhileAnimating
      avoidKeyboard
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={95}
            tint={theme.dark ? "dark" : "light"}
            style={styles.container}
          >
            <View style={styles.handleBar} />
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose}>
                  <Text
                    style={[
                      styles.cancelText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                  Edit Post
                </Text>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!isValid || isSaving}
                >
                  <Text
                    style={[
                      styles.saveText,
                      {
                        color:
                          isValid && !isSaving
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Text Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.colors.onSurface,
                    },
                  ]}
                  placeholder="What's on your mind?"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  maxLength={maxCharacters}
                  autoFocus
                  textAlignVertical="top"
                />
              </View>

              {/* Character Count */}
              <View style={styles.footer}>
                <Text
                  style={[
                    styles.characterCount,
                    {
                      color:
                        characterCount > maxCharacters
                          ? theme.colors.error
                          : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {characterCount}/{maxCharacters}
                </Text>
              </View>
            </View>
          </BlurView>
        ) : (
          <View
            style={[
              styles.container,
              {
                backgroundColor: theme.dark
                  ? "rgba(30, 35, 45, 0.98)"
                  : "rgba(255, 255, 255, 0.98)",
              },
            ]}
          >
            <View style={styles.handleBar} />
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose}>
                  <Text
                    style={[
                      styles.cancelText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                  Edit Post
                </Text>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!isValid || isSaving}
                >
                  <Text
                    style={[
                      styles.saveText,
                      {
                        color:
                          isValid && !isSaving
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Text Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.colors.onSurface,
                    },
                  ]}
                  placeholder="What's on your mind?"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  maxLength={maxCharacters}
                  autoFocus
                  textAlignVertical="top"
                />
              </View>

              {/* Character Count */}
              <View style={styles.footer}>
                <Text
                  style={[
                    styles.characterCount,
                    {
                      color:
                        characterCount > maxCharacters
                          ? theme.colors.error
                          : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {characterCount}/{maxCharacters}
                </Text>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: Platform.OS === "ios" ? 20 : 16,
    borderTopRightRadius: Platform.OS === "ios" ? 20 : 16,
    maxHeight: "75%",
    overflow: "hidden",
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    paddingBottom: 16,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    height: 48,
  },
  title: {
    fontWeight: "700",
    fontSize: Platform.OS === "ios" ? 18 : 20,
  },
  cancelText: {
    fontWeight: "500",
    fontSize: 16,
  },
  saveText: {
    fontWeight: "600",
    fontSize: 16,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    paddingTop: 0,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: "flex-end",
  },
  characterCount: {
    fontWeight: "500",
    fontSize: 12,
  },
});
