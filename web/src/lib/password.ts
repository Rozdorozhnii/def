export const PASSWORD_RULES = [
  { key: "length" as const, label: "At least 8 characters" },
  { key: "upper" as const, label: "Uppercase letter (A–Z)" },
  { key: "lower" as const, label: "Lowercase letter (a–z)" },
  { key: "number" as const, label: "Number (0–9)" },
  { key: "special" as const, label: "Special character (!@#…)" },
] as const;

export type PasswordValidation = Record<(typeof PASSWORD_RULES)[number]["key"], boolean>;

export function validatePassword(password: string): PasswordValidation {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  return Object.values(validatePassword(password)).every(Boolean);
}
