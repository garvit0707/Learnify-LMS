import { Colors } from "@/constants/colors";
import { extractErrorMessage } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login, isSubmitting } = useAuthStore();
  const passwordRef = useRef<RNTextInput>(null);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      Toast.show({
        type: "error",
        text1: "Email required",
        text2: "Please enter your email address",
      });
      return;
    }
    if (!trimmedEmail.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Invalid email",
        text2: "Please enter a valid email address",
      });
      return;
    }
    if (!trimmedPass) {
      Toast.show({
        type: "error",
        text1: "Password required",
        text2: "Please enter your password",
      });
      return;
    }

    try {
      await login(trimmedEmail, password);
      router.replace("/(tabs)/home");
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        "Login failed. Please check your credentials.",
      );
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: msg,
        visibilityTime: 4000,
      });
    }
  }, [email, password, login]);

  return (
    // Outermost View fills entire screen with dark bg — prevents any white flash
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.logoName}>Learnify</Text>
            <Text style={styles.logoTagline}>Learn without limits</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to continue learning</Text>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputWrap,
                  email.length > 0 && styles.inputWrapActive,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={Colors.textDim}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textDim}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!isSubmitting}
                  style={styles.input}
                />
                {email.length > 0 && email.includes("@") && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={Colors.success}
                  />
                )}
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrap,
                  password.length > 0 && styles.inputWrapActive,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={Colors.textDim}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!isSubmitting}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPass ? "eye-off-outline" : "eye-outline"}
                    size={16}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              style={[styles.btn, isSubmitting && styles.btnDisabled]}
              activeOpacity={0.82}
            >
              {isSubmitting ? (
                <View style={styles.btnInner}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.btnText}>Signing in...</Text>
                </View>
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register")}
                disabled={isSubmitting}
              >
                <Text style={styles.switchLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom padding so content isn't flush at bottom */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Root fills entire screen with dark color — no white ever shows
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: (RNStatusBar.currentHeight || 44) + 20,
    paddingBottom: 40,
    backgroundColor: Colors.bg,
  },
  logoSection: { alignItems: "center", marginBottom: 36 },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  logoEmoji: { fontSize: 36 },
  logoName: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  logoTagline: { color: Colors.textMuted, fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSub: { color: Colors.textMuted, fontSize: 14, marginBottom: 24 },
  field: { marginBottom: 16 },
  label: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  inputWrapActive: { borderColor: "rgba(124,58,237,0.4)" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 14 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  btnDisabled: { opacity: 0.65 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchLabel: { color: Colors.textMuted, fontSize: 14 },
  switchLink: { color: Colors.primary, fontSize: 14, fontWeight: "700" },
});
