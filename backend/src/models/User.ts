import { pool } from '../config/database';
import { User } from '../types';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async create(username: string, password: string): Promise<User> {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, password_hash]
    );
    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, username, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async getAll(): Promise<Omit<User, 'password_hash'>[]> {
    const result = await pool.query(
      'SELECT id, username, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }
}

