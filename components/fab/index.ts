import { Platform } from "react-native";
import { GlassFAB } from "./GlassFAB";
import { MaterialFAB } from "./MaterialFAB";

export const PlatformFAB = Platform.select({
  ios: GlassFAB,
  android: MaterialFAB,
  default: GlassFAB,
});

export { GlassFAB, MaterialFAB };
