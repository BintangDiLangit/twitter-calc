import React, { useState } from 'react';
import { useCalculations } from '../hooks/useCalculations';
import { useAuth } from '../contexts/AuthContext';
import { CalculationNode } from '../components/CalculationNode';
import { CreateCalculationModal } from '../components/CreateCalculationModal';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { OperationType } from '../types';

export const Home: React.FC = () => {
  const { trees, loading, error, createCalculation, deleteCalculation } = useCalculations();
  const { isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>();
  const [selectedParentResult, setSelectedParentResult] = useState<number | string | undefined>();

  const handleAddOperation = (parentId: number) => {
    const findNode = (nodes: typeof trees): typeof trees[0] | undefined => {
      for (const node of nodes) {
        if (node.id === parentId) return node;
        const found = findNode(node.children);
        if (found) return found;
      }
    };

    const parent = findNode(trees);
    if (parent) {
      setSelectedParentId(parentId);
      setSelectedParentResult(parent.result);
      setModalOpen(true);
    }
  };

  const handleCreateRoot = () => {
    setSelectedParentId(undefined);
    setSelectedParentResult(undefined);
    setModalOpen(true);
  };

  const handleSubmit = async (operand: number, operationType?: OperationType) => {
    await createCalculation({
      operand,
      operation_type: operationType,
      parent_id: selectedParentId,
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this calculation and all its children?')) {
      try {
        await deleteCalculation(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '3rem' }}
      >
        <h1 style={{ marginBottom: '1rem' }}>
          Mathematical Communication
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          A unique platform where people communicate through numbers and operations,
          creating beautiful trees of calculations.
        </p>
      </motion.div>

      {/* Create Root Button */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '2rem', textAlign: 'center' }}
        >
          <button
            onClick={handleCreateRoot}
            className="btn btn-primary"
            style={{ fontSize: '1.125rem' }}
          >
            <PlusCircle size={24} />
            Start New Calculation
          </button>
        </motion.div>
      )}

      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="alert alert-info"
          style={{ maxWidth: '600px', margin: '0 auto 2rem' }}
        >
          <AlertCircle size={20} />
          <span>Please login or register to start calculations and add operations.</span>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Trees */}
      {!loading && !error && (
        <>
          {trees.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌳</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                No calculations yet
              </h3>
              <p>
                {isAuthenticated
                  ? 'Be the first to start a calculation!'
                  : 'Login to start your first calculation.'}
              </p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {trees.map((tree, index) => (
                <motion.div
                  key={tree.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CalculationNode
                    node={tree}
                    onAddOperation={handleAddOperation}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <CreateCalculationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        parentId={selectedParentId}
        parentResult={selectedParentResult}
      />
    </div>
  );
};

