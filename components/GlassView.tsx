import React from "react";
import { Platform, StyleProp, ViewStyle } from "react-native";
import { GlassSurface } from "./surface/GlassSurface";
import { MaterialSurface } from "./surface/MaterialSurface";

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
  if (Platform.OS === "android") {
    const elevationLevel = elevation ? (variant === "overlay" ? 1 : 2) : 0;
    return (
      <MaterialSurface
        elevation={elevationLevel}
        variant={variant}
        style={style}
      >
        {children}
      </MaterialSurface>
    );
  }

  return (
    <GlassSurface
      intensity={intensity}
      variant={variant}
      elevation={elevation}
      style={style}
    >
      {children}
    </GlassSurface>
  );
}
