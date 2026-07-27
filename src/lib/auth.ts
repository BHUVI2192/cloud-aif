import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { db } from "./db";
import type { UserRole, UserStatus } from "@prisma/client";
import { verifyPassword } from "./crypto";

/**
 * Auth configuration.
 *
 * - CredentialsProvider gives a zero-setup "dev login": enter any seeded email
 *   (admin@cloudaif.in / provider@example.com / customer@example.com) and you're
 *   signed in with that user's real role. This exists so the app runs instantly
 *   without external OAuth credentials.
 * - GoogleProvider is wired up and activates automatically once GOOGLE_CLIENT_ID /
 *   GOOGLE_CLIENT_SECRET are present in the environment.
 *
 * JWT strategy is used so the Credentials provider works (the database-session
 * strategy is incompatible with credentials). role + status ride on the token.
 */
const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "user@example.com" },
      password: { label: "Password", type: "password" },
      idToken: { label: "Google ID Token", type: "text" },
    },
    async authorize(credentials) {
      console.log("DEBUG: authorize callback entered with credentials:", { email: credentials?.email });
      const email = credentials?.email?.toLowerCase().trim();
      const password = credentials?.password;
      const idToken = credentials?.idToken;

      // 1. Handle Native Google Sign-In via ID Token
      if (idToken) {
        try {
          const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
          if (!verifyRes.ok) {
            console.log("DEBUG: failed to verify Google ID Token with Google servers");
            return null;
          }
          const tokenInfo = await verifyRes.json();
          // Verify that the token is intended for our app
          if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
            console.log("DEBUG: Google ID Token audience mismatch:", tokenInfo.aud);
            return null;
          }
          const tokenEmail = tokenInfo.email?.toLowerCase().trim();
          if (!tokenEmail) return null;

          let user = await db.user.findUnique({ where: { email: tokenEmail } });
          if (!user) {
            user = await db.user.create({
              data: {
                email: tokenEmail,
                name: tokenInfo.name || tokenEmail.split("@")[0],
                image: tokenInfo.picture || null,
                role: "CUSTOMER",
              },
            });
          }
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        } catch (err) {
          console.error("Native Google token validation error:", err);
          return null;
        }
      }

      // 2. Fallback to standard email/password credentials login
      if (!email || !password) {
        console.log("DEBUG: email or password is empty");
        return null;
      }
      const user = await db.user.findUnique({ where: { email } });
      console.log("DEBUG: user found in DB:", user ? "yes" : "no");
      if (!user || user.status === "BANNED" || user.deletedAt) {
        console.log("DEBUG: user not found, banned, or deleted");
        return null;
      }
      if (user.passwordHash) {
        const isValid = verifyPassword(password, user.passwordHash);
        if (!isValid) {
          console.log("DEBUG: invalid password");
          return null;
        }
      } else {
        // If user registered via OAuth and has no password set yet
        console.log("DEBUG: user has no password set");
        return null;
      }
      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, load role/status; on later calls, refresh from DB so
      // admin role/status changes take effect without a full re-login.
      const email = (user?.email ?? token.email)?.toLowerCase();
      if (email) {
        const dbUser = await db.user.findUnique({
          where: { email },
          select: { id: true, role: true, status: true, image: true },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.image = dbUser.image;

          if (dbUser.role === "PROVIDER") {
            const providerProfile = await db.providerProfile.findUnique({
              where: { userId: dbUser.id },
              select: { status: true },
            });
            token.isProviderDraft = !providerProfile || providerProfile.status === "DRAFT";
          } else {
            token.isProviderDraft = false;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.image = (token.image as string) ?? null;
        session.user.isProviderDraft = !!token.isProviderDraft;
      }
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      status: UserStatus;
      isProviderDraft?: boolean;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: UserRole;
    status?: UserStatus;
    image?: string | null;
    isProviderDraft?: boolean;
  }
}
