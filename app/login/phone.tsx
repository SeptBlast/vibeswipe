import GlassView from "@/components/GlassView";
import { auth, firebaseConfig } from "@/configs/firebaseConfig";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PhoneLoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const recaptchaVerifier = useRef(null);

  // Bypass reCAPTCHA for testing with dummy numbers
  // This solves "Unable to load external scripts" when testing
  if (__DEV__) {
    auth.settings.appVerificationDisabledForTesting = true;
  }

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendVerification = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    setError("");
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current!,
      );
      setVerificationId(verificationId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error sending code.");
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async () => {
    if (!verificationCode) return;
    setLoading(true);
    setError("");
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode,
      );
      await signInWithCredential(auth, credential);
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          title="VibeSwipe Security"
          cancelLabel="Close"
        />

        <View style={styles.content}>
          <GlassView style={styles.glassContainer} intensity="strong">
            <Text variant="headlineMedium" style={styles.title}>
              {verificationId ? "Enter Code" : "Phone Login"}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {verificationId
                ? `Sent to ${phoneNumber}`
                : "Verify your vibe with your number."}
            </Text>

            {!verificationId ? (
              <>
                <TextInput
                  mode="flat"
                  label="Phone Number (+1555...)"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  style={styles.input}
                  textColor="#fff"
                  placeholderTextColor="#ccc"
                  underlineColor="transparent"
                  activeUnderlineColor={theme.colors.primary}
                  autoComplete="tel"
                  keyboardType="phone-pad"
                />
              </>
            ) : (
              <>
                <TextInput
                  mode="flat"
                  label="Verification Code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  style={styles.input}
                  textColor="#fff"
                  placeholderTextColor="#ccc"
                  underlineColor="transparent"
                  activeUnderlineColor={theme.colors.primary}
                  keyboardType="number-pad"
                />
              </>
            )}

            {error ? (
              <HelperText
                type="error"
                visible={true}
                style={{ color: theme.colors.errorContainer }}
              >
                {error}
              </HelperText>
            ) : null}

            {loading ? (
              <ActivityIndicator
                animating={true}
                color="#fff"
                style={{ marginTop: 20 }}
              />
            ) : (
              <Button
                mode="contained"
                onPress={verificationId ? confirmCode : sendVerification}
                style={styles.button}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                buttonColor={theme.colors.primary}
              >
                {verificationId ? "Confirm Code" : "Send Code"}
              </Button>
            )}

            <Button
              mode="text"
              onPress={() => router.back()}
              textColor="#ddd"
              style={{ marginTop: 10 }}
            >
              Cancel
            </Button>
          </GlassView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  glassContainer: {
    padding: 30,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    color: "#ddd",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
    borderRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  button: {
    width: "100%",
    marginTop: 8,
    paddingVertical: 6,
  },
});
