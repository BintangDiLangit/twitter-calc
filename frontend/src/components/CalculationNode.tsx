import React, { useState } from 'react';
import { CalculationTree, OperationType } from '../types';
import { Plus, Minus, X, Divide, Trash2, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

interface CalculationNodeProps {
  node: CalculationTree;
  onAddOperation: (parentId: number) => void;
  onDelete: (id: number) => void;
  depth?: number;
}

const operationIcons: Record<OperationType, React.ReactNode> = {
  [OperationType.ADD]: <Plus size={16} />,
  [OperationType.SUBTRACT]: <Minus size={16} />,
  [OperationType.MULTIPLY]: <X size={16} />,
  [OperationType.DIVIDE]: <Divide size={16} />,
};

const operationColors: Record<OperationType, string> = {
  [OperationType.ADD]: 'var(--op-add)',
  [OperationType.SUBTRACT]: 'var(--op-subtract)',
  [OperationType.MULTIPLY]: 'var(--op-multiply)',
  [OperationType.DIVIDE]: 'var(--op-divide)',
};

const operationSymbols: Record<OperationType, string> = {
  [OperationType.ADD]: '+',
  [OperationType.SUBTRACT]: '−',
  [OperationType.MULTIPLY]: '×',
  [OperationType.DIVIDE]: '÷',
};

export const CalculationNode: React.FC<CalculationNodeProps> = ({
  node,
  onAddOperation,
  onDelete,
  depth = 0,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const isOwner = user?.id === node.user_id;

  const formatNumber = (num: number | string): string => {
    // Convert to number if it's a string (from database)
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(numValue)) {
      return '0';
    }
    
    return Number.isInteger(numValue) ? numValue.toString() : numValue.toFixed(2);
  };

  const nodeStyle: React.CSSProperties = {
    background: node.operation_type
      ? `linear-gradient(135deg, ${operationColors[node.operation_type]}15, ${operationColors[node.operation_type]}25)`
      : 'linear-gradient(135deg, var(--primary)15, var(--secondary)25)',
    border: `2px solid ${node.operation_type ? operationColors[node.operation_type] : 'var(--primary)'}`,
    borderRadius: '1rem',
    padding: '1.5rem',
    position: 'relative',
    marginLeft: depth > 0 ? '2rem' : '0',
    marginTop: depth > 0 ? '1rem' : '0',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={nodeStyle}>
        {/* Node Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              {node.operation_type && (
                <span style={{ 
                  color: operationColors[node.operation_type],
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}>
                  {operationSymbols[node.operation_type]}
                </span>
              )}
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                by {node.username}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(node.created_at).toLocaleString()}
            </div>
          </div>

          {isAuthenticated && isOwner && isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="btn btn-secondary btn-sm"
              onClick={() => onDelete(node.id)}
              style={{ padding: '0.5rem' }}
            >
              <Trash2 size={16} />
            </motion.button>
          )}
        </div>

        {/* Calculation Display */}
        <div style={{ marginBottom: '1rem' }}>
          {node.operation_type ? (
            <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Previous result</span>
              {' '}
              <span style={{ 
                color: operationColors[node.operation_type],
                fontWeight: 'bold'
              }}>
                {operationSymbols[node.operation_type]}
              </span>
              {' '}
              <span style={{ fontWeight: '600' }}>{formatNumber(node.operand)}</span>
            </div>
          ) : (
            <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Starting number:</span>
              {' '}
              <span style={{ fontWeight: '600' }}>{formatNumber(node.operand)}</span>
            </div>
          )}
          
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginTop: '0.5rem',
            background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            = {formatNumber(node.result)}
          </div>
        </div>

        {/* Add Operation Button */}
        {isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-sm"
            onClick={() => onAddOperation(node.id)}
            style={{ width: '100%' }}
          >
            <PlusCircle size={18} />
            Add Operation
          </motion.button>
        )}
      </div>

      {/* Children */}
      {node.children && node.children.length > 0 && (
        <div style={{ 
          marginLeft: '2rem',
          paddingLeft: '1rem',
          borderLeft: `2px dashed ${node.operation_type ? operationColors[node.operation_type] : 'var(--primary)'}50`
        }}>
          {node.children.map((child) => (
            <CalculationNode
              key={child.id}
              node={child}
              onAddOperation={onAddOperation}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

