import { Response } from 'express';
import { CalculationModel } from '../models/Calculation';
import { AuthRequest, CreateCalculationRequest } from '../types';

export class CalculationController {
  // Get all calculation trees (public)
  static async getAllTrees(req: AuthRequest, res: Response): Promise<void> {
    try {
      const trees = await CalculationModel.getTree();
      res.json({ trees });
    } catch (error) {
      console.error('Error fetching trees:', error);
      res.status(500).json({ error: 'Failed to fetch calculation trees' });
    }
  }

  // Get specific calculation tree by root ID
  static async getTreeById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const trees = await CalculationModel.getTree(parseInt(id));
      
      if (!trees || trees.length === 0) {
        res.status(404).json({ error: 'Calculation tree not found' });
        return;
      }

      res.json({ tree: trees[0] });
    } catch (error) {
      console.error('Error fetching tree:', error);
      res.status(500).json({ error: 'Failed to fetch calculation tree' });
    }
  }

  // Create a new calculation (root or child)
  static async createCalculation(
    req: AuthRequest<{}, {}, CreateCalculationRequest>,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { parent_id, operation_type, operand } = req.body;

      // Validate operand
      if (typeof operand !== 'number' || isNaN(operand)) {
        res.status(400).json({ error: 'Invalid operand' });
        return;
      }

      let calculation;

      if (!parent_id) {
        // Create root calculation (starting number)
        if (operation_type) {
          res.status(400).json({ 
            error: 'Root calculations (starting numbers) should not have an operation type' 
          });
          return;
        }
        calculation = await CalculationModel.createRoot(req.user.id, operand);
      } else {
        // Create child calculation (operation on existing calculation)
        if (!operation_type) {
          res.status(400).json({ 
            error: 'Child calculations must have an operation type' 
          });
          return;
        }
        calculation = await CalculationModel.createChild(
          req.user.id,
          parent_id,
          operation_type,
          operand
        );
      }

      // Fetch the complete calculation with username
      const completeCalculation = await CalculationModel.findById(calculation.id);

      res.status(201).json({
        message: 'Calculation created successfully',
        calculation: completeCalculation
      });
    } catch (error: any) {
      console.error('Error creating calculation:', error);
      if (error.message === 'Parent calculation not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Division by zero is not allowed') {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('too large') || error.message.includes('overflow') || error.message.includes('numeric field overflow')) {
        res.status(400).json({ error: error.message || 'Number is too large. Please use smaller numbers.' });
      } else if (error.message.includes('not finite') || error.message.includes('Infinity') || error.message.includes('NaN')) {
        res.status(400).json({ error: 'Invalid number. Please enter a valid number.' });
      } else {
        res.status(500).json({ error: error.message || 'Failed to create calculation' });
      }
    }
  }

  // Get all root calculations
  static async getRoots(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roots = await CalculationModel.getAllRoots();
      res.json({ calculations: roots });
    } catch (error) {
      console.error('Error fetching roots:', error);
      res.status(500).json({ error: 'Failed to fetch root calculations' });
    }
  }

  // Get children of a specific calculation
  static async getChildren(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const children = await CalculationModel.getChildren(parseInt(id));
      res.json({ calculations: children });
    } catch (error) {
      console.error('Error fetching children:', error);
      res.status(500).json({ error: 'Failed to fetch child calculations' });
    }
  }

  // Delete a calculation (only if user owns it)
  static async deleteCalculation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const deleted = await CalculationModel.delete(parseInt(id), req.user.id);

      if (!deleted) {
        res.status(404).json({ error: 'Calculation not found or unauthorized' });
        return;
      }

      res.json({ message: 'Calculation deleted successfully' });
    } catch (error) {
      console.error('Error deleting calculation:', error);
      res.status(500).json({ error: 'Failed to delete calculation' });
    }
  }
}

