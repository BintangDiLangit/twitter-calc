import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Adjust connection pool for serverless (Vercel)
// Serverless functions need smaller pools and shorter timeouts
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'calculation_tree',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: isServerless ? 2 : 20, // Smaller pool for serverless
  idleTimeoutMillis: isServerless ? 10000 : 30000,
  connectionTimeoutMillis: isServerless ? 5000 : 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit in serverless environment
  if (!isServerless) {
    process.exit(-1);
  }
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
    // Using NUMERIC(38, 10) which allows up to 28 digits before decimal and 10 after
    // This matches JavaScript's safe integer range (2^53 - 1)
    await client.query(`
      CREATE TABLE IF NOT EXISTS calculations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES calculations(id) ON DELETE CASCADE,
        operation_type VARCHAR(20),
        operand NUMERIC(38, 10) NOT NULL,
        result NUMERIC(38, 10) NOT NULL,
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

