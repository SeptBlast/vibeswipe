import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { liquidGlass } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const isDark = theme.dark;
  const blurIntensity = liquidGlass[isDark ? "dark" : "light"].blur.strong;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          backgroundColor:
            Platform.OS === "ios" ? "transparent" : `${theme.colors.surface}F2`,
          elevation: 0,
          height: Platform.OS === "ios" ? 88 : 60,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={blurIntensity}
              tint={isDark ? "dark" : "light"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderTopWidth: 1,
                borderTopColor: "rgba(255, 255, 255, 0.1)",
              }}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Let's Vibe",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="book.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: "Connect",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.2.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="message.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
