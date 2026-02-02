import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { Platform } from "react-native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from "react-native-paper";

// Platform-specific Color System
// iOS: Liquid Glass (translucent, soft, airy, frosted)
// Android: Material 3 (tonal surfaces, elevation hierarchy)

export const colors = Platform.select({
  ios: {
    background: "#F8F9FB",

    surface: {
      base: "#FFFFFF",
      elev1: "#F2F3F7",
      elev2: "#ECEEF3",
    },

    border: {
      soft: "#E6E8EE",
    },

    text: {
      primary: "#1C1D21",
      secondary: "#6B7280",
      tertiary: "#9CA3AF",
    },

    glass: {
      light: "rgba(255,255,255,0.60)",
      medium: "rgba(255,255,255,0.45)",
      heavy: "rgba(255,255,255,0.30)",
      border: "rgba(255,255,255,0.35)",
      highlight: "rgba(255,255,255,0.70)",
    },

    accent: {
      primary: "#8E8CEB",
      soft: "#C7C6FF",
      tint: "rgba(142,140,235,0.10)",
    },

    mood: {
      verySad: "#E5ECF6",
      sad: "#C9D8F2",
      neutral: "#E5E7EB",
      calm: "#E6E0FF",
      happy: "#D7F2E3",
      excited: "#FFE7C7",
    },
  },

  android: {
    background: "#FAFAFB",

    surface: {
      0: "#FFFFFF",
      1: "#F5F6F8",
      2: "#EEF0F4",
      3: "#E7E9EE",
    },

    outline: "#E0E2E8",

    text: {
      primary: "#1B1C1F",
      secondary: "#70757F",
      disabled: "#A1A6B0",
    },

    primary: "#7F7CE6",
    onPrimary: "#FFFFFF",
    primaryContainer: "#E5E3FF",
    onPrimaryContainer: "#2C2A5C",

    mood: {
      verySad: "#E5ECF6",
      sad: "#C9D8F2",
      neutral: "#E5E7EB",
      calm: "#E6E0FF",
      happy: "#D7F2E3",
      excited: "#FFE7C7",
    },
  },
}) || {
  // Fallback for web/other platforms (use iOS style)
  background: "#F8F9FB",
  surface: { base: "#FFFFFF", elev1: "#F2F3F7", elev2: "#ECEEF3" },
  border: { soft: "#E6E8EE" },
  text: { primary: "#1C1D21", secondary: "#6B7280", tertiary: "#9CA3AF" },
  glass: {
    light: "rgba(255,255,255,0.60)",
    medium: "rgba(255,255,255,0.45)",
    heavy: "rgba(255,255,255,0.30)",
    border: "rgba(255,255,255,0.35)",
    highlight: "rgba(255,255,255,0.70)",
  },
  accent: {
    primary: "#8E8CEB",
    soft: "#C7C6FF",
    tint: "rgba(142,140,235,0.10)",
  },
  mood: {
    verySad: "#E5ECF6",
    sad: "#C9D8F2",
    neutral: "#E5E7EB",
    calm: "#E6E0FF",
    happy: "#D7F2E3",
    excited: "#FFE7C7",
  },
};

// Liquid Glass Design System (platform-agnostic tokens)
export const liquidGlass = {
  light: {
    blur: {
      strong: 25,
      medium: 20,
      light: 15,
    },
    glass: {
      fill: "rgba(255, 255, 255, 0.25)",
      stroke: "rgba(255, 255, 255, 0.4)",
      shadow: "rgba(0, 0, 0, 0.06)",
    },
    calm: {
      background: "#F8F9FB", // Updated to match new color system
      backgroundAlt: "#FAFBFC",
      mist: "rgba(248, 249, 251, 0.95)",
    },
  },
  dark: {
    blur: {
      strong: 25,
      medium: 20,
      light: 15,
    },
    glass: {
      fill: "rgba(30, 35, 45, 0.30)",
      stroke: "rgba(255, 255, 255, 0.12)",
      shadow: "rgba(0, 0, 0, 0.3)",
    },
    calm: {
      background: "#0F1419", // Deep charcoal
      backgroundAlt: "#161B22",
      mist: "rgba(15, 20, 25, 0.95)",
    },
  },
  spacing: {
    breathe: 32, // Maximum breathing room
    comfortable: 24, // Generous spacing
    cozy: 16, // Standard spacing
    intimate: 12, // Close spacing
    tight: 8, // Tight spacing
    hairline: 4, // Minimal spacing
  },
  corners: {
    small: 12,
    medium: 16,
    large: 24,
    glass: 28,
  },
  motion: {
    spring: {
      press: {
        damping: 15,
        stiffness: 400,
        scale: 0.96,
      },
      bounce: {
        damping: 12,
        stiffness: 300,
      },
    },
    timing: {
      fast: 180,
      normal: 240,
      smooth: 300,
    },
  },
};

