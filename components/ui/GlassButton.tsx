import { liquidGlass } from "@/constants/theme";
import React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import GlassView from "../GlassView";

interface GlassButtonProps {
  children: string;
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  variant?: "primary" | "secondary" | "subtle";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function GlassButton({
  children,
  onPress,
  onPressIn: externalPressIn,
  onPressOut: externalPressOut,
  variant = "primary",
  style,
  disabled = false,
}: GlassButtonProps) {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    externalPressIn?.();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: liquidGlass.motion.spring.press.scale,
        useNativeDriver: true,
        damping: liquidGlass.motion.spring.press.damping,
        stiffness: liquidGlass.motion.spring.press.stiffness,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: liquidGlass.motion.timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    externalPressOut?.();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: liquidGlass.motion.spring.press.damping,
        stiffness: liquidGlass.motion.spring.press.stiffness,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: liquidGlass.motion.timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
    },
    subtle: {
      backgroundColor: "transparent",
    },
  };

  const textColor =
    variant === "subtle" ? theme.colors.primary : theme.colors.onPrimary;

  // Android: Use Material Design 3 Button
  if (Platform.OS === "android") {
    const buttonMode =
      variant === "subtle"
        ? "text"
        : variant === "secondary"
          ? "outlined"
          : "contained";
    return (
      <Button
        mode={buttonMode}
        onPress={onPress}
        disabled={disabled}
        style={[styles.androidButton, style]}
        contentStyle={styles.androidButtonContent}
        labelStyle={styles.androidButtonLabel}
      >
        {children}
      </Button>
    );
  }

  // iOS: Use liquid glass design
  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <GlassView
          variant="overlay"
          intensity="medium"
          style={[
            styles.button,
            variantStyles[variant],
            disabled && styles.disabled,
            style,
          ]}
        >
          <Text style={[styles.text, { color: textColor }]}>{children}</Text>
        </GlassView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  androidButton: {
    borderRadius: liquidGlass.corners.medium,
  },
  androidButtonContent: {
    paddingVertical: 8,
  },
  androidButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  button: {
    paddingVertical: liquidGlass.spacing.cozy,
    paddingHorizontal: liquidGlass.spacing.breathe,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: liquidGlass.corners.medium,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
