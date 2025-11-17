import React, { useState } from 'react';
import { OperationType } from '../types';
import { Plus, Minus, X as XIcon, Divide, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (operand: number, operationType?: OperationType) => Promise<void>;
  parentId?: number;
  parentResult?: number | string; // Can be string from database
}

const operationIcons: Record<OperationType, React.ReactNode> = {
  [OperationType.ADD]: <Plus size={20} />,
  [OperationType.SUBTRACT]: <Minus size={20} />,
  [OperationType.MULTIPLY]: <XIcon size={20} />,
  [OperationType.DIVIDE]: <Divide size={20} />,
};

const operationLabels: Record<OperationType, string> = {
  [OperationType.ADD]: 'Add',
  [OperationType.SUBTRACT]: 'Subtract',
  [OperationType.MULTIPLY]: 'Multiply',
  [OperationType.DIVIDE]: 'Divide',
};

const operationColors: Record<OperationType, string> = {
  [OperationType.ADD]: 'var(--op-add)',
  [OperationType.SUBTRACT]: 'var(--op-subtract)',
  [OperationType.MULTIPLY]: 'var(--op-multiply)',
  [OperationType.DIVIDE]: 'var(--op-divide)',
};

export const CreateCalculationModal: React.FC<CreateCalculationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentId,
  parentResult,
}) => {
  const [operand, setOperand] = useState('');
  const [operationType, setOperationType] = useState<OperationType | undefined>(
    parentId ? OperationType.ADD : undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operandError, setOperandError] = useState('');

  // Maximum safe number (28 digits before decimal, matches backend NUMERIC(38,10))
  const MAX_SAFE_NUMBER = 9999999999999999999999999999;
  const MIN_SAFE_NUMBER = -9999999999999999999999999999;

  const validateNumber = (value: number): string => {
    if (!Number.isFinite(value)) {
      return 'Please enter a valid number';
    }
    
    if (value > MAX_SAFE_NUMBER || value < MIN_SAFE_NUMBER) {
      return `Number is too large. Maximum allowed: ±${MAX_SAFE_NUMBER.toLocaleString()}`;
    }
    
    return '';
  };

  const formatNumberForDisplay = (num: number): string => {
    if (!Number.isFinite(num)) {
      return 'Invalid';
    }

    // If number is too large, use scientific notation with better formatting
    if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-5 && num !== 0)) {
      return num.toExponential(2);
    }

    // For large integers, add thousand separators
    if (Number.isInteger(num) && Math.abs(num) > 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    // For decimals, limit to 10 decimal places
    if (!Number.isInteger(num)) {
      const fixed = num.toFixed(10);
      // Remove trailing zeros
      return parseFloat(fixed).toString();
    }

    return num.toString();
  };

  const handleOperandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOperand(value);
    
    // Validate if value is not empty
    if (value.trim() !== '') {
      const operandNum = parseFloat(value);
      if (!isNaN(operandNum)) {
        setOperandError(validateNumber(operandNum));
      } else {
        setOperandError('Please enter a valid number');
      }
    } else {
      setOperandError('');
    }
    
    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const operandNum = parseFloat(operand);
    if (isNaN(operandNum)) {
      setError('Please enter a valid number');
      return;
    }

    // Validate operand
    const operandError = validateNumber(operandNum);
    if (operandError) {
      setError(operandError);
      return;
    }

    if (parentId && !operationType) {
      setError('Please select an operation');
      return;
    }

    if (operationType === OperationType.DIVIDE && operandNum === 0) {
      setError('Cannot divide by zero');
      return;
    }

    // Validate result if it's a child calculation
    if (parentId && parentResult !== undefined && operationType) {
      const parentResultNum = typeof parentResult === 'string' ? parseFloat(parentResult) : parentResult;
      if (!isNaN(parentResultNum)) {
        let calculatedResult: number;
        switch (operationType) {
          case OperationType.ADD:
            calculatedResult = parentResultNum + operandNum;
            break;
          case OperationType.SUBTRACT:
            calculatedResult = parentResultNum - operandNum;
            break;
          case OperationType.MULTIPLY:
            calculatedResult = parentResultNum * operandNum;
            if (!Number.isFinite(calculatedResult)) {
              setError('Multiplication result is too large (overflow)');
              return;
            }
            break;
          case OperationType.DIVIDE:
            calculatedResult = parentResultNum / operandNum;
            break;
          default:
            calculatedResult = operandNum;
        }
        
        const resultError = validateNumber(calculatedResult);
        if (resultError) {
          setError(resultError);
          return;
        }
      }
    }

    try {
      setLoading(true);
      await onSubmit(operandNum, operationType);
      setOperand('');
      setOperationType(parentId ? OperationType.ADD : undefined);
      onClose();
    } catch (err: any) {
      // Show user-friendly error messages
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create calculation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculatePreview = (): { result: string; isValid: boolean; error?: string } => {
    const operandNum = parseFloat(operand);
    if (isNaN(operandNum) || parentResult === undefined || !operationType) {
      return { result: '?', isValid: false };
    }

    // Convert parentResult to number if it's a string (from database)
    const parentResultNum = typeof parentResult === 'string' ? parseFloat(parentResult) : parentResult;
    if (isNaN(parentResultNum)) {
      return { result: '?', isValid: false };
    }

    // Validate inputs
    const operandError = validateNumber(operandNum);
    const parentError = validateNumber(parentResultNum);
    
    if (operandError || parentError) {
      return { 
        result: 'Too large', 
        isValid: false, 
        error: operandError || parentError 
      };
    }

    let result: number;
    try {
      switch (operationType) {
        case OperationType.ADD:
          result = parentResultNum + operandNum;
          break;
        case OperationType.SUBTRACT:
          result = parentResultNum - operandNum;
          break;
        case OperationType.MULTIPLY:
          result = parentResultNum * operandNum;
          if (!Number.isFinite(result)) {
            return { result: 'Overflow', isValid: false, error: 'Result is too large' };
          }
          break;
        case OperationType.DIVIDE:
          if (operandNum === 0) {
            return { result: 'Error', isValid: false, error: 'Cannot divide by zero' };
          }
          result = parentResultNum / operandNum;
          break;
        default:
          return { result: '?', isValid: false };
      }

      // Validate result
      const resultError = validateNumber(result);
      if (resultError) {
        return { result: 'Too large', isValid: false, error: resultError };
      }

      if (isNaN(result) || !Number.isFinite(result)) {
        return { result: 'Invalid', isValid: false };
      }

      return { result: formatNumberForDisplay(result), isValid: true };
    } catch (err) {
      return { result: 'Error', isValid: false, error: 'Calculation error' };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="modal-header">
            <h3 className="modal-title">
              {parentId ? 'Add Operation' : 'Start New Calculation'}
            </h3>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem' }}
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              {parentId && parentResult !== undefined && (
                <div className="mb-3">
                  <label className="input-label">Operation</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {Object.values(OperationType).map((op) => (
                      <motion.button
                        key={op}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOperationType(op)}
                        style={{
                          padding: '1rem',
                          border: `2px solid ${operationType === op ? operationColors[op] : 'var(--border)'}`,
                          borderRadius: '0.5rem',
                          background: operationType === op ? `${operationColors[op]}20` : 'var(--bg-tertiary)',
                          color: operationType === op ? operationColors[op] : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          fontWeight: '600',
                          transition: 'var(--transition)',
                        }}
                      >
                        {operationIcons[op]}
                        {operationLabels[op]}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">
                  {parentId ? 'Number' : 'Starting Number'}
                </label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={operand}
                  onChange={handleOperandChange}
                  onBlur={() => {
                    // Validate on blur as well
                    if (operand.trim() !== '') {
                      const operandNum = parseFloat(operand);
                      if (!isNaN(operandNum)) {
                        setOperandError(validateNumber(operandNum));
                      } else {
                        setOperandError('Please enter a valid number');
                      }
                    }
                  }}
                  placeholder="Enter a number"
                  autoFocus
                  required
                  style={{
                    borderColor: operandError ? 'var(--error)' : undefined,
                    borderWidth: operandError ? '2px' : undefined,
                  }}
                />
                {operandError ? (
                  <small style={{ color: 'var(--error)', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                    {operandError}
                  </small>
                ) : (
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Maximum: ±{MAX_SAFE_NUMBER.toLocaleString()}
                  </small>
                )}
              </div>

              {parentId && parentResult !== undefined && operand && operationType && (() => {
                const preview = calculatePreview();
                const parentResultNum = typeof parentResult === 'string' ? parseFloat(parentResult) : parentResult;
                const formattedParent = formatNumberForDisplay(parentResultNum);
                const formattedOperand = formatNumberForDisplay(parseFloat(operand));
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '1rem',
                      background: preview.isValid ? 'var(--bg-tertiary)' : 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '0.5rem',
                      border: `1px solid ${preview.isValid ? operationColors[operationType] : 'var(--error)'}`,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Preview:
                    </div>
                    <div style={{ 
                      fontSize: '1rem', 
                      fontWeight: 'bold',
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        {formattedParent} {operationLabels[operationType].toLowerCase()} {formattedOperand}
                      </div>
                      <div style={{ 
                        color: preview.isValid ? operationColors[operationType] : 'var(--error)',
                        fontSize: '1.125rem',
                      }}>
                        = {preview.result}
                      </div>
                      {preview.error && (
                        <div style={{ 
                          color: 'var(--error)', 
                          fontSize: '0.875rem', 
                          marginTop: '0.5rem',
                          fontWeight: 'normal'
                        }}>
                          ⚠️ {preview.error}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

