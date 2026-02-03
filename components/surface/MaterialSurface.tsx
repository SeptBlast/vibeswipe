import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Surface } from "react-native-paper";

interface MaterialSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  variant?: "card" | "sheet" | "overlay";
}

export const MaterialSurface: React.FC<MaterialSurfaceProps> = ({
  children,
  elevation = 1,
  style,
  variant = "card",
}) => {
  const variantStyles = {
    card: styles.card,
    sheet: styles.sheet,
    overlay: styles.overlay,
  };

  return (
    <Surface
      elevation={elevation}
      style={[styles.base, variantStyles[variant], style]}
    >
      {children}
    </Surface>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#FFFFFF",
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  overlay: {
    borderRadius: 12,
  },
});
