import { liquidGlass } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function CreatePostFAB() {
  const theme = useTheme();
  const router = useRouter();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: liquidGlass.motion.spring.press.scale,
      useNativeDriver: true,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: liquidGlass.motion.spring.press.damping,
      stiffness: liquidGlass.motion.spring.press.stiffness,
    }).start();
  };

  const handlePress = () => {
    router.push("/post/new");
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.container}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={[
            styles.fab,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <Ionicons name="add" size={24} color={theme.colors.onPrimary} />
          <Text
            variant="labelMedium"
            style={[styles.label, { color: theme.colors.onPrimary }]}
          >
            New Vibe
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 110 : 90,
    right: liquidGlass.spacing.comfortable,
    zIndex: 1000,
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: liquidGlass.spacing.intimate,
    paddingHorizontal: liquidGlass.spacing.comfortable - 1,
    borderRadius: 50,
    gap: liquidGlass.spacing.tight,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontWeight: "600",
    letterSpacing: 0.3,
    fontSize: 15,
  },
});
