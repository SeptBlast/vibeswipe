import { liquidGlass } from "@/constants/theme";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: "light" | "medium" | "strong";
  variant?: "card" | "sheet" | "overlay";
  elevation?: boolean;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  intensity = "medium",
  variant = "card",
  elevation = true,
  style,
}) => {
  const theme = useTheme();
  const isDark = theme.dark;
  const glassTheme = isDark ? liquidGlass.dark : liquidGlass.light;

  const blurIntensity = glassTheme.blur[intensity];

  const variantStyles = {
    card: styles.card,
    sheet: styles.sheet,
    overlay: styles.overlay,
  };

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
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  glass: {
    overflow: "hidden",
    borderWidth: 1,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  overlay: {
    borderRadius: 16,
  },
  elevation: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
});
