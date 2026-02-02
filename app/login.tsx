import GlassView from "@/components/GlassView";
import GlassButton from "@/components/ui/GlassButton";
import { auth, googleWebClientId } from "@/configs/firebaseConfig";
import { liquidGlass } from "@/constants/theme";
import * as Google from "expo-auth-session/providers/google";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
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

export default function LoginScreen() {
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
        .then(() => router.replace("/(tabs)"))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [response]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        setError("Incorrect mood? Wait, incorrect password or email.");
      } else {
        setError(err.message);
      }
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
                Welcome Back
              </Text>
              <Text
                variant="bodyLarge"
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                A quiet space for your thoughts.
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
                  onPress={handleLogin}
                  disabled={loading}
                  style={styles.signInButton}
                >
                  {loading ? "Signing In..." : "Sign In"}
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
                  Sign in with Google
                </Button>

                <Link href="/login/phone" asChild>
                  <Button
                    mode="outlined"
                    style={styles.socialButton}
                    icon="phone"
                    textColor={theme.colors.onSurface}
                  >
                    Login with Phone
                  </Button>
                </Link>
              </GlassView>

              <Link href="/register" asChild>
                <Button
                  mode="text"
                  style={styles.registerLink}
                  textColor={theme.colors.primary}
                >
                  New here? Create a quiet account
                </Button>
              </Link>
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
  signInButton: {
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
  registerLink: {
    marginTop: liquidGlass.spacing.cozy,
    alignSelf: "center",
  },
});
