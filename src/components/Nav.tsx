import Link from "next/link";
import type { Role } from "@/lib/api/types";
import { navFor } from "@/lib/auth/roles";

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav({ role, pathname, variant }: { role: Role; pathname: string; variant: "side" | "bottom" }) {
  return (
    <nav aria-label={variant === "side" ? "Primary" : "Primary (mobile)"} className={`nav nav-${variant}`}>
      {navFor(role).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className="nav-link"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
