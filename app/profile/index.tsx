import GlassView from "@/components/GlassView";
import GlassButton from "@/components/ui/GlassButton";
import { db } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { liquidGlass } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useThemeMode } from "@/contexts/ThemeContext";
import { BlurView } from "expo-blur";
import { Stack, useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Avatar,
  IconButton,
  List,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { isDarkMode, setThemeMode } = useThemeMode();
  const { preferences, updatePreferences } = useNotifications();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousAlias, setAnonymousAlias] = useState("");
  const [showAlias, setShowAlias] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, CollectionNames.USERS, user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsAnonymous(data.isAnonymousProfile || false);
        setAnonymousAlias(data.anonymousAlias || "");
        setShowAlias(data.showAlias || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (field: string, value: any) => {
    if (!user) return;
    const docRef = doc(db, CollectionNames.USERS, user.uid);
    // Use setDoc with merge: true to handle case where document doesn't exist yet
    await setDoc(docRef, { [field]: value }, { merge: true });
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        {Platform.OS === "android" ? (
          <Appbar.Header elevated>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Your Space" />
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
              onPress={() => router.back()}
              iconColor={theme.colors.onSurface}
            />
            <Text
              variant="titleLarge"
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              Your Space
            </Text>
            <View style={{ width: 48 }} />
          </BlurView>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity Card */}
          <GlassView
            variant="card"
            intensity="medium"
            style={styles.identityCard}
          >
            <Text
              variant="headlineSmall"
              style={[styles.identityTitle, { color: theme.colors.primary }]}
            >
              Your Identity
            </Text>
            <View style={styles.identityContent}>
              <Avatar.Text
                label={
                  isAnonymous && anonymousAlias
                    ? anonymousAlias.substring(0, 2).toUpperCase()
                    : user?.email?.substring(0, 2).toUpperCase() || "US"
                }
                size={80}
                style={{
                  alignSelf: "center",
                  backgroundColor: isAnonymous
                    ? theme.colors.tertiary
                    : theme.colors.primary,
                  marginBottom: liquidGlass.spacing.cozy,
                }}
              />
              {isAnonymous && anonymousAlias ? (
                <View style={styles.anonymousIdentity}>
                  <Text
                    variant="titleLarge"
                    style={[
                      styles.identityName,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {anonymousAlias}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      textAlign: "center",
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 4,
                      fontStyle: "italic",
                    }}
                  >
                    You are anonymous as {anonymousAlias}
                  </Text>
                  <View
                    style={[
                      styles.previewBadge,
                      { backgroundColor: theme.colors.tertiaryContainer },
                    ]}
                  >
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.onTertiaryContainer }}
                    >
                      This is how others see you
                    </Text>
                  </View>
                </View>
              ) : (
                <View>
                  <Text
                    variant="titleLarge"
                    style={[
                      styles.identityName,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {user?.anonymousAlias || "User"}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      textAlign: "center",
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    {user?.email}
                  </Text>
                </View>
              )}
            </View>
          </GlassView>

          <GlassView variant="card" intensity="medium" style={styles.section}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Privacy & Anonymity
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.sectionDescription,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Control how you appear to others in the community
            </Text>
            <List.Section>
              <List.Item
                title="Go Anonymous"
                description="Hide your profile from search"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                  <Switch
                    value={isAnonymous}
                    onValueChange={(v) => {
                      setIsAnonymous(v);
                      updateProfile("isAnonymousProfile", v);
                    }}
                  />
                )}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="incognito"
                    color={theme.colors.primary}
                  />
                )}
              />
              <List.Item
                title="Use Alias"
                description="Show alias instead of real name"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                  <Switch
                    value={showAlias}
                    onValueChange={(v) => {
                      setShowAlias(v);
                      updateProfile("showAlias", v);
                    }}
                  />
                )}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="emoticon-cool-outline"
                    color={theme.colors.primary}
                  />
                )}
              />
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <TextInput
                  label="Anonymous Alias (e.g. Quiet Owl)"
                  value={anonymousAlias}
                  onChangeText={setAnonymousAlias}
                  onEndEditing={() =>
                    updateProfile("anonymousAlias", anonymousAlias)
                  }
                  mode="outlined"
                  style={{ backgroundColor: theme.colors.surface }}
                  outlineColor="transparent"
                  activeOutlineColor={theme.colors.primary}
                />
              </View>
            </List.Section>
          </GlassView>

          <GlassView variant="card" intensity="medium" style={styles.section}>
            <List.Section>
              <List.Subheader
                style={{ color: theme.colors.onSurface, fontWeight: "600" }}
              >
                Preferences
              </List.Subheader>
              <List.Item
                title="Dark Mode"
                description="Toggle between light and dark themes"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                  <Switch
                    value={isDarkMode}
                    onValueChange={(value) => {
                      setThemeMode(value ? "dark" : "light");
                    }}
                  />
                )}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="theme-light-dark"
                    color={theme.colors.primary}
                  />
                )}
              />
            </List.Section>
          </GlassView>

          <GlassView variant="card" intensity="medium" style={styles.section}>
            <List.Section>
              <List.Subheader
                style={{ color: theme.colors.onSurface, fontWeight: "600" }}
              >
                Notifications
              </List.Subheader>
              <List.Item
                title="Enable Notifications"
                description="Receive notifications from VibeSwipe"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                  <Switch
                    value={preferences.enabled}
                    onValueChange={(value) =>
                      updatePreferences({ enabled: value })
                    }
                  />
                )}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="bell"
                    color={theme.colors.primary}
                  />
                )}
              />
              <List.Item
                title="Message Notifications"
                description="Get notified when you receive messages"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                disabled={!preferences.enabled}
                right={() => (
                  <Switch
                    value={preferences.messages}
                    disabled={!preferences.enabled}
                    onValueChange={(value) =>
                      updatePreferences({ messages: value })
                    }
                  />
                )}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="message-badge"
                    color={
                      preferences.enabled
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                  />
                )}
              />
              <List.Item
                title="Journal Reminders"
                description="Daily reminder to journal at 8 PM"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                disabled={!preferences.enabled}
                right={() => (
                  <Switch
                    value={preferences.journalReminders}
                    disabled={!preferences.enabled}
                    onValueChange={(value) =>
                      updatePreferences({ journalReminders: value })
                    }
                  />
                )}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="book-clock"
                    color={
                      preferences.enabled
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                  />
                )}
              />
              <List.Item
                title="Streak Warnings"
                description="Don't break your journaling streak"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                disabled={!preferences.enabled}
                right={() => (
                  <Switch
                    value={preferences.streakWarnings}
                    disabled={!preferences.enabled}
                    onValueChange={(value) =>
                      updatePreferences({ streakWarnings: value })
                    }
                  />
                )}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="fire"
                    color={
                      preferences.enabled
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                  />
                )}
              />
            </List.Section>
          </GlassView>

          <GlassView variant="card" intensity="medium" style={styles.section}>
            <List.Section>
              <List.Subheader
                style={{ color: theme.colors.onSurface, fontWeight: "600" }}
              >
                Legal
              </List.Subheader>
              <List.Item
                title="Privacy Policy"
                titleStyle={{ color: theme.colors.onSurface }}
                onPress={() => router.push("/profile/legal?type=privacy")}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="shield-account"
                    color={theme.colors.primary}
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
              />
              <List.Item
                title="Terms of Service (EULA)"
                titleStyle={{ color: theme.colors.onSurface }}
                onPress={() => router.push("/profile/legal?type=eula")}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="file-document"
                    color={theme.colors.primary}
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
              />
              <List.Item
                title="GDPR - Export Data"
                titleStyle={{ color: theme.colors.onSurface }}
                onPress={() => router.push("/profile/legal?type=gdpr")}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="database-export"
                    color={theme.colors.primary}
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
              />
            </List.Section>
          </GlassView>

          <GlassView
            variant="card"
            intensity="light"
            style={[styles.section, styles.dangerZone]}
          >
            <List.Section>
              {/* <List.Subheader
                style={{ color: theme.colors.error, fontWeight: "600" }}
              >
                Danger Zone
              </List.Subheader>
              <List.Item
                title="Seed Database (Dev Only)"
                description="Populates dummy data for testing"
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                onPress={() => seedDatabase()}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="database-import"
                    color={theme.colors.tertiary}
                  />
                )}
              /> */}
              <List.Item
                title="Delete Account"
                titleStyle={{ color: theme.colors.error }}
                onPress={() =>
                  Alert.alert(
                    "Delete Account",
                    "Are you sure? This cannot be undone.",
                    [
                      { text: "Cancel" },
                      { text: "Delete", style: "destructive" },
                    ],
                  )
                }
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="delete-forever"
                    color={theme.colors.error}
                  />
                )}
              />
            </List.Section>
          </GlassView>

          <View style={styles.signOutContainer}>
            <GlassButton
              variant="primary"
              onPress={handleSignOut}
              style={[
                styles.signOutButton,
                { backgroundColor: theme.colors.error },
              ]}
            >
              Log Out
            </GlassButton>
          </View>
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: liquidGlass.spacing.intimate,
    paddingVertical: liquidGlass.spacing.intimate,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontWeight: "600",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 80 : 8,
    paddingHorizontal: liquidGlass.spacing.cozy,
    paddingBottom: liquidGlass.spacing.breathe * 2,
  },
  identityCard: {
    marginBottom: liquidGlass.spacing.comfortable,
    paddingVertical: liquidGlass.spacing.comfortable,
    paddingHorizontal: liquidGlass.spacing.cozy,
  },
  identityTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: liquidGlass.spacing.cozy,
    letterSpacing: 0.5,
  },
  identityContent: {
    alignItems: "center",
  },
  identityName: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  anonymousIdentity: {
    alignItems: "center",
  },
  previewBadge: {
    paddingVertical: liquidGlass.spacing.tight,
    paddingHorizontal: liquidGlass.spacing.cozy,
    borderRadius: liquidGlass.corners.medium,
    marginTop: liquidGlass.spacing.cozy,
  },
  profileCard: {
    marginBottom: liquidGlass.spacing.comfortable,
    paddingVertical: liquidGlass.spacing.breathe,
    alignItems: "center",
  },
  displayName: {
    fontWeight: "600",
    marginTop: liquidGlass.spacing.cozy,
    marginBottom: liquidGlass.spacing.intimate / 2,
  },
  section: {
    marginBottom: liquidGlass.spacing.comfortable,
    paddingVertical: liquidGlass.spacing.cozy,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: liquidGlass.spacing.tight,
    paddingHorizontal: liquidGlass.spacing.cozy,
    letterSpacing: 0.3,
  },
  sectionDescription: {
    marginBottom: liquidGlass.spacing.cozy,
    paddingHorizontal: liquidGlass.spacing.cozy,
    lineHeight: 20,
  },
  dangerZone: {
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.3)",
  },
  signOutContainer: {
    marginTop: liquidGlass.spacing.comfortable,
    marginBottom: liquidGlass.spacing.breathe,
  },
  signOutButton: {
    width: "100%",
  },
});
