import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import type { Session } from "next-auth";
import type { UserRole } from "@prisma/client";
import { db } from "./db";

export type Role = `${UserRole}`;

/** Current session in a Server Component / route handler (or null). */
export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

/** Require any signed-in active user, else redirect to login. */
export async function requireUser(callbackUrl = "/"): Promise<Session> {
  const session = await getSession();
  if (!session?.user) {
    const isAdminRoute = callbackUrl.startsWith("/admin");
    const loginPath = isAdminRoute ? "/adminlogin" : "/login";
    redirect(`${loginPath}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

/** Require one of the given roles, else redirect home. */
export async function requireRoleOrRedirect(allowed: Role[], callbackUrl = "/"): Promise<Session> {
  const session = await requireUser(callbackUrl);
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const currentRole = dbUser?.role ?? session.user.role;
  if (!allowed.includes(currentRole as Role)) redirect("/");
  return session;
}
