import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: "error", text1: "Please fill in all fields" });
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Login failed. Try again.";
      Toast.show({ type: "error", text1: "Login Failed", text2: msg });
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-dark-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Logo */}
          <View className="mb-12 items-center">
            <View className="w-20 h-20 bg-primary-500 rounded-3xl items-center justify-center mb-4">
              <Text className="text-4xl">🎓</Text>
            </View>
            <Text className="text-white text-3xl font-bold tracking-tight">
              Learnify
            </Text>
            <Text className="text-slate-400 mt-1 text-sm">
              Your learning journey starts here
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold mb-2">
              Welcome back
            </Text>
            <Text className="text-slate-400 text-sm">
              Sign in to continue learning
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-slate-300 text-sm font-medium mb-2">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textDim}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-4 text-white text-sm focus:border-primary-500"
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate-300 text-sm font-medium mb-2">
              Password
            </Text>
            <View className="flex-row items-center bg-dark-800 border border-dark-700 rounded-xl px-4">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textDim}
                secureTextEntry={!showPassword}
                className="flex-1 py-4 text-white text-sm"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text className="text-slate-400 text-xs">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-primary-500 rounded-xl py-4 items-center mb-4 active:opacity-80"
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-slate-400 text-sm">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text className="text-primary-500 font-semibold text-sm">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
