import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FAB as PaperFAB, useTheme } from "react-native-paper";

interface MaterialFABProps {
  icon?: string;
  label?: string;
  onPress?: () => void;
  extended?: boolean;
}

export const MaterialFAB: React.FC<MaterialFABProps> = ({
  icon = "add",
  label = "New Vibe",
  onPress,
  extended = true,
}) => {
  const theme = useTheme();
  const router = useRouter();

  const handlePress = onPress || (() => router.push("/post/new"));

  if (extended) {
    return (
      <Pressable
        onPress={handlePress}
        style={[styles.extendedContainer]}
        android_ripple={{ color: "#C7C6FF" }}
      >
        <View style={[styles.extendedFab, { backgroundColor: "#7F7CE6" }]}>
          <Ionicons name={icon as any} size={24} color="#FFFFFF" />
          <Text style={styles.extendedLabel}>{label}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <PaperFAB
      icon={icon}
      onPress={handlePress}
      style={[styles.fab, { backgroundColor: "#7F7CE6" }]}
      color="#FFFFFF"
    />
  );
};

const styles = StyleSheet.create({
  extendedContainer: {
    position: "absolute",
    bottom: 76,
    right: 16,
    zIndex: 1000,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
  },
  extendedFab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  extendedLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  fab: {
    position: "absolute",
    bottom: 76,
    right: 16,
    zIndex: 1000,
  },
});
