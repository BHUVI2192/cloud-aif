import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const isDev = process.env.NODE_ENV === "development";
const enableSlowQueryLogging =
  isDev || process.env.LOG_SLOW_QUERIES === "true" || process.env.ENABLE_PRISMA_QUERY_LOGS === "true";

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: enableSlowQueryLogging
      ? [{ emit: "event", level: "query" }, "error", "warn"]
      : ["error"],
  });

if (enableSlowQueryLogging) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (db as any).$on("query", (e: { query: string; params: string; duration: number }) => {
    const thresholdMs = Number(process.env.SLOW_QUERY_THRESHOLD_MS ?? 100);
    if (e.duration >= thresholdMs) {
      const timeStr = new Date().toISOString();
      console.warn(
        `\x1b[33m[SLOW SQL DB AUDIT]\x1b[0m ${timeStr} | \x1b[31m${e.duration}ms\x1b[0m\n` +
          `  Query:  ${e.query}\n` +
          `  Params: ${e.params}\n` +
          `  --------------------------------------------------`
      );
    }
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
