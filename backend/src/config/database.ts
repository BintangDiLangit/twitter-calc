import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'calculation_tree',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create calculations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS calculations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES calculations(id) ON DELETE CASCADE,
        operation_type VARCHAR(20),
        operand DECIMAL(20, 10) NOT NULL,
        result DECIMAL(20, 10) NOT NULL,
        depth INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_operation_type CHECK (
          operation_type IS NULL OR 
          operation_type IN ('add', 'subtract', 'multiply', 'divide')
        ),
        CONSTRAINT check_root_node CHECK (
          (parent_id IS NULL AND operation_type IS NULL) OR
          (parent_id IS NOT NULL AND operation_type IS NOT NULL)
        )
      )
    `);

    // Create index for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_calculations_parent_id 
      ON calculations(parent_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_calculations_user_id 
      ON calculations(user_id)
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

