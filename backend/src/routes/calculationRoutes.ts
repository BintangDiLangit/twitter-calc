import { Router } from 'express';
import { body } from 'express-validator';
import { CalculationController } from '../controllers/calculationController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { OperationType } from '../types';

const router = Router();

// Get all calculation trees (public)
router.get('/trees', optionalAuth, CalculationController.getAllTrees);

// Get specific calculation tree by root ID (public)
router.get('/trees/:id', optionalAuth, CalculationController.getTreeById);

// Get all root calculations (public)
router.get('/roots', optionalAuth, CalculationController.getRoots);

// Get children of a specific calculation (public)
router.get('/:id/children', optionalAuth, CalculationController.getChildren);

// Create a new calculation (authenticated)
router.post(
  '/',
  authenticate,
  validate([
    body('operand')
      .isNumeric()
      .withMessage('Operand must be a number'),
    body('parent_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Parent ID must be a positive integer'),
    body('operation_type')
      .optional()
      .isIn(Object.values(OperationType))
      .withMessage('Invalid operation type'),
  ]),
  CalculationController.createCalculation
);

// Delete a calculation (authenticated)
router.delete('/:id', authenticate, CalculationController.deleteCalculation);

export default router;

