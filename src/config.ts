import * as dotenv from 'dotenv';
dotenv.config();

import type { MigrationConfig } from "drizzle-orm/migrator";

export type APIConfig = {
  platform: string
  db: DBConfig,
  fileserverHits: number;
};

export type DBConfig = {
  migrationConfig: MigrationConfig
  url: string
}

const envOrThrow = (key: string) => {
  if (typeof process.env[key] !== 'string') {
    throw new Error(`Could not find env var with key: ${key}`);
  }
  return process.env[key];
};

const url = envOrThrow('DB_URL')
const migrationsFolder = './drizzle'
const platform = envOrThrow('PLATFORM')

export const config: APIConfig  = {
  db: {
    migrationConfig: {
      migrationsFolder,
    },
    url
  },
  fileserverHits: 0,
  platform
}