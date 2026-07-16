import { db } from "../src/lib/db";

async function main() {
  try {
    const res = await db.$queryRawUnsafe("SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%secret%'");
    console.log("PG Settings result:", res);
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
}

main();
