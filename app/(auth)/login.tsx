import AuthLayout from "@/components/AuthLayout";
import FormInput from "@/components/FormInput";
import SubmitButton from "@/components/SubmitButton";
import { extractErrorMessage } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { showError } from "@/utils/toast";
import { validateEmail } from "@/utils/validation";
import { Colors } from "@/constants/colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isSubmitting } = useAuthStore();
  const passwordRef = useRef<RNTextInput>(null);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    const error =
      validateEmail(email) ||
      (password ? null : "Password is required");
    if (error) {
      showError("Invalid Input", error);
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/(tabs)/home");
    } catch (err) {
      showError(
        "Login Failed",
        extractErrorMessage(err, "Login failed. Please check your credentials."),
      );
    }
  }, [email, password, login]);

  const emailValid = email.includes("@");

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue learning"
      tagline="Learn without limits"
    >
      <FormInput
        label="Email Address"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!isSubmitting}
        isValid={emailValid}
      />

      <FormInput
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        isPassword
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        editable={!isSubmitting}
        inputRef={passwordRef}
      />

      <SubmitButton
        label="Sign In"
        loadingLabel="Signing in..."
        loading={isSubmitting}
        onPress={handleLogin}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          disabled={isSubmitting}
        >
          <Text style={styles.switchLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchLabel: { color: Colors.textMuted, fontSize: 14 },
  switchLink: { color: Colors.primary, fontSize: 14, fontWeight: "700" },
});
