import { PASSWORD_RULES, validatePassword } from "@/lib/password";

interface Props {
  password: string;
}

export function PasswordRequirements({ password }: Props) {
  if (!password) return null;
  const v = validatePassword(password);
  return (
    <ul className="text-xs space-y-0.5 mt-2">
      {PASSWORD_RULES.map((r) => (
        <li key={r.key} className={v[r.key] ? "text-green-600" : "text-red-400"}>
          {v[r.key] ? "✓" : "✗"} {r.label}
        </li>
      ))}
    </ul>
  );
}
