import AuthLayout from "@/components/AuthLayout";
import FormInput from "@/components/FormInput";
import SubmitButton from "@/components/SubmitButton";
import { Colors } from "@/constants/colors";
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
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/utils/validation";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, isSubmitting } = useAuthStore();

  const emailRef = useRef<RNTextInput>(null);
  const passRef = useRef<RNTextInput>(null);
  const confirmRef = useRef<RNTextInput>(null);

  const handleRegister = useCallback(async () => {
    Keyboard.dismiss();
    const error =
      validateUsername(username) ||
      validateEmail(email) ||
      validatePassword(password) ||
      (password !== confirmPassword ? "Passwords do not match" : null);
    if (error) {
      showError("Invalid Input", error);
      return;
    }

    try {
      await register(
        email.trim().toLowerCase(),
        username.trim().toLowerCase(),
        password,
      );
      router.replace("/(tabs)/home");
    } catch (err) {
      showError(
        "Registration Failed",
        extractErrorMessage(err, "Registration failed. Please try again."),
        5000,
      );
    }
  }, [email, username, password, confirmPassword, register]);

  const usernameValid =
    username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  const emailValid = email.includes("@") && email.includes(".");
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const strength = password.length > 0 ? strengthOf(password) : null;

  return (
    <AuthLayout
      title="Sign Up"
      subtitle="Join thousands of learners today"
      tagline="Create your free account"
    >
      <FormInput
        label="Username"
        icon="person-outline"
        value={username}
        onChangeText={(t) => setUsername(t.replace(/\s/g, ""))}
        placeholder="johndoe"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        editable={!isSubmitting}
        isValid={usernameValid}
        hint="Letters, numbers and underscores only"
      />

      <FormInput
        label="Email Address"
        icon="mail-outline"
        value={email}
        onChangeText={(t) => setEmail(t.replace(/\s/g, ""))}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={() => passRef.current?.focus()}
        editable={!isSubmitting}
        isValid={emailValid}
        inputRef={emailRef}
      />

      <View>
        <FormInput
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 8 characters"
          isPassword
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!isSubmitting}
          inputRef={passRef}
        />
        {strength && (
          <View style={styles.strengthRow}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor:
                      password.length >= i * 3
                        ? strength.color
                        : Colors.surfaceBorder,
                  },
                ]}
              />
            ))}
            <Text style={styles.strengthText}>{strength.label}</Text>
          </View>
        )}
      </View>

      <FormInput
        label="Confirm Password"
        icon="lock-closed-outline"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repeat your password"
        isPassword
        returnKeyType="done"
        onSubmitEditing={handleRegister}
        editable={!isSubmitting}
        inputRef={confirmRef}
        error={passwordsMismatch ? "Passwords do not match" : null}
      />

      <SubmitButton
        label="Create Account"
        loadingLabel="Creating account..."
        loading={isSubmitting}
        onPress={handleRegister}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Already have an account? </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          disabled={isSubmitting}
        >
          <Text style={styles.switchLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

function strengthOf(password: string): { label: string; color: string } {
  if (password.length >= 10) return { label: "Strong", color: Colors.success };
  if (password.length >= 6) return { label: "Fair", color: Colors.warning };
  return { label: "Weak", color: Colors.error };
}

const styles = StyleSheet.create({
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthText: {
    color: Colors.textDim,
    fontSize: 11,
    marginLeft: 4,
    minWidth: 36,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchLabel: { color: Colors.textMuted, fontSize: 14 },
  switchLink: { color: Colors.primary, fontSize: 14, fontWeight: "700" },
});
