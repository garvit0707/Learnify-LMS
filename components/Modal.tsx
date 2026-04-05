import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const { height } = Dimensions.get("window");

export interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "ghost";
}

interface Props {
  visible: boolean;
  onClose: () => void;
  icon?: string;
  iconColor?: string;
  title: string;
  message: string;
  actions: ModalAction[];
}

export default function AppModal({
  visible,
  onClose,
  icon,
  iconColor,
  title,
  message,
  actions,
}: Props) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getActionStyle = (variant?: string) => {
    switch (variant) {
      case "primary":
        return styles.actionPrimary;
      case "danger":
        return styles.actionDanger;
      default:
        return styles.actionGhost;
    }
  };
  const getActionTextStyle = (variant?: string) => {
    switch (variant) {
      case "primary":
        return styles.actionTextPrimary;
      case "danger":
        return styles.actionTextDanger;
      default:
        return styles.actionTextGhost;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Icon */}
        {icon && (
          <View
            style={[
              styles.iconWrap,
              {
                borderColor: `${iconColor || Colors.primary}30`,
                backgroundColor: `${iconColor || Colors.primary}15`,
              },
            ]}
          >
            <Ionicons
              name={icon as any}
              size={32}
              color={iconColor || Colors.primary}
            />
          </View>
        )}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => {
                action.onPress();
                onClose();
              }}
              style={[styles.actionBase, getActionStyle(action.variant)]}
              activeOpacity={0.82}
            >
              <Text style={getActionTextStyle(action.variant)}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceBorder,
    marginBottom: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  actions: { width: "100%", gap: 10 },
  actionBase: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  actionPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  actionDanger: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.3)",
  },
  actionGhost: {
    backgroundColor: "transparent",
    borderColor: Colors.surfaceBorder,
  },
  actionTextPrimary: { color: "#fff", fontSize: 15, fontWeight: "700" },
  actionTextDanger: { color: Colors.error, fontSize: 15, fontWeight: "700" },
  actionTextGhost: { color: Colors.textMuted, fontSize: 15, fontWeight: "600" },
});
