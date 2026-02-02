import { liquidGlass } from "@/constants/theme";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Surface, useTheme } from "react-native-paper";

interface GlassViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: "light" | "medium" | "strong";
  variant?: "card" | "sheet" | "overlay";
  elevation?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: "none" | "button" | "link" | "search" | "image" | "text";
}

export default function GlassView({
  children,
  style,
  intensity = "medium",
  variant = "card",
  elevation = true,
  accessibilityLabel,
  accessibilityRole = "none",
}: GlassViewProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const glassTheme = isDark ? liquidGlass.dark : liquidGlass.light;

  const blurIntensity = glassTheme.blur[intensity];

  const variantStyles = {
    card: {
      borderRadius: liquidGlass.corners.medium,
      padding: liquidGlass.spacing.comfortable,
    },
    sheet: {
      borderTopLeftRadius: liquidGlass.corners.large,
      borderTopRightRadius: liquidGlass.corners.large,
      padding: liquidGlass.spacing.breathe,
    },
    overlay: {
      borderRadius: liquidGlass.corners.medium,
    },
  };

  // Android: Use Material Design 3 Surface
  if (Platform.OS === "android") {
    const elevationLevel = elevation ? (variant === "overlay" ? 1 : 2) : 0;
    return (
      <Surface
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
      >
        {children}
      </Surface>
    );
  }

  return (
    <BlurView
      intensity={blurIntensity}
      tint={isDark ? "dark" : "light"}
      style={[
        styles.glass,
        variantStyles[variant],
        {
          backgroundColor: glassTheme.glass.fill,
          borderColor: glassTheme.glass.stroke,
        },
        elevation && styles.elevation,
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glass: {
    overflow: "hidden",
    borderWidth: 1,
  },
  androidSurface: {
    overflow: "hidden",
  },
  elevation: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
});
