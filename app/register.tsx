import GlassView from "@/components/GlassView";
import GlassButton from "@/components/ui/GlassButton";
import { auth, db, googleWebClientId } from "@/configs/firebaseConfig";
import { CollectionNames } from "@/constants/AppEnums";
import { liquidGlass } from "@/constants/theme";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();
  const router = useRouter();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleWebClientId,
    webClientId: googleWebClientId,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          // Create User Document for Google Sign In too
          const user = userCredential.user;
          await setDoc(
            doc(db, CollectionNames.USERS, user.uid),
            {
              uid: user.uid,
              email: user.email,
              anonymousAlias: user.anonymousAlias || "User",
              isAnonymousProfile: false,
              averageMood: 3.0,
              createdAt: Date.now(),
            },
            { merge: true },
          );

          router.replace("/terms-agreement");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [response]);

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Create User Document
      await setDoc(doc(db, CollectionNames.USERS, user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0],
        isAnonymousProfile: false,
        averageMood: 3.0, // Default neutrality
        createdAt: Date.now(),
      });

      router.replace("/terms-agreement");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text
                variant="displayMedium"
                style={[styles.title, { color: theme.colors.primary }]}
              >
                Begin Your Journey
              </Text>
              <Text
                variant="bodyLarge"
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Join VibeSwipe anonymously, or not. It's up to you.
              </Text>

              <GlassView
                variant="card"
                intensity="medium"
                style={styles.formCard}
              >
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={[
                    styles.input,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  outlineColor="transparent"
                  activeOutlineColor={theme.colors.primary}
                />
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry
                  style={[
                    styles.input,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  outlineColor="transparent"
                  activeOutlineColor={theme.colors.primary}
                />

                {error ? (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {error}
                  </Text>
                ) : null}

                <GlassButton
                  variant="primary"
                  onPress={handleRegister}
                  disabled={loading}
                  style={styles.createButton}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </GlassButton>
              </GlassView>

              <GlassView
                variant="card"
                intensity="light"
                style={styles.socialCard}
              >
                <Button
                  mode="outlined"
                  onPress={() => promptAsync()}
                  style={styles.socialButton}
                  icon="google"
                  disabled={!request}
                  textColor={theme.colors.onSurface}
                >
                  Sign up with Google
                </Button>
              </GlassView>

              <Button
                mode="text"
                onPress={() => router.back()}
                style={styles.loginLink}
                textColor={theme.colors.primary}
              >
                Already have an account? Sign In
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: liquidGlass.spacing.breathe,
    paddingVertical: liquidGlass.spacing.breathe,
  },
  content: {
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: liquidGlass.spacing.intimate,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: liquidGlass.spacing.breathe,
    opacity: 0.8,
  },
  formCard: {
    marginBottom: liquidGlass.spacing.comfortable,
    paddingVertical: liquidGlass.spacing.intimate,
  },
  input: {
    marginBottom: liquidGlass.spacing.cozy,
    borderRadius: liquidGlass.corners.medium,
  },
  errorText: {
    marginBottom: liquidGlass.spacing.cozy,
    textAlign: "center",
  },
  createButton: {
    width: "100%",
    marginTop: liquidGlass.spacing.intimate,
  },
  socialCard: {
    marginBottom: liquidGlass.spacing.comfortable,
    paddingVertical: liquidGlass.spacing.intimate,
  },
  socialButton: {
    marginBottom: liquidGlass.spacing.intimate,
    borderRadius: liquidGlass.corners.medium,
    borderColor: "rgba(150, 150, 150, 0.3)",
  },
  loginLink: {
    marginTop: liquidGlass.spacing.cozy,
    alignSelf: "center",
  },
});
