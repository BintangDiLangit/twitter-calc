import { pool } from '../config/database';
import { Calculation, OperationType, CalculationTree } from '../types';

export class CalculationModel {
  static calculateResult(
    parentResult: number,
    operation: OperationType,
    operand: number
  ): number {
    switch (operation) {
      case OperationType.ADD:
        return parentResult + operand;
      case OperationType.SUBTRACT:
        return parentResult - operand;
      case OperationType.MULTIPLY:
        return parentResult * operand;
      case OperationType.DIVIDE:
        if (operand === 0) {
          throw new Error('Division by zero is not allowed');
        }
        return parentResult / operand;
      default:
        throw new Error('Invalid operation type');
    }
  }

  static async createRoot(userId: number, operand: number): Promise<Calculation> {
    const result = await pool.query(
      `INSERT INTO calculations (user_id, parent_id, operation_type, operand, result, depth)
       VALUES ($1, NULL, NULL, $2, $2, 0)
       RETURNING *`,
      [userId, operand]
    );
    return result.rows[0];
  }

  static async createChild(
    userId: number,
    parentId: number,
    operationType: OperationType,
    operand: number
  ): Promise<Calculation> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get parent calculation
      const parentResult = await client.query(
        'SELECT result, depth FROM calculations WHERE id = $1',
        [parentId]
      );

      if (parentResult.rows.length === 0) {
        throw new Error('Parent calculation not found');
      }

      const parentCalculation = parentResult.rows[0];
      const result = this.calculateResult(
        parseFloat(parentCalculation.result),
        operationType,
        operand
      );
      const depth = parentCalculation.depth + 1;

      // Insert child calculation
      const insertResult = await client.query(
        `INSERT INTO calculations (user_id, parent_id, operation_type, operand, result, depth)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, parentId, operationType, operand, result, depth]
      );

      await client.query('COMMIT');
      return insertResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<Calculation | null> {
    const result = await pool.query(
      `SELECT c.*, u.username 
       FROM calculations c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async getAllRoots(): Promise<Calculation[]> {
    const result = await pool.query(
      `SELECT c.*, u.username 
       FROM calculations c
       JOIN users u ON c.user_id = u.id
       WHERE c.parent_id IS NULL
       ORDER BY c.created_at DESC`
    );
    return result.rows;
  }

  static async getChildren(parentId: number): Promise<Calculation[]> {
    const result = await pool.query(
      `SELECT c.*, u.username 
       FROM calculations c
       JOIN users u ON c.user_id = u.id
       WHERE c.parent_id = $1
       ORDER BY c.created_at ASC`,
      [parentId]
    );
    return result.rows;
  }

  static async getTree(rootId?: number): Promise<CalculationTree[]> {
    let query = `
      WITH RECURSIVE tree AS (
        SELECT c.*, u.username, 0 as level
        FROM calculations c
        JOIN users u ON c.user_id = u.id
        WHERE ${rootId ? 'c.id = $1' : 'c.parent_id IS NULL'}
        
        UNION ALL
        
        SELECT c.*, u.username, t.level + 1
        FROM calculations c
        JOIN users u ON c.user_id = u.id
        JOIN tree t ON c.parent_id = t.id
      )
      SELECT * FROM tree
      ORDER BY level, created_at ASC
    `;

    const result = rootId 
      ? await pool.query(query, [rootId])
      : await pool.query(query);

    // Build tree structure
    const calculationsMap = new Map<number, CalculationTree>();
    const roots: CalculationTree[] = [];

    result.rows.forEach((row) => {
      calculationsMap.set(row.id, { ...row, children: [] });
    });

    result.rows.forEach((row) => {
      const node = calculationsMap.get(row.id)!;
      if (row.parent_id === null) {
        roots.push(node);
      } else {
        const parent = calculationsMap.get(row.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return rootId ? [roots[0]] : roots;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM calculations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}

