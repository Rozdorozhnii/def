"use client";

import { useEffect, useState } from "react";
import type { Jar } from "@contracts/jars";

function formatUah(uah: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(uah);
}

const STATUS_BADGE: Record<Jar["status"], string> = {
  active: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-gray-50 text-gray-600 border border-gray-200",
  completed: "bg-blue-50 text-blue-700 border border-blue-200",
};

function extractJarId(value: string): string {
  const match = value.match(/\/jar\/([^/?#\s]+)/);
  return match ? match[1] : value.trim();
}

export default function AdminJarsPage() {
  const [jars, setJars] = useState<Jar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [jarId, setJarId] = useState("");
  const [rootJarId, setRootJarId] = useState("");
  const [type, setType] = useState<"own" | "friendly">("friendly");
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState(false);

  async function loadJars() {
    const res = await fetch("/api/admin/jars");
    if (res.ok) {
      setJars(await res.json());
    } else {
      setError("Failed to load jars");
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadJars();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);

    const body: Record<string, unknown> = { jarId, type, title, goal: parseInt(goal, 10) };
    if (type === "friendly" && rootJarId) body.rootJarId = rootJarId;

    const res = await fetch("/api/admin/jars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json();
      setCreateError(
        Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Something went wrong",
      );
      return;
    }

    setJarId("");
    setRootJarId("");
    setType("friendly");
    setTitle("");
    setGoal("");
    void loadJars();
  }

  async function handleTriggerCompletion() {
    if (!confirm("Force-complete the active jar?")) return;
    setTriggering(true);
    const res = await fetch("/api/admin/jars/debug/trigger-completion", {
      method: "POST",
    });
    setTriggering(false);
    if (res.ok) {
      void loadJars();
    } else {
      const data = await res.json();
      setError(data.message ?? "Trigger failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this jar from the queue?")) return;
    const res = await fetch(`/api/admin/jars/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      void loadJars();
    } else {
      const data = await res.json();
      setError(data.message ?? "Failed to delete jar");
    }
  }

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Donation Jars</h1>
        <p className="text-sm text-gray-500 mt-1">
          Jars are processed in queue order. When the active jar reaches its
          goal, the next pending jar activates automatically and all pages are
          revalidated.
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <section>
        <h2 className="text-lg font-semibold mb-3">Queue</h2>
        {jars.length === 0 ? (
          <p className="text-sm text-gray-500">No jars in the queue yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {jars.map((jar, i) => (
              <li
                key={jar._id}
                className="border rounded-lg px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                    <span className="font-medium truncate">{jar.title}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[jar.status]}`}
                    >
                      {jar.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono ml-6">
                    {jar.type} · {jar.jarId}
                  </span>
                  <div className="text-sm text-gray-600 mt-1 ml-6">
                    {formatUah(jar.balance)} / {formatUah(jar.goal)}
                    {jar.status === "active" && jar.goal > 0 && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({Math.round((jar.balance / jar.goal) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>

                {jar.status !== "active" && (
                  <button
                    onClick={() => handleDelete(jar._id)}
                    className="text-sm text-red-500 hover:text-red-700 shrink-0"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {jars.some((j) => j.status === "active") && (
          <button
            onClick={() => void handleTriggerCompletion()}
            disabled={triggering}
            className="mt-4 text-sm text-gray-500 underline hover:text-black disabled:opacity-50"
          >
            {triggering ? "Triggering…" : "⚡ Force-complete active jar (debug)"}
          </button>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Add jar to queue</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 max-w-sm">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  value="friendly"
                  checked={type === "friendly"}
                  onChange={() => setType("friendly")}
                />
                Friendly (polling)
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  value="own"
                  checked={type === "own"}
                  onChange={() => setType("own")}
                />
                Own (webhook)
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              {type === "friendly" ? "Friendly jar" : "Jar"} Send ID{" "}
              <span className="text-gray-400 font-normal">
                (send.monobank.ua/jar/
                <strong>{jarId || "…"}</strong>)
              </span>
            </label>
            <input
              value={jarId}
              onChange={(e) => setJarId(extractJarId(e.target.value))}
              placeholder="e.g. 4trPsxBw9c"
              required
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          {type === "friendly" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Main jar Send ID{" "}
                <span className="text-gray-400 font-normal">(for polling + progress bar)</span>
              </label>
              <input
                value={rootJarId}
                onChange={(e) => setRootJarId(extractJarId(e.target.value))}
                placeholder="e.g. 7NgopngouJ"
                required
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Thermal imagers for 3rd brigade"
              required
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Goal (UAH)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. 500000"
              required
              className="border rounded px-3 py-2 text-sm"
            />
          </div>

          {createError && (
            <p className="text-red-500 text-sm">{createError}</p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50 self-start"
          >
            {creating ? "Adding…" : "Add to queue"}
          </button>
        </form>
      </section>
    </div>
  );
}
