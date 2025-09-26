import { seedRoles } from "~/server/db/Seeders/seedRoles";
import { pool } from "~/server/db";

async function main() {
  try {
    // Add your seeders here
    await seedRoles();

    console.log("Seeding complete");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await pool.end();
  }
}

void main();
