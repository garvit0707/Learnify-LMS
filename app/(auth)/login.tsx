import AuthLayout from "@/components/AuthLayout";
import AuthSwitchPrompt from "@/components/AuthSwitchPrompt";
import FormInput from "@/components/FormInput";
import SubmitButton from "@/components/SubmitButton";
import { extractErrorMessage } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Keyboard, TextInput as RNTextInput } from "react-native";
import { showError } from "@/utils/toast";
import { validateEmail } from "@/utils/validation";

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

      <AuthSwitchPrompt
        message="Don't have an account?"
        linkLabel="Sign Up"
        onPress={() => router.push("/(auth)/register")}
        disabled={isSubmitting}
      />
    </AuthLayout>
  );
}
