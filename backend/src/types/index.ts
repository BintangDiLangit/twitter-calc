import { Request } from 'express';

export enum OperationType {
  ADD = 'add',
  SUBTRACT = 'subtract',
  MULTIPLY = 'multiply',
  DIVIDE = 'divide'
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface Calculation {
  id: number;
  user_id: number;
  parent_id: number | null;
  operation_type: OperationType | null;
  operand: number;
  result: number;
  depth: number;
  created_at: Date;
  username?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export interface CalculationTree extends Calculation {
  children: CalculationTree[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface CreateCalculationRequest {
  parent_id?: number;
  operation_type?: OperationType;
  operand: number;
}

