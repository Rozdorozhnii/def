export const dynamic = "force-dynamic";

import { serverFetch } from "@/lib/auth/serverFetch";
import { getBaseUrl } from "@/shared/server/getBaseUrl";
import { LocalesEditor } from "@/components/admin/settings/LocalesEditor";
import type { SiteSettings } from "@contracts/notes";

export default async function SettingsPage() {
  const baseUrl = await getBaseUrl();
  const res = await serverFetch(`${baseUrl}/api/admin/settings/locales`);
  const data = await res.json();
  const settings: SiteSettings = res.ok
    ? (data as SiteSettings)
    : { knownLocales: ["en"], supportedLocales: ["en"] };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage which locales are available for translation.
      </p>
      <LocalesEditor
        knownLocales={settings.knownLocales ?? settings.supportedLocales ?? []}
        supportedLocales={settings.supportedLocales ?? []}
      />
    </div>
  );
}
