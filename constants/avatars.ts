const DICEBEAR_BASE = "https://api.dicebear.com/7.x/avataaars/png";
const DEFAULT_BG_COLORS = "b6e3f4,c0aede,d1d4f9,ffd5dc";

// Consistent auto-generated avatar from any seed (username, email, id)
export function getAvatarUrl(seed: string | number): string {
  const cleanSeed = encodeURIComponent(String(seed || "user"));
  return `${DICEBEAR_BASE}?seed=${cleanSeed}&backgroundColor=${DEFAULT_BG_COLORS}&radius=50`;
}
