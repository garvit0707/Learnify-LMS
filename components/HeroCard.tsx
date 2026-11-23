import { Colors, withAlpha } from "@/constants/colors";
import { outerApi } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const getGreeting = (hour: number) =>
  hour < 12
    ? { text: "Good Morning", emoji: "☀️" }
    : hour < 17
      ? { text: "Good Afternoon", emoji: "👋" }
      : { text: "Good Evening", emoji: "🌙" };

const FLOATING_ICONS = [
  { emoji: "📚", styleKey: "fi1", animKey: "float1" },
  { emoji: "🏆", styleKey: "fi2", animKey: "float2" },
  { emoji: "⚡", styleKey: "fi3", animKey: "float3", small: true },
] as const;

const PILLS = [
  { icon: "flash", color: Colors.primary, label: "Top Rated" },
  { icon: "star", color: Colors.amber, label: "Expert Led" },
  { icon: "ribbon-outline", color: Colors.success, label: "Certified" },
] as const;

const HeroCard = React.memo(({ name }: { name: string }) => {
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const floats = { float1, float2, float3 };

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
    outerApi();

    const startFloat = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -10,
            duration: 2200 + delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2200 + delay,
            useNativeDriver: true,
          }),
        ]),
      ).start();

    startFloat(float1, 0);
    startFloat(float2, 400);
    startFloat(float3, 700);
  }, [float1, float2, float3, fadeIn]);

  const { text: greeting, emoji: greetEmoji } = getGreeting(new Date().getHours());

  return (
    <Animated.View style={[styles.hero, { opacity: fadeIn }]}>
      <Animated.View style={[styles.blob1, { transform: [{ translateY: float1 }] }]} />
      <Animated.View style={[styles.blob2, { transform: [{ translateY: float2 }] }]} />
      <Animated.View style={[styles.blob3, { transform: [{ translateY: float3 }] }]} />

      {FLOATING_ICONS.map(({ emoji, styleKey, animKey, small }) => (
        <Animated.View
          key={styleKey}
          style={[styles.fi, styles[styleKey], { transform: [{ translateY: floats[animKey] }] }]}
        >
          <Text style={[styles.fiText, small && styles.fiTextSmall]}>{emoji}</Text>
        </Animated.View>
      ))}

      <View style={styles.heroContent}>
        <Text style={styles.heroGreeting}>
          {greeting} {greetEmoji}
        </Text>
        <Text style={styles.heroName}>{name}</Text>
        <Text style={styles.heroSub}>What are you learning today?</Text>
        <View style={styles.heroPillRow}>
          {PILLS.map(({ icon, color, label }) => (
            <View key={label} style={styles.heroPill}>
              <Ionicons name={icon} size={11} color={color} />
              <Text style={styles.heroPillText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
});
HeroCard.displayName = "HeroCard";

const styles = StyleSheet.create({
  hero: {
    margin: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: withAlpha(Colors.primaryGlow, 0.25),
    overflow: "hidden",
    minHeight: 156,
    position: "relative",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  blob1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: withAlpha(Colors.primary, 0.22),
  },
  blob2: {
    position: "absolute",
    bottom: -40,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: withAlpha(Colors.accent, 0.16),
  },
  blob3: {
    position: "absolute",
    top: 20,
    left: "45%",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: withAlpha(Colors.primaryGlow, 0.12),
  },
  fi: {
    position: "absolute",
    backgroundColor: withAlpha(Colors.white, 0.06),
    borderWidth: 1,
    borderColor: withAlpha(Colors.white, 0.09),
    borderRadius: 14,
    padding: 9,
  },
  fi1: { top: 14, right: 16 },
  fi2: { top: 62, right: 72 },
  fi3: { bottom: 18, right: 28 },
  fiText: { fontSize: 20 },
  fiTextSmall: { fontSize: 16 },
  heroContent: { padding: 22, paddingRight: 88 },
  heroGreeting: { color: Colors.textMuted, fontSize: 13, marginBottom: 4 },
  heroName: {
    color: Colors.text,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    color: Colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  heroPillRow: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: withAlpha(Colors.primary, 0.1),
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: withAlpha(Colors.primary, 0.18),
  },
  heroPillText: { color: Colors.textMuted, fontSize: 11, fontWeight: "600" },
});

export default HeroCard;
