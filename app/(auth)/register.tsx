import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !username.trim() ||
      !password.trim()
    ) {
      Toast.show({ type: "error", text1: "Please fill in all fields" });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }
    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 8 characters",
      });
      return;
    }
    try {
      await register(email.trim(), username.trim(), password, fullName.trim());
      router.replace("/(tabs)/home");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg =
        axiosError?.response?.data?.message ||
        (err instanceof Error ? err.message : "Registration failed");
      Toast.show({ type: "error", text1: "Registration Failed", text2: msg });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 40,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 32 }}
        >
          <Text style={{ color: Colors.textMuted, fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>

        <Text
          style={{
            color: Colors.text,
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          Create account
        </Text>
        <Text
          style={{ color: Colors.textMuted, fontSize: 14, marginBottom: 32 }}
        >
          Join thousands of learners today
        </Text>

        {[
          {
            label: "Full Name",
            value: fullName,
            setter: setFullName,
            placeholder: "John Doe",
          },
          {
            label: "Username",
            value: username,
            setter: setUsername,
            placeholder: "johndoe",
            autoCapitalize: "none",
          },
          {
            label: "Email",
            value: email,
            setter: setEmail,
            placeholder: "you@example.com",
            keyboardType: "email-address",
            autoCapitalize: "none",
          },
          {
            label: "Password",
            value: password,
            setter: setPassword,
            placeholder: "Min. 8 characters",
            secureTextEntry: true,
          },
          {
            label: "Confirm Password",
            value: confirmPassword,
            setter: setConfirmPassword,
            placeholder: "Repeat password",
            secureTextEntry: true,
          },
        ].map((field) => (
          <View key={field.label} style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: "#CBD5E1",
                fontSize: 13,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              {field.label}
            </Text>
            <TextInput
              value={field.value}
              onChangeText={field.setter}
              placeholder={field.placeholder}
              placeholderTextColor={Colors.textDim}
              secureTextEntry={field.secureTextEntry}
              keyboardType={
                (field.keyboardType as "email-address") || "default"
              }
              autoCapitalize={(field.autoCapitalize as "none") || "words"}
              autoCorrect={false}
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: Colors.text,
                fontSize: 14,
              }}
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 8,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text
              style={{ color: Colors.primary, fontWeight: "600", fontSize: 14 }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
