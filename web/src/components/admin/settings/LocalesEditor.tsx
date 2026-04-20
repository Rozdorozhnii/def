"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  knownLocales: string[];
  supportedLocales: string[];
}

export function LocalesEditor({ knownLocales, supportedLocales }: Props) {
  const router = useRouter();

  // All locales ever added — persisted in UI even when disabled
  const [known, setKnown] = useState<string[]>(knownLocales ?? []);
  // Enabled subset
  const [enabled, setEnabled] = useState<Set<string>>(
    new Set(supportedLocales ?? []),
  );

  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function add() {
    const code = input.trim().toLowerCase();
    if (!code) return;
    setInput("");
    setSuccess(false);
    if (!known.includes(code)) {
      setKnown((prev) => [...prev, code]);
    }
    // Adding always enables
    setEnabled((prev) => new Set(prev).add(code));
  }

  function toggle(code: string) {
    if (code === "en") return; // 'en' is always required
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/admin/settings/locales", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        knownLocales: known,
        supportedLocales: [...enabled],
      }),
    });

    setSaving(false);

    const data = await res.json();

    if (!res.ok) {
      setError((data as { message?: string }).message ?? "Something went wrong");
      return;
    }

    // Update local state from response so UI reflects saved data immediately,
    // without relying on router.refresh() re-mounting the component.
    const saved = data as { knownLocales?: string[]; supportedLocales?: string[] };
    if (saved.knownLocales) setKnown(saved.knownLocales);
    if (saved.supportedLocales) setEnabled(new Set(saved.supportedLocales));

    setSuccess(true);
    router.refresh();
  }

  return (
    <section>
      <h2 className="font-semibold mb-1">Supported locales</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enabled locales trigger AI translation and translator notifications.
        Disabled locales remain in the list and can be re-enabled anytime.
      </p>

      <div className="flex flex-col gap-2 mb-6">
        {known.map((code) => {
          const isEnabled = enabled.has(code);
          const isLocked = code === "en";

          return (
            <label
              key={code}
              className={`flex items-center gap-3 select-none ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => toggle(code)}
                disabled={isLocked}
                className="w-4 h-4 accent-[#ff4102]"
              />
              <span
                className={`text-sm font-mono ${isEnabled ? "text-black" : "text-gray-400"}`}
              >
                {code}
              </span>
              {isLocked && (
                <span className="text-xs text-gray-400">(always required)</span>
              )}
              {!isEnabled && !isLocked && (
                <span className="text-xs text-gray-400">disabled</span>
              )}
            </label>
          );
        })}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="e.g. de, fr, it"
          className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none text-sm w-40"
        />
        <button
          type="button"
          onClick={add}
          className="cursor-pointer font-bold px-4 py-[7px] rounded text-sm
            border border-[#dfdbd8] hover:bg-gray-50 transition"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm mb-3">Locales updated.</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="cursor-pointer font-bold px-6 py-2 rounded text-sm text-white
          border border-[#ff4102] bg-[#ff4102] shadow-md
          hover:bg-white hover:text-[#ff4102] transition duration-300
          disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </section>
  );
}