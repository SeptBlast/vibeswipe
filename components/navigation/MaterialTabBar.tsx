import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const MaterialTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Surface
      elevation={3}
      style={[styles.container, { paddingBottom: insets.bottom }]}
    >
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

        const label =
          options.tabBarLabel !== undefined
            ? String(options.tabBarLabel)
            : options.title !== undefined
              ? String(options.title)
              : route.name;
        const color = isFocused ? "#7F7CE6" : "#70757F";

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            android_ripple={{ color: "#E5E3FF", borderless: false }}
          >
            {/* Active indicator */}
            {isFocused && (
              <View
                style={[styles.activeIndicator, { backgroundColor: "#E5E3FF" }]}
              />
            )}

            {/* Icon */}
            {options.tabBarIcon && (
              <View style={styles.iconContainer}>
                {options.tabBarIcon({ color, focused: isFocused, size: 24 })}
              </View>
            )}

            {/* Label */}
            <Text
              style={[
                styles.label,
                {
                  color,
                  fontWeight: isFocused ? "700" : "500",
                },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 32,
    borderRadius: 16,
  },
  iconContainer: {
    zIndex: 1,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    zIndex: 1,
  },
});
