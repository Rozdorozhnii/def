import type { Jar } from "@contracts/jars";

function formatUah(uah: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(uah);
}

async function fetchActiveJar(): Promise<Jar | null> {
  try {
    const res = await fetch(`${process.env.JARS_URL}/jars/active`, {
      next: { revalidate: 120, tags: ["active-jar"] },
    });
    if (!res.ok) return null;
    return (await res.json()) as Jar;
  } catch {
    return null;
  }
}

export async function DonationBlock() {
  const jar = await fetchActiveJar();
  if (!jar) return null;

  const percent = jar.goal > 0 ? Math.min(Math.round((jar.balance / jar.goal) * 100), 100) : 0;

  return (
    <aside className="mt-12 border border-gray-200 rounded-xl p-6 bg-gray-50">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
        Support the defenders
      </p>
      <h2 className="text-base font-semibold mb-4">{jar.title}</h2>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-black rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-5">
        <span>{formatUah(jar.balance)}</span>
        <span>
          {formatUah(jar.goal)}{" "}
          <span className="text-gray-400">({percent}%)</span>
        </span>
      </div>

      <a
        href={`https://send.monobank.ua/jar/${jar.jarId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-black text-white text-sm px-5 py-2.5 rounded-lg hover:bg-gray-800 transition"
      >
        Donate →
      </a>
    </aside>
  );
}
