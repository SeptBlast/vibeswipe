import { Platform } from "react-native";
import { GlassTabBar } from "./GlassTabBar";
import { MaterialTabBar } from "./MaterialTabBar";

export const PlatformTabBar = Platform.select({
  ios: GlassTabBar,
  android: MaterialTabBar,
  default: GlassTabBar,
});

export { GlassTabBar, MaterialTabBar };
