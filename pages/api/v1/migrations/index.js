import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(req, res) {
  if (!methodIsAllowed(req.method)) {
    return res.status(405).json({
      error: `Method "${req.method}" not allowed`,
    });
  }

  let dbClient;
  let status = 200;
  try {
    dbClient = await database.getNewClient();
    const dryRun = req.method === "POST" ? false : true;
    const migrateOptions = generateMigrationOptions(dbClient, dryRun);
    const migrations = await migrationRunner(migrateOptions);

    if (!dryRun && migrations.length > 0) {
      status = 201;
    }

    return res.status(status).json(migrations);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}

function methodIsAllowed(method) {
  const allowedMethods = ["GET", "POST"];
  return allowedMethods.includes(method);
}

function generateMigrationOptions(dbClient, dryRun) {
  return {
    dbClient: dbClient,
    dryRun: dryRun,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}
