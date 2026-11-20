import { Colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  message: string;
  linkLabel: string;
  onPress: () => void;
  disabled?: boolean;
}

const AuthSwitchPrompt = ({ message, linkLabel, onPress, disabled }: Props) => (
  <View style={styles.row}>
    <Text style={styles.label}>{message} </Text>
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text style={styles.link}>{linkLabel}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  label: { color: Colors.textMuted, fontSize: 14 },
  link: { color: Colors.primary, fontSize: 14, fontWeight: "700" },
});

export default AuthSwitchPrompt;
