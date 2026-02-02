import multiavatar from "@multiavatar/multiavatar";
import { ImageSourcePropType } from "react-native";

/**
 * Generate a unique Multiavatar SVG string based on seed
 * @param seed - User ID, email, or any unique identifier
 * @returns SVG string for the avatar
 */
export function generateAvatar(seed: string): string {
  return multiavatar(seed);
}

/**
 * Check if a photoURL is a custom uploaded photo (Firebase URL)
 * @param photoURL - The photo URL to check
 * @returns true if it's a custom uploaded photo
 */
export function isCustomPhoto(photoURL?: string | null): boolean {
  if (!photoURL) return false;
  return photoURL.startsWith("http://") || photoURL.startsWith("https://");
}

/**
 * Get the appropriate image source for a custom uploaded avatar
 * @param photoURL - Firebase Storage URL
 * @returns ImageSourcePropType for use with Avatar.Image, or null if not custom
 */
export function getCustomAvatarSource(
  photoURL?: string | null,
): ImageSourcePropType | null {
  if (!photoURL) return null;

  // Check if it's a remote URL (custom upload)
  if (isCustomPhoto(photoURL)) {
    return { uri: photoURL };
  }

  return null;
}

/**
 * Get avatar metadata for display
 * @param photoURL - User's photoURL from Firestore
 * @param userId - User's unique ID for generating Multiavatar
 * @returns Avatar information including type and sources
 */
export function getAvatarInfo(photoURL?: string | null, userId?: string) {
  const isCustom = isCustomPhoto(photoURL);
  const customSource = isCustom ? getCustomAvatarSource(photoURL) : null;

  return {
    isCustom,
    isGenerated: !isCustom,
    customSource,
    generatedSvg: !isCustom && userId ? generateAvatar(userId) : null,
    hasAvatar: !!photoURL || !!userId,
  };
}
