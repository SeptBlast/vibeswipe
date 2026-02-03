/**
 * LiquidGlassTabBar Component
 *
 * A floating, translucent bottom navigation bar following Apple's Liquid Glass design (2025-2026).
 * Designed to feel soft, calm, and premium - matching iOS Control Center and VisionOS aesthetics.
 *
 * Key Features:
 * - Floating capsule design (detached from bottom edge)
 * - Real blur effect (not opacity)
 * - Soft lavender accent for active state
 * - Haptic feedback
 * - Safe area aware
 * - Smooth spring animations
 * - 60fps performance
 *
 * Platform Support:
 * - iOS: Full Liquid Glass with blur
 * - Android: Material 3 tonal surface (no blur)
 */

import { liquidGlass } from "@/constants/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabButtonProps {
  route: any;
  index: number;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  icon: (props: { color: string; focused: boolean }) => React.ReactNode;
  label: string;
  isDark: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  route,
  index,
  isFocused,
  onPress,
  onLongPress,
  icon,
  label,
  isDark,
}) => {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scale down animation
    Animated.spring(scaleAnim, {
      toValue: liquidGlass.motion.spring.press.scale,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    // Scale back animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
      useNativeDriver: true,
    }).start();
  };

  // Colors
  const inactiveColor = isDark ? "#8B90A0" : "#8B90A0"; // Gray for inactive
  const activeColor = "#8E8CEB"; // Lavender for active
  const color = isFocused ? activeColor : inactiveColor;

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={label}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.tabButton}
      >
        {/* Active background tint */}
        {isFocused && (
          <View
            style={[
              styles.activeBackground,
              {
                backgroundColor: "rgba(142,140,235,0.12)", // Soft lavender tint
              },
            ]}
          />
        )}

        {/* Icon */}
        <View style={styles.iconContainer}>
          {icon({ color, focused: isFocused })}
        </View>

        {/* Label */}
        <Text
          style={[
            styles.label,
            {
              color,
              fontWeight: isFocused ? "600" : "500",
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export const LiquidGlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const isDark = theme.dark;

  // Calculate bottom offset with safe area
  const bottomOffset = Math.max(insets.bottom, 0);

  return (
    <View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          paddingBottom: 0, // We handle safe area in bottom offset
        },
      ]}
      pointerEvents="box-none"
    >
      {/* iOS: Floating Glass Capsule */}
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={26} // 22-28 range for optimal glass effect
          tint={isDark ? "dark" : "light"}
          style={styles.iosGlassContainer}
        >
          {/* Background glass layer */}
          <View
            style={[
              styles.glassBackground,
              {
                backgroundColor: isDark
                  ? "rgba(30,35,45,0.45)"
                  : "rgba(255,255,255,0.45)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.35)",
              },
            ]}
          >
            {/* Inner highlight for depth */}
            <View
              style={[
                styles.innerHighlight,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.7)",
                },
              ]}
            />

            {/* Tab buttons */}
            <View style={styles.tabsContainer}>
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                const onLongPress = () => {
                  navigation.emit({
                    type: "tabLongPress",
                    target: route.key,
                  });
                };

                return (
                  <TabButton
                    key={route.key}
                    route={route}
                    index={index}
                    isFocused={isFocused}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    icon={options.tabBarIcon!}
                    label={
                      (options.tabBarLabel as string) ||
                      options.title ||
                      route.name
                    }
                    isDark={isDark}
                  />
                );
              })}
            </View>
          </View>
        </BlurView>
      ) : (
        /* Android: Material 3 Tonal Surface */
        <View
          style={[
            styles.androidContainer,
            {
              backgroundColor: isDark
                ? theme.colors.surfaceVariant
                : theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <View style={styles.tabsContainer}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <TabButton
                  key={route.key}
                  route={route}
                  index={index}
                  isFocused={isFocused}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  icon={options.tabBarIcon!}
                  label={
                    (options.tabBarLabel as string) ||
                    options.title ||
                    route.name
                  }
                  isDark={isDark}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 18, // 16-20 range for horizontal margin
    right: 18,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "box-none",
  },

  // iOS Glass Container
  iosGlassContainer: {
    width: "100%",
    height: 68, // 64-72 range
    borderRadius: 50, // 32-34 range for capsule shape
    overflow: "hidden",
    // Shadow for floating effect
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10, // 10-12 range
    },
    shadowOpacity: 0.14, // 0.12-0.16 range
    shadowRadius: 24, // 20-28 range
    elevation: 8, // Android fallback
  },

  glassBackground: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 1,
    overflow: "hidden",
  },

  innerHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },

  // Android Material Container
  androidContainer: {
    width: "100%",
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    elevation: 3,
  },

  // Tab Layout
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 4,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 44, // Accessibility hit target
    position: "relative",
  },

  activeBackground: {
    position: "absolute",
    top: 6,
    left: 4,
    right: 4,
    bottom: 6,
    borderRadius: 16,
  },

  iconContainer: {
    marginBottom: 2,
  },

  label: {
    fontSize: 11, // 11-12 range
    fontWeight: "500",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
