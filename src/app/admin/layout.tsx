import { requireRoleOrRedirect } from "@/lib/session";
import AdminMobileBlocker from "@/components/AdminMobileBlocker";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin");
  return <AdminMobileBlocker>{children}</AdminMobileBlocker>;
}
