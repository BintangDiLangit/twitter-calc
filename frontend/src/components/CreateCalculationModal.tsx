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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const operandNum = parseFloat(operand);
    if (isNaN(operandNum)) {
      setError('Please enter a valid number');
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

    try {
      setLoading(true);
      await onSubmit(operandNum, operationType);
      setOperand('');
      setOperationType(parentId ? OperationType.ADD : undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create calculation');
    } finally {
      setLoading(false);
    }
  };

  const calculatePreview = (): string => {
    const operandNum = parseFloat(operand);
    if (isNaN(operandNum) || parentResult === undefined || !operationType) return '?';

    // Convert parentResult to number if it's a string (from database)
    const parentResultNum = typeof parentResult === 'string' ? parseFloat(parentResult) : parentResult;
    if (isNaN(parentResultNum)) return '?';

    let result: number;
    switch (operationType) {
      case OperationType.ADD:
        result = parentResultNum + operandNum;
        break;
      case OperationType.SUBTRACT:
        result = parentResultNum - operandNum;
        break;
      case OperationType.MULTIPLY:
        result = parentResultNum * operandNum;
        break;
      case OperationType.DIVIDE:
        result = operandNum !== 0 ? parentResultNum / operandNum : NaN;
        break;
      default:
        return '?';
    }

    if (isNaN(result)) return '?';
    return Number.isInteger(result) ? result.toString() : result.toFixed(2);
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
                  onChange={(e) => setOperand(e.target.value)}
                  placeholder="Enter a number"
                  autoFocus
                  required
                />
              </div>

              {parentId && parentResult !== undefined && operand && operationType && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '0.5rem',
                    border: `1px solid ${operationColors[operationType]}`,
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Preview:
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {parentResult} {operationLabels[operationType].toLowerCase()} {operand} = <span style={{ color: operationColors[operationType] }}>{calculatePreview()}</span>
                  </div>
                </motion.div>
              )}
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

