export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return "Please enter a valid email";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  if (!trimmed) return "Username is required";
  if (trimmed.length < 3) return "Username must be at least 3 characters";
  if (trimmed.length > 20) return "Username must be under 20 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed))
    return "Username: letters, numbers and underscores only";
  return null;
}

export function passwordStrength(password: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
} {
  if (password.length < 6) return { level: 1, label: "Weak" };
  if (password.length < 10) return { level: 2, label: "Fair" };
  return { level: 3, label: "Strong" };
}
