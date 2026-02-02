import GlassView from "@/components/GlassView";
import { db } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { LegalText } from "@/constants/LegalText";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Checkbox, Text, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function TermsAgreementScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadEULA, setHasReadEULA] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!user || !acceptedTerms) return;

    setLoading(true);
    try {
      // Record terms acceptance
      await updateDoc(doc(db, CollectionNames.USERS, user.uid), {
        termsAcceptedAt: Date.now(),
        termsVersion: "1.0.0",
      });

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error accepting terms:", error);
      alert("Failed to accept terms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canAccept = hasReadTerms && hasReadEULA && acceptedTerms;

  return (
    <LinearGradient
      colors={
        theme.dark
          ? ["#0F1419", "#1a1f2e", "#252a3a"]
          : ["#F8F9FB", "#E8EAF0", "#D8DAE6"]
      }
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={[styles.header, { paddingTop: insets.top / 2 }]}>
          <Text
            variant="headlineMedium"
            style={[styles.headerTitle, { color: theme.colors.onSurface }]}
          >
            Terms & Agreements
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Please review and accept our terms before continuing
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassView variant="card" intensity="medium" style={styles.section}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              📜 Terms of Service (EULA)
            </Text>
            <ScrollView
              style={styles.termsScroll}
              nestedScrollEnabled
              onScrollEndDrag={() => setHasReadEULA(true)}
            >
              <Text
                variant="bodySmall"
                style={[styles.termsText, { color: theme.colors.onSurface }]}
              >
                {LegalText.EULA}
              </Text>
            </ScrollView>
            <View style={styles.checkboxRow}>
              <Checkbox
                status={hasReadEULA ? "checked" : "unchecked"}
                onPress={() => setHasReadEULA(!hasReadEULA)}
              />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurface, flex: 1 }}
              >
                I have read and understand the Terms of Service
              </Text>
            </View>
          </GlassView>

          <GlassView variant="card" intensity="medium" style={styles.section}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              🔒 Privacy Policy
            </Text>
            <ScrollView
              style={styles.termsScroll}
              nestedScrollEnabled
              onScrollEndDrag={() => setHasReadTerms(true)}
            >
              <Text
                variant="bodySmall"
                style={[styles.termsText, { color: theme.colors.onSurface }]}
              >
                {LegalText.PRIVACY_POLICY}
              </Text>
            </ScrollView>
            <View style={styles.checkboxRow}>
              <Checkbox
                status={hasReadTerms ? "checked" : "unchecked"}
                onPress={() => setHasReadTerms(!hasReadTerms)}
              />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurface, flex: 1 }}
              >
                I have read and understand the Privacy Policy
              </Text>
            </View>
          </GlassView>

          <GlassView variant="card" intensity="strong" style={styles.section}>
            <Text
              variant="titleMedium"
              style={[
                styles.sectionTitle,
                { color: theme.colors.error, fontWeight: "700" },
              ]}
            >
              ⚠️ Zero Tolerance Policy
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.warningText,
                { color: theme.colors.onSurface, lineHeight: 24 },
              ]}
            >
              By using VibeSwipe, you agree to our strict zero-tolerance policy
              for objectionable content, including hate speech, harassment,
              explicit content, violence, and spam.
              {"\n\n"}
              Violations will result in immediate content removal and account
              suspension.
              {"\n\n"}
              You agree to report any objectionable content you encounter and
              understand that we will review all reports within 24 hours.
            </Text>
          </GlassView>

          <View style={styles.finalCheckbox}>
            <Checkbox
              status={acceptedTerms ? "checked" : "unchecked"}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={!hasReadTerms || !hasReadEULA}
            />
            <Text
              variant="bodyLarge"
              style={[
                styles.acceptText,
                {
                  color: canAccept
                    ? theme.colors.onSurface
                    : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              I accept all terms and conditions, including the zero-tolerance
              policy for objectionable content
            </Text>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Button
            mode="contained"
            onPress={handleAccept}
            disabled={!canAccept || loading}
            loading={loading}
            style={styles.acceptButton}
            contentStyle={styles.acceptButtonContent}
          >
            {loading ? "Accepting..." : "Accept & Continue"}
          </Button>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: liquidGlass.spacing.comfortable,
    paddingVertical: liquidGlass.spacing.cozy,
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: liquidGlass.spacing.intimate,
  },
  headerSubtitle: {
    textAlign: "center",
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: liquidGlass.spacing.cozy,
    paddingBottom: liquidGlass.spacing.breathe,
  },
  section: {
    padding: liquidGlass.spacing.comfortable,
    marginBottom: liquidGlass.spacing.cozy,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: liquidGlass.spacing.cozy,
  },
  termsScroll: {
    maxHeight: 200,
    marginBottom: liquidGlass.spacing.cozy,
    paddingHorizontal: liquidGlass.spacing.intimate,
  },
  termsText: {
    lineHeight: 20,
    opacity: 0.9,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: liquidGlass.spacing.intimate,
    marginTop: liquidGlass.spacing.intimate,
  },
  warningText: {
    marginTop: liquidGlass.spacing.intimate,
  },
  finalCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: liquidGlass.spacing.intimate,
    paddingHorizontal: liquidGlass.spacing.cozy,
    marginTop: liquidGlass.spacing.cozy,
  },
  acceptText: {
    flex: 1,
    fontWeight: "600",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: liquidGlass.spacing.comfortable,
    paddingTop: liquidGlass.spacing.cozy,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  acceptButton: {
    borderRadius: liquidGlass.corners.medium,
  },
  acceptButtonContent: {
    paddingVertical: liquidGlass.spacing.intimate,
  },
});
