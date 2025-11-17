// Database initialization script
// Run this once after deployment to set up tables

import { initDatabase } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🔄 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

main();

