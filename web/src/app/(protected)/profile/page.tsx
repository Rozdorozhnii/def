import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-10">Profile</h1>
      <ProfileForm user={user!} />
    </main>
  );
}
