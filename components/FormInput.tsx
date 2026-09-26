import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TextInputProps,
} from "react-native";
import { withAlpha } from "@/constants/colors";

interface FormInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isValid?: boolean;
  error?: string | null;
  hint?: string;
  isPassword?: boolean;
  inputRef?: React.Ref<TextInput>;
}

export default function FormInput({
  label,
  icon,
  isValid,
  error,
  hint,
  isPassword,
  inputRef,
  style,
  ...inputProps
}: FormInputProps) {
  const [show, setShow] = useState(false);
  const filled = (inputProps.value || "").length > 0;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          filled && !error && styles.inputWrapActive,
          error && styles.inputWrapError,
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={Colors.textDim}
          style={styles.inputIcon}
        />
        <TextInput
          ref={inputRef}
          secureTextEntry={isPassword && !show}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, style]}
          placeholderTextColor={Colors.textDim}
          {...inputProps}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShow(!show)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={show ? "eye-off-outline" : "eye-outline"}
              size={16}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        ) : (
          isValid && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.success}
            />
          )
        )}
      </View>
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && <Text style={styles.errorHint}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
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
  inputWrapActive: { borderColor: withAlpha(Colors.primary, 0.4) },
  inputWrapError: { borderColor: withAlpha(Colors.error, 0.5) },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 13 },
});
