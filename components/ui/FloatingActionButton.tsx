import { liquidGlass } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Platform, Pressable, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import GlassView from "../GlassView";

interface FloatingActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  position?: "bottom-right" | "bottom-center";
}

export default function FloatingActionButton({
  icon,
  onPress,
  position = "bottom-right",
}: FloatingActionButtonProps) {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
  };

  const positionStyles = {
    "bottom-right": styles.bottomRight,
    "bottom-center": styles.bottomCenter,
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, positionStyles[position]]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <GlassView
          variant="overlay"
          intensity="strong"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name={icon} size={28} color={theme.colors.onPrimary} />
        </GlassView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1000,
  },
  bottomRight: {
    bottom: Platform.OS === "ios" ? 100 : 80,
    right: liquidGlass.spacing.breathe,
  },
  bottomCenter: {
    bottom: Platform.OS === "ios" ? 100 : 80,
    alignSelf: "center",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
});
