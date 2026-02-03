import {
  generateAvatar,
  getCustomAvatarSource,
  isCustomPhoto,
} from "@/utils/avatarHelpers";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Avatar } from "react-native-paper";
import { SvgXml } from "react-native-svg";

interface MultiAvatarProps {
  userId: string;
  photoURL?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Displays either a custom uploaded avatar or a generated Multiavatar
 * @param userId - User's unique identifier for generating avatar
 * @param photoURL - Optional custom photo URL from Firebase Storage
 * @param size - Avatar size in pixels (default: 48)
 * @param style - Additional styles
 */
export function MultiAvatar({
  userId,
  photoURL,
  size = 48,
  style,
}: MultiAvatarProps) {
  // If user has uploaded custom photo, show it
  if (isCustomPhoto(photoURL)) {
    const source = getCustomAvatarSource(photoURL);
    if (source) {
      return <Avatar.Image source={source} size={size} style={style} />;
    }
  }

  // Otherwise generate unique Multiavatar based on user ID
  const avatarSvg = generateAvatar(userId) || '<svg></svg>';

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <SvgXml xml={avatarSvg} width={size} height={size} />
    </View>
  );
}
