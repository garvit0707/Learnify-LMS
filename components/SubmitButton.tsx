import { Colors } from "@/constants/colors";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SubmitButtonProps {
  label: string;
  loadingLabel: string;
  loading: boolean;
  onPress: () => void;
}

export default function SubmitButton({
  label,
  loadingLabel,
  loading,
  onPress,
}: SubmitButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[styles.btn, loading && styles.btnDisabled]}
      activeOpacity={0.82}
    >
      {loading ? (
        <View style={styles.inner}>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={styles.text}>{loadingLabel}</Text>
        </View>
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  inner: { flexDirection: "row", alignItems: "center", gap: 10 },
  text: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
