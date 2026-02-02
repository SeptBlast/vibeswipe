import GlassView from "@/components/GlassView";
import { LegalText } from "@/constants/LegalText";
import { liquidGlass } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, IconButton, Text, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function LegalScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getContent = () => {
    switch (type) {
      case "privacy":
        return { title: "Privacy Policy", content: LegalText.PRIVACY_POLICY };
      case "eula":
        return { title: "Terms of Service", content: LegalText.EULA };
      case "gdpr":
        return { title: "GDPR Compliance", content: LegalText.GDPR };
      default:
        return { title: "Legal", content: "Document not found." };
    }
  };

  const { title, content } = getContent();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header - Material Design 3 on Android, Liquid Glass on iOS */}
        {Platform.OS === "android" ? (
          <Appbar.Header
            elevated
            style={{ backgroundColor: theme.colors.surface }}
          >
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title={title} titleStyle={{ fontWeight: "600" }} />
          </Appbar.Header>
        ) : (
          <BlurView
            intensity={liquidGlass[theme.dark ? "dark" : "light"].blur.medium}
            tint={theme.dark ? "dark" : "light"}
            style={[
              styles.floatingHeader,
              { paddingTop: insets.top + liquidGlass.spacing.cozy },
            ]}
          >
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor={theme.colors.onSurface}
              onPress={() => router.back()}
            />
            <Text
              variant="titleLarge"
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              {title}
            </Text>
            <View style={{ width: 48 }} />
          </BlurView>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassView
            variant="card"
            intensity="medium"
            style={styles.contentCard}
          >
            <Text
              variant="bodyMedium"
              style={[styles.contentText, { color: theme.colors.onSurface }]}
            >
              {content}
            </Text>
          </GlassView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: liquidGlass.spacing.cozy,
    paddingBottom: liquidGlass.spacing.cozy,
    borderBottomWidth: Platform.OS === "ios" ? 0.5 : 0,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: liquidGlass.spacing.comfortable,
    paddingBottom: liquidGlass.spacing.breathe,
  },
  contentCard: {
    padding: liquidGlass.spacing.comfortable,
  },
  contentText: {
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});
