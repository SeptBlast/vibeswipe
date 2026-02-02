import { liquidGlass } from "@/constants/theme";
import React from "react";
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import GlassView from "../GlassView";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  intensity?: "light" | "medium" | "strong";
}

export default function GlassCard({
  children,
  style,
  onPress,
  intensity = "medium",
}: GlassCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: liquidGlass.motion.spring.press.scale,
      useNativeDriver: true,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
    }).start();
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <GlassView variant="card" intensity={intensity} style={style}>
            {children}
          </GlassView>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <GlassView variant="card" intensity={intensity} style={style}>
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({});
