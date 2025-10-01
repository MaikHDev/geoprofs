import { seedRoles } from "~/server/db/Seeders/seedRoles";
import { pool } from "~/server/db";
import { seedPermissions } from "~/server/db/Seeders/SeedPermissions";

async function main() {
  try {
    // Add your seeders here
    await seedRoles();
    await seedPermissions();

    console.log("Seeding complete");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await pool.end();
  }
}

void main();
