import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const bottomOffset = Math.max(insets.bottom, 0);

  return (
    <>
      {/* Tab Bar */}
      <View
        style={[styles.container, { bottom: bottomOffset }]}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={24}
          tint={isDark ? "dark" : "light"}
          style={styles.glassContainer}
        >
          <View
            style={[
              styles.glassBackground,
              {
                backgroundColor: isDark
                  ? "rgba(30,35,45,0.35)"
                  : "rgba(255,255,255,0.4)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.3)",
              },
            ]}
          >
            <View
              style={[
                styles.innerHighlight,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.7)",
                },
              ]}
            />

            <View style={styles.tabsContainer}>
              {state.routes.map((route, index) => (
                <TabBarButton
                  key={route.key}
                  route={route}
                  index={index}
                  isFocused={state.index === index}
                  navigation={navigation}
                  descriptors={descriptors}
                  isDark={isDark}
                />
              ))}
            </View>
          </View>
        </BlurView>
      </View>
    </>
  );
};

// const CenterFAB: React.FC<CenterFABProps> = ({
//   icon,
//   label,
//   onPress,
//   isDark,
// }) => {
//   const scaleAnim = React.useRef(new Animated.Value(1)).current;

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.9,
//       damping: 15,
//       stiffness: 400,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       damping: 15,
//       stiffness: 400,
//       useNativeDriver: true,
//     }).start();
//   };

//   return (
//     <Pressable
//       onPress={onPress}
//       onPressIn={handlePressIn}
//       onPressOut={handlePressOut}
//     >
//       <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//         <BlurView
//           intensity={28}
//           tint={isDark ? "dark" : "light"}
//           style={styles.centerFab}
//         >
//           <View
//             style={[
//               styles.centerFabBackground,
//               {
//                 backgroundColor: "#7F7CE6",
//               },
//             ]}
//           >
//             <Ionicons name={icon as any} size={22} color="#FFFFFF" />
//             <Text style={styles.centerFabLabel}>{label}</Text>
//           </View>
//         </BlurView>
//       </Animated.View>
//     </Pressable>
//   );
// };

// const RightFAB: React.FC<RightFABProps> = ({
//   icon,
//   label,
//   onPress,
//   isDark,
// }) => {
//   const scaleAnim = React.useRef(new Animated.Value(1)).current;

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.9,
//       damping: 15,
//       stiffness: 400,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       damping: 15,
//       stiffness: 400,
//       useNativeDriver: true,
//     }).start();
//   };

//   return (
//     <Pressable
//       onPress={onPress}
//       onPressIn={handlePressIn}
//       onPressOut={handlePressOut}
//     >
//       <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//         <BlurView
//           intensity={28}
//           tint={isDark ? "dark" : "light"}
//           style={styles.centerFab}
//         >
//           <View
//             style={[
//               styles.centerFabBackground,
//               {
//                 backgroundColor: "#7F7CE6",
//               },
//             ]}
//           >
//             <Ionicons name={icon as any} size={22} color="#FFFFFF" />
//             <Text style={styles.centerFabLabel}>{label}</Text>
//           </View>
//         </BlurView>
//       </Animated.View>
//     </Pressable>
//   );
// };

// Tab Bar Button Component
interface TabBarButtonProps {
  route: any;
  index: number;
  isFocused: boolean;
  navigation: any;
  descriptors: any;
  isDark: boolean;
}

const TabBarButton: React.FC<TabBarButtonProps> = ({
  route,
  index,
  isFocused,
  navigation,
  descriptors,
  isDark,
}) => {
  const { options } = descriptors[route.key];
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const onLongPress = () => {
    navigation.emit({
      type: "tabLongPress",
      target: route.key,
    });
  };

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const label =
    options.tabBarLabel !== undefined
      ? String(options.tabBarLabel)
      : options.title !== undefined
        ? String(options.title)
        : route.name;
  const inactiveColor = isDark ? "#4c4e5a" : "#8B90A0";
  const activeColor = "#8E8CEB";
  const color = isFocused ? activeColor : inactiveColor;

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.tabButton}
      >
        {isFocused && (
          <View
            style={[
              styles.activeBackground,
              { backgroundColor: "rgba(142,140,235,0.12)" },
            ]}
          />
        )}

        <View style={styles.iconContainer}>
          {options.tabBarIcon &&
            options.tabBarIcon({
              color,
              focused: isFocused,
              size: 26,
            })}
        </View>

        <Text
          style={[
            styles.label,
            {
              color,
              fontWeight: isFocused ? "600" : "500",
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 48,
    right: 48,
  },
  glassContainer: {
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  glassBackground: {
    borderWidth: 0.5,
    borderRadius: 26,
  },
  innerHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    opacity: 0.5,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    height: 52,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: 2,
    borderRadius: 50,
  },
  activeBackground: {
    position: "absolute",
    top: -7,
    left: -2,
    right: -2,
    bottom: -7,
    borderRadius: 20,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.15,
  },
});