const soothingLightColors = {
  // Updated to align with new color system
  primary: "#8E8CEB", // Soft lavender (matches accent.primary)
  onPrimary: "#FFFFFF",
  primaryContainer: "#E5E3FF", // Very pale lavender
  onPrimaryContainer: "#2C2A5C",
  secondary: "#6B7280", // Calm gray
  onSecondary: "#FFFFFF",
  secondaryContainer: "#F2F3F7",
  onSecondaryContainer: "#1C1D21",
  tertiary: "#C7C6FF", // Soft accent
  onTertiary: "#2C2A5C",
  tertiaryContainer: "#F2F3F7",
  onTertiaryContainer: "#1C1D21",
  background: "#F8F9FB", // Matches new background
  onBackground: "#1C1D21",
  surface: "rgba(255, 255, 255, 0.85)", // Translucent
  onSurface: "#1C1D21",
  surfaceVariant: "#F2F3F7",
  onSurfaceVariant: "#6B7280",
  outline: "#E6E8EE",
  inverseSurface: "#1C1D21",
  inverseOnSurface: "#F8F9FB",
  inversePrimary: "#C7C6FF",
  elevation: {
    level0: "transparent",
    level1: "rgba(255, 255, 255, 0.40)",
    level2: "rgba(255, 255, 255, 0.50)",
    level3: "rgba(255, 255, 255, 0.60)",
    level4: "rgba(255, 255, 255, 0.65)",
    level5: "rgba(255, 255, 255, 0.70)",
  },
  surfaceDisabled: "rgba(28, 29, 33, 0.08)",
  onSurfaceDisabled: "rgba(28, 29, 33, 0.32)",
  backdrop: "rgba(28, 29, 33, 0.3)",
  error: "#C55050",
  onError: "#FFFFFF",
  errorContainer: "#FAEAEA",
  onErrorContainer: "#4A1010",
  outlineVariant: "#E6E8EE",
  shadow: "rgba(0, 0, 0, 0.06)",
  scrim: "rgba(0, 0, 0, 0.5)",
};

const soothingDarkColors = {
  primary: "#C7C6FF", // Brighter lavender for dark mode
  onPrimary: "#2C2A5C",
  primaryContainer: "#3E2F6F",
  onPrimaryContainer: "#E5E3FF",
  secondary: "#9CA3AF", // Light gray
  onSecondary: "#1C1D21",
  secondaryContainer: "#2D3340",
  onSecondaryContainer: "#E6E8EE",
  tertiary: "#8E8CEB",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#3E2F6F",
  onTertiaryContainer: "#E5E3FF",
  background: "#0F1419", // Matches calm background
  onBackground: "#E6E8EE",
  surface: "rgba(30, 35, 45, 0.85)", // Translucent
  onSurface: "#E6E8EE",
  surfaceVariant: "#3E4350",
  onSurfaceVariant: "#9CA3AF",
  outline: "#6B7280",
  inverseSurface: "#E6E8EE",
  inverseOnSurface: "#1C1D21",
  inversePrimary: "#8E8CEB",
  elevation: {
    level0: "transparent",
    level1: "rgba(30, 35, 45, 0.40)",
    level2: "rgba(30, 35, 45, 0.50)",
    level3: "rgba(30, 35, 45, 0.60)",
    level4: "rgba(30, 35, 45, 0.65)",
    level5: "rgba(30, 35, 45, 0.70)",
  },
  surfaceDisabled: "rgba(230, 232, 238, 0.08)",
  onSurfaceDisabled: "rgba(230, 232, 238, 0.32)",
  backdrop: "rgba(15, 20, 25, 0.4)",
  error: "#E88B8B",
  onError: "#4A1010",
  errorContainer: "#6B2020",
  onErrorContainer: "#FAEAEA",
  outlineVariant: "#3E4350",
  shadow: "rgba(0, 0, 0, 0.3)",
  scrim: "rgba(0, 0, 0, 0.7)",
};

export const PaperLightTheme = {
  ...MD3LightTheme,
  colors: soothingLightColors,
};

export const PaperDarkTheme = {
  ...MD3DarkTheme,
  colors: soothingDarkColors,
};

const { LightTheme: NavLightTheme, DarkTheme: NavDarkTheme } =
  adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
    materialLight: PaperLightTheme,
    materialDark: PaperDarkTheme,
  });

export const NavigationLightTheme = NavLightTheme;
export const NavigationDarkThemeAdapted = NavDarkTheme;

// Legacy Colors export for backward compatibility
export const Colors = {
  light: {
    text: "#1C1D21",
    background: "#F8F9FB",
    tint: "#8E8CEB",
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#8E8CEB",
  },
  dark: {
    text: "#E6E8EE",
    background: "#0F1419",
    tint: "#C7C6FF",
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#C7C6FF",
  },
};
