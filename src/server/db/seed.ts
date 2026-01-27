import { pool } from "~/server/db";
import { seedPermissions } from "~/server/db/Seeders/SeedPermissions";
import { seedUsersAndAccounts } from "~/server/db/Seeders/SeedUsersAndAccounts";
import { seedUserHasRoles } from "~/server/db/Seeders/SeedUserHasRoles";
import { seedRolesHasPermissions } from "~/server/db/Seeders/SeedRolesHasPermissions";
import { seedDelete } from "~/server/db/Seeders/DeleteSeeders";
import { seedRoles } from "~/server/db/Seeders/seedRoles";
import { seedDepartments } from "~/server/db/Seeders/SeedDepartments";
import { seedUserDepartments } from "~/server/db/Seeders/SeedUserDepartments";

async function main() {
  const args = Bun.argv.slice(2);

  try {
    switch (args[0]) {
      case "roles":
        await seedRoles();
        break;

      case "permissions":
        await seedPermissions();
        break;

      case "rolesHasPermissions":
        await seedRolesHasPermissions();
        break;

      case "users":
        await seedUsersAndAccounts();
        break;

      case "userHasRoles":
        await seedUserHasRoles();
        break;

      case "delete":
        await seedDelete();
        break;

      case "all":
        await seedDelete();
        await seedUsersAndAccounts();
        await seedRoles();
        await seedPermissions();
        await seedRolesHasPermissions();
        await seedUserHasRoles();
        await seedDepartments();
        await seedUserDepartments();
        break;

      default:
        console.error("Unknown argument");
    }

    console.log("Seeding complete");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

void main();
