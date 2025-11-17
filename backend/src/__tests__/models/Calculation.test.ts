import { CalculationModel } from '../../models/Calculation';
import { OperationType } from '../../types';

describe('CalculationModel', () => {
  describe('calculateResult', () => {
    it('should add correctly', () => {
      const result = CalculationModel.calculateResult(10, OperationType.ADD, 5);
      expect(result).toBe(15);
    });

    it('should subtract correctly', () => {
      const result = CalculationModel.calculateResult(10, OperationType.SUBTRACT, 5);
      expect(result).toBe(5);
    });

    it('should multiply correctly', () => {
      const result = CalculationModel.calculateResult(10, OperationType.MULTIPLY, 5);
      expect(result).toBe(50);
    });

    it('should divide correctly', () => {
      const result = CalculationModel.calculateResult(10, OperationType.DIVIDE, 5);
      expect(result).toBe(2);
    });

    it('should throw error on division by zero', () => {
      expect(() => {
        CalculationModel.calculateResult(10, OperationType.DIVIDE, 0);
      }).toThrow('Division by zero is not allowed');
    });

    it('should handle decimal results', () => {
      const result = CalculationModel.calculateResult(10, OperationType.DIVIDE, 3);
      expect(result).toBeCloseTo(3.333, 2);
    });

    it('should handle negative numbers', () => {
      const result = CalculationModel.calculateResult(-10, OperationType.ADD, 5);
      expect(result).toBe(-5);
    });
  });
});

