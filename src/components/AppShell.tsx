"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useReadyAuth } from "@/lib/auth/session";
import { Nav } from "./Nav";

export function AppShell({ children }: { children: ReactNode }) {
  const { role, signOut } = useReadyAuth();
  const pathname = usePathname() ?? "/";
  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="brand">
          <Image src="/icon.svg" alt="" width={32} height={32} />
          <span>KodiLedger</span>
        </div>
        <Nav role={role} pathname={pathname} variant="side" />
        <div className="sidebar-foot">
          <span className="badge badge-vacant">{role}</span>
          <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <div className="brand">
            <Image src="/icon.svg" alt="" width={28} height={28} />
            <span>KodiLedger</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
            Sign out
          </button>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </div>
      <Nav role={role} pathname={pathname} variant="bottom" />
    </div>
  );
}
