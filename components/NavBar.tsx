"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Profile, Role } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏁" },
  { href: "/weeks", label: "Weekly Tracker", icon: "🗓️" },
  { href: "/workspace", label: "Voice AI Workspace", icon: "🎙️" },
];

export default function NavBar({
  profile,
  demoEnabled,
}: {
  profile: Profile;
  demoEnabled: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [...NAV];
  if (profile.role === "manager") {
    links.push({ href: "/manager", label: "Oversight", icon: "📊" });
  }

  async function switchRole(role: Role) {
    if (role === profile.role) return;
    setSwitching(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.push(role === "manager" ? "/manager" : "/dashboard");
    router.refresh();
    setSwitching(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-line bg-ink-soft text-base shadow-glow">
            🎙️
          </span>
          <span className="hidden text-sm font-semibold text-steel-50 sm:block">
            Voice AI <span className="text-accent">Journey</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink-line text-steel-50"
                    : "text-steel-300 hover:text-steel-100"
                }`}
              >
                <span className="mr-1">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Demo role toggle */}
          {demoEnabled && (
            <div className="hidden items-center rounded-lg border border-ink-line p-0.5 text-xs sm:flex">
              {(["intern", "manager"] as Role[]).map((r) => (
                <button
                  key={r}
                  disabled={switching}
                  onClick={() => switchRole(r)}
                  className={`rounded-md px-2.5 py-1 font-medium capitalize transition-colors ${
                    profile.role === r ? "bg-accent text-ink" : "text-steel-300"
                  }`}
                  title="Demo: switch role view"
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Identity */}
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-steel-100">{profile.full_name}</p>
            <p className="text-[10px] uppercase tracking-wide text-steel-400">
              {profile.role}
            </p>
          </div>

          <button
            className="btn-ghost px-2 py-1.5 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-ink-line px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-steel-200 hover:bg-ink-line/60"
            >
              <span className="mr-2">{l.icon}</span>
              {l.label}
            </Link>
          ))}
          {demoEnabled && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2">
              <span className="label">View as</span>
              {(["intern", "manager"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                    profile.role === r ? "bg-accent text-ink" : "border border-ink-line text-steel-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
