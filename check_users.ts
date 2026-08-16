import { getDb } from "./api/queries/connection";
import * as schema from "./db/schema";

async function main() {
  const db = getDb();
  const allUsers = await db.select().from(schema.users);
  console.log("Users in DB:", JSON.stringify(allUsers, null, 2));
}

main().catch(console.error);
