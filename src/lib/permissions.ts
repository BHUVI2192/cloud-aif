import type { Session } from "next-auth";
import { UserRole, ProviderStatus } from "@prisma/client";
import { db } from "./db";

export type Role = `${UserRole}`;

const ROLE_RANK: Record<Role, number> = {
  CUSTOMER: 1,
  PROVIDER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function hasRole(session: Session | null, ...allowed: Role[]): boolean {
  if (!session?.user) return false;
  return allowed.includes(session.user.role as Role);
}

export function isAtLeast(session: Session | null, role: Role): boolean {
  if (!session?.user) return false;
  return ROLE_RANK[session.user.role as Role] >= ROLE_RANK[role];
}

export const isAdmin = (s: Session | null) => isAtLeast(s, "ADMIN");
export const isProvider = (s: Session | null) => hasRole(s, "PROVIDER");
export const isActive = (s: Session | null) => s?.user?.status === "ACTIVE";

/** Throws unless the session holds one of the allowed roles AND is active. */
export function requireRole(session: Session | null, ...allowed: Role[]): asserts session is Session {
  if (!session?.user) throw new AuthError("UNAUTHENTICATED");
  if (!isActive(session)) throw new AuthError("ACCOUNT_INACTIVE");
  if (!allowed.includes(session.user.role as Role)) throw new AuthError("FORBIDDEN");
}

/**
 * A provider profile is only publicly visible once approved AND active.
 * Centralizes the rule referenced across public routes.
 */
export function isProviderPublic(p: { status: ProviderStatus; isActive: boolean; deletedAt: Date | null }): boolean {
  return p.status === ProviderStatus.APPROVED && p.isActive && !p.deletedAt;
}

/** A review may only be created for a COMPLETED request the user owns. */
export async function canReviewRequest(userId: string, requestId: string): Promise<boolean> {
  const req = await db.serviceRequest.findUnique({
    where: { id: requestId },
    select: { customerId: true, status: true, review: { select: { id: true } } },
  });
  return !!req && req.customerId === userId && req.status === "COMPLETED" && !req.review;
}

export class AuthError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "FORBIDDEN" | "ACCOUNT_INACTIVE") {
    super(code);
  }
}
