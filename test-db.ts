import { db } from "./src/lib/db";

async function main() {
  try {
    const users = await db.user.findMany();
    console.log("Users in DB:", users);
    const platformSettings = await db.platformSetting.findMany();
    console.log("Platform Settings in DB:", platformSettings);
  } catch (error) {
    console.error("Error connecting to DB:", error);
  }
}

main();
