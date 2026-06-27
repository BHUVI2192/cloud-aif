import { requireRoleOrRedirect } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin");
  return <>{children}</>;
}
