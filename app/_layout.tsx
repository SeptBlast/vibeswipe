import {
  NavigationDarkThemeAdapted,
  NavigationLightTheme,
  PaperDarkTheme,
  PaperLightTheme,
} from "@/constants/theme";
import { NotificationProvider } from "@/contexts/NotificationContext";
import {
  ThemeProvider as CustomThemeProvider,
  useThemeMode,
} from "@/contexts/ThemeContext";
import { ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (!user && !inAuthGroup) {
      // Redirect to the login page.
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Redirect away from the login page.
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}

function ThemedApp() {
  const { isDarkMode } = useThemeMode();
  const paperTheme = isDarkMode ? PaperDarkTheme : PaperLightTheme;
  const navTheme = isDarkMode
    ? NavigationDarkThemeAdapted
    : NavigationLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <NotificationProvider>
          <ThemedApp />
        </NotificationProvider>
      </CustomThemeProvider>
    </AuthProvider>
  );
}
