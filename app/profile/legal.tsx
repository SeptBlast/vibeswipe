import GlassView from "@/components/GlassView";
import { LegalText } from "@/constants/LegalText";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            iconColor="#fff"
          />
        </View>
        <GlassView style={styles.glassContainer} intensity="medium">
          <Text variant="headlineMedium" style={styles.title}>
            {title}
          </Text>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <Text
              variant="bodyMedium"
              style={{ color: "#eee", lineHeight: 24 }}
            >
              {content}
            </Text>
            <View style={{ height: 50 }} />
          </ScrollView>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            textColor="#fff"
            style={{ borderColor: "#fff" }}
          >
            Close
          </Button>
        </GlassView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 8,
  },
  glassContainer: {
    flex: 1,
    margin: 16,
    padding: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  scrollView: {
    marginBottom: 20,
  },
});
