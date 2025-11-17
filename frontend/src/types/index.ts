export enum OperationType {
  ADD = 'add',
  SUBTRACT = 'subtract',
  MULTIPLY = 'multiply',
  DIVIDE = 'divide'
}

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Calculation {
  id: number;
  user_id: number;
  parent_id: number | null;
  operation_type: OperationType | null;
  operand: number;
  result: number;
  depth: number;
  created_at: string;
  username?: string;
}

export interface CalculationTree extends Calculation {
  children: CalculationTree[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface CreateCalculationRequest {
  parent_id?: number;
  operation_type?: OperationType;
  operand: number;
}

