import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "system",
  isDarkMode: false,
  setThemeMode: async () => {},
});

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem("themeMode");
      if (
        saved &&
        (saved === "light" || saved === "dark" || saved === "system")
      ) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem("themeMode", mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  // Determine actual dark mode based on preference and system
  const isDarkMode =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  const value = {
    themeMode,
    isDarkMode,
    setThemeMode,
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
