export const Colors = {
  // Brand
  primary: "#7C3AED",
  primaryLight: "#8B5CF6",
  primaryDark: "#6D28D9",
  accent: "#06B6D4",
  accentDark: "#0891B2",

  // Backgrounds
  bg: "#07070D",
  surface: "#101019",
  surfaceElevated: "#181828",
  surfaceBorder: "#2A2A44",
  card: "#141422",

  // Text
  text: "#F0F0FF",
  textMuted: "#8888AA",
  textDim: "#55556A",

  // Status
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",

  white: "#FFFFFF",
  black: "#000000",

  // Supplementary
  primaryGlow: "#C4B5FD",
  amber: "#FBBF24",
};

export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
