import { Platform } from "react-native";
import { GlassSurface } from "./GlassSurface";
import { MaterialSurface } from "./MaterialSurface";

// Export as component that handles platform-specific props
export const PlatformSurface =
  Platform.OS === "ios" ? GlassSurface : MaterialSurface;

export { GlassSurface, MaterialSurface };
