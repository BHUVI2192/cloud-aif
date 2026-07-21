import { NextResponse } from "next/server";

/**
 * Executes an async function and measures its duration in milliseconds.
 */
export async function withTiming<T>(
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);
  return { result, durationMs };
}

/**
 * Creates a JSON response with Server-Timing headers attached conditionally
 * in development mode or for Admin sessions.
 */
export function createTimedResponse(
  data: unknown,
  durationMs: number,
  userRole?: string,
  status = 200
) {
  const response = NextResponse.json(data, { status });

  const isDev = process.env.NODE_ENV !== "production";
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  if (isDev || isAdmin) {
    response.headers.set(
      "Server-Timing",
      `api;dur=${durationMs};desc="Route Execution"`
    );
  }

  return response;
}
