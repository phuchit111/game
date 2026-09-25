import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://gis_admin:gis_secret_pass@localhost:5433/attribute_mission',
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

export async function initDb() {
  try {
    const client = await pool.connect();
    console.log('[DB] Successfully connected to PostgreSQL Database.');
    
    // Ensure table exists even if init.sql didn't run
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        mode VARCHAR(20) NOT NULL,
        mission VARCHAR(50) DEFAULT 'attribute',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS mission VARCHAR(50) DEFAULT 'attribute';
      CREATE INDEX IF NOT EXISTS idx_leaderboard_mission_score ON leaderboard (mission, score DESC, created_at ASC);
    `);
    
    client.release();
  } catch (err) {
    console.error('[DB] Failed to connect to database:', err.message);
  }
}

export default pool;
