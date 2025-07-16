import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

// Hardcoded database URL — swap this with your actual connection string
const DATABASE_URL = 'postgresql://postgres:CWeOIhxCZO8uoxtN@db.rlxdtkpcnsyqolmelcyl.supabase.co:5432/postgres';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle({ client: pool, schema });
