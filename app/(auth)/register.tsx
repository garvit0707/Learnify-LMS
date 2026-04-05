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

function validate(
  email: string,
  username: string,
  password: string,
  confirm: string,
): string | null {
  if (!username.trim()) return "Username is required";
  if (username.trim().length < 3)
    return "Username must be at least 3 characters";
  if (username.trim().length > 20)
    return "Username must be under 20 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim()))
    return "Username: letters, numbers and underscores only";
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Please enter a valid email";
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password !== confirm) return "Passwords do not match";
  return null;
}

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { register, isSubmitting } = useAuthStore();

  const emailRef = useRef<RNTextInput>(null);
  const passRef = useRef<RNTextInput>(null);
  const confirmRef = useRef<RNTextInput>(null);

  const handleRegister = useCallback(async () => {
    Keyboard.dismiss();
    const error = validate(email, username, password, confirmPassword);
    if (error) {
      Toast.show({ type: "error", text1: "Invalid Input", text2: error });
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
      const msg = extractErrorMessage(
        err,
        "Registration failed. Please try again.",
      );
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: msg,
        visibilityTime: 5000,
      });
    }
  }, [email, username, password, confirmPassword, register]);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
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
          {/* Logo row */}
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={{ fontSize: 26 }}>🎓</Text>
            </View>
            <View>
              <Text style={styles.logoName}>Learnify</Text>
              <Text style={styles.logoTagline}>Create your free account</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign Up</Text>
            <Text style={styles.cardSub}>Join thousands of learners today</Text>

            {/* Username */}
            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <View
                style={[
                  styles.inputWrap,
                  username.length > 0 && styles.inputWrapActive,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={Colors.textDim}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={username}
                  onChangeText={(t) => setUsername(t.replace(/\s/g, ""))}
                  placeholder="johndoe"
                  placeholderTextColor={Colors.textDim}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  editable={!isSubmitting}
                  style={[styles.input, { flex: 1 }]}
                />
                {username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={Colors.success}
                  />
                )}
              </View>
              <Text style={styles.hint}>
                Letters, numbers and underscores only
              </Text>
            </View>

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
                  ref={emailRef}
                  value={email}
                  onChangeText={(t) => setEmail(t.replace(/\s/g, ""))}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textDim}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passRef.current?.focus()}
                  editable={!isSubmitting}
                  style={[styles.input, { flex: 1 }]}
                />
                {email.includes("@") && email.includes(".") && (
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
                  ref={passRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
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
              {/* Strength bar */}
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            password.length >= i * 3
                              ? password.length >= 10
                                ? Colors.success
                                : password.length >= 6
                                ? Colors.warning
                                : Colors.error
                              : Colors.surfaceBorder,
                        },
                      ]}
                    />
                  ))}
                  <Text style={styles.strengthText}>
                    {password.length < 6
                      ? "Weak"
                      : password.length < 10
                      ? "Fair"
                      : "Strong"}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <View
                style={[
                  styles.inputWrap,
                  confirmPassword.length > 0 && styles.inputWrapActive,
                  passwordsMismatch && styles.inputWrapError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={Colors.textDim}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={confirmRef}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your password"
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  editable={!isSubmitting}
                  style={[styles.input, { flex: 1 }]}
                />
                {passwordsMatch && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={Colors.success}
                  />
                )}
                {passwordsMismatch && (
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={Colors.error}
                  />
                )}
              </View>
              {passwordsMismatch && (
                <Text style={styles.errorHint}>Passwords do not match</Text>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isSubmitting}
              style={[styles.btn, isSubmitting && styles.btnDisabled]}
              activeOpacity={0.82}
            >
              {isSubmitting ? (
                <View style={styles.btnInner}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.btnText}>Creating account...</Text>
                </View>
              ) : (
                <Text style={styles.btnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                disabled={isSubmitting}
              >
                <Text style={styles.switchLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: (RNStatusBar.currentHeight || 44) + 16,
    paddingBottom: 40,
    backgroundColor: Colors.bg,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  logoName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  logoTagline: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 22,
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
  cardSub: { color: Colors.textMuted, fontSize: 14, marginBottom: 22 },
  field: { marginBottom: 14 },
  label: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  hint: { color: Colors.textDim, fontSize: 11, marginTop: 5 },
  errorHint: { color: Colors.error, fontSize: 11, marginTop: 5 },
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
  inputWrapError: { borderColor: "rgba(239,68,68,0.5)" },
  inputIcon: { marginRight: 10 },
  input: { color: Colors.text, fontSize: 14, paddingVertical: 13 },
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
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  btnDisabled: { opacity: 0.65 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchLabel: { color: Colors.textMuted, fontSize: 14 },
  switchLink: { color: Colors.primary, fontSize: 14, fontWeight: "700" },
});
