import Link from "next/link";
import SignOutButton from "./SignOutButton";

export default function DashboardShell({
  title,
  nav,
  active,
  children,
  user,
}: {
  title: string;
  nav: { label: string; href: string }[];
  active: string;
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role: string; image?: string | null };
}) {
  const homeHref =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ? "/admin"
      : user.role === "PROVIDER"
      ? "/provider"
      : user.role === "CUSTOMER"
      ? "/customer"
      : "/";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-r p-6 md:min-h-screen" style={{ borderColor: "var(--line)", background: "#fff" }}>
        <Link href={homeHref} className="mb-8 flex items-center gap-2.5 font-display text-[20px] font-semibold" style={{ color: "var(--forest)" }}>
          <span className="grid h-[32px] w-[32px] place-items-center rounded-[9px] text-[16px] text-white" style={{ background: "var(--brand)" }}>C</span>
          Cloud AIF
        </Link>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition" style={n.href === active ? { background: "var(--mist)", color: "var(--forest)" } : { color: "var(--slate)" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t pt-5 flex items-center gap-3" style={{ borderColor: "var(--line)" }}>
          {user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border"
              style={{ borderColor: "var(--line)" }}
            />
          )}
          <div>
            <div className="text-[13px] font-semibold" style={{ color: "var(--forest)" }}>{user.name ?? user.email}</div>
            <div className="text-[12px] capitalize" style={{ color: "var(--slate)" }}>{user.role.replace(/_/g, " ").toLowerCase()}</div>
          </div>
        </div>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </aside>
      <main className="p-7 md:p-10">
        <h1 className="mb-6 text-[30px]">{title}</h1>
        {children}
      </main>
    </div>
  );
}
