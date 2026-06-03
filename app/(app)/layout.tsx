import NavBar from "@/components/NavBar";
import { getCurrentProfile } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No login screen: getCurrentProfile defaults to the seeded intern (Tyler).
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-steel-300">
        Initializing the local database… refresh in a moment. If this persists,
        ensure the app can write to the <code className="text-accent">data/</code> folder.
      </main>
    );
  }

  // The "view as" toggle is always available in this local-first build.
  const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_TOGGLE !== "false";

  return (
    <div className="min-h-screen">
      <NavBar profile={profile} demoEnabled={demoEnabled} />
      <main className="mx-auto max-w-6xl animate-fade-in px-4 py-6 sm:py-8">
        {children}
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-steel-500">
        Westside Lexus Voice AI — Intern Journey · GST Data &amp; AI · Summer 2026
      </footer>
    </div>
  );
}
