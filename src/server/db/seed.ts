import { seedRoles } from "~/server/db/Seeders/SeedRoles";
import { pool } from "~/server/db";
import { seedPermissions } from "~/server/db/Seeders/SeedPermissions";
import { seedUsers } from "~/server/db/Seeders/SeedUsers";
import { seedUserHasRoles } from "~/server/db/Seeders/SeedUserHasRoles";
import { seedRolesHasPermissions } from "~/server/db/Seeders/SeedRolesHasPermissions";
import { seedDelete } from "~/server/db/Seeders/DeleteSeeders";
import { signIn } from "../../../utils/auth-actions";

async function main() {

    const args = Bun.argv.slice(2);

    try {
        switch (args[0]) {
            case "roles":
                await seedRoles();
                break;

            case "Permissions":
                await seedPermissions();
                break;

            case "rolesHasPermissions":
                await seedRolesHasPermissions();
                break;

            case "users":
                await seedUsers();
                break;

            case "userHasRoles":
                await seedUserHasRoles();
                break;

            case "delete":
                await seedDelete();
                break;

            case "all":
              await seedDelete()
              await seedRoles();
              await seedPermissions();
              await seedRolesHasPermissions()
              await seedUsers();
              await seedUserHasRoles();
              break;

            default: console.error("Unknown argument");
        }

    console.log("Seeding complete");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await pool.end();
  }
}

void main();
