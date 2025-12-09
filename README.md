# Techstack
### We have decided in our project group that we will be using: t3-app with: trpc, drizzle. Socket.io(websocket) and better-auth.

# SETUP

## Make sure you have bun installed, then proceed.

## If not:
### Windows
#### Run the following command in powershell:
- powershell -c "irm bun.sh/install.ps1|iex"

### macOS and Linux
- curl -fsSL https://bun.sh/install | bash

### 1. You need to have downloaded or cloned this project.
### 2. You must create a new file called '.env'.
### 3. Copy the contents of .env.example and put it in '.env'.
### 4. You need to fill in the blank variables with your own data.
### 5. Lastly you have to use these commands to run the project:
- #### Run: bun install.
- #### Run: 'bun run dev'.

### Optional commands:
- #### Run: 'bun run db:generate'.
- #### Run: 'bun run db:push'.

## Seeders

### If you want to run the seeders, run the following command:
-  bun run seed:all

### If you want to run a specific seeder, run the following command:
-  bun run seed <seeder-name>

#### List of seeders to run:
- ##### roles
- ##### permissions
- ##### rolesHasPermissions
- ##### users
- ##### userHasRoles
- ##### delete
- ###### all

# tests

### To run the tests, use the following command:
- bun run test


