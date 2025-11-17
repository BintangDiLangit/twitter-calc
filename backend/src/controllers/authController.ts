import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { LoginRequest, RegisterRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthController {
  static async register(req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        res.status(409).json({ error: 'Username already exists' });
        return;
      }

      // Validate username
      if (username.length < 3 || username.length > 30) {
        res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
        return;
      }

      // Validate password
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      // Create user
      const user = await UserModel.create(username, password);

      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  static async login(req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await UserModel.findByUsername(username);
      if (!user) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      // Verify password
      const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  static async validateToken(req: Request, res: Response): Promise<void> {
    // If we reach here, the token is valid (checked by authenticate middleware)
    res.json({ valid: true });
  }
}

