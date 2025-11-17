// Migration script to update DECIMAL to NUMERIC(38,10) for overflow protection
// Run this if you already have a database with the old schema

import { pool } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function migrateNumericColumns() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🔄 Migrating calculations table to NUMERIC(38,10)...');

    // Update operand column
    await client.query(`
      ALTER TABLE calculations 
      ALTER COLUMN operand TYPE NUMERIC(38, 10)
    `);

    // Update result column
    await client.query(`
      ALTER TABLE calculations 
      ALTER COLUMN result TYPE NUMERIC(38, 10)
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

migrateNumericColumns();

