import { useState, useEffect } from 'react';
import { CalculationTree, CreateCalculationRequest } from '../types';
import { calculationAPI } from '../services/api';

export const useCalculations = () => {
  const [trees, setTrees] = useState<CalculationTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calculationAPI.getAllTrees();
      setTrees(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch calculations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrees();
  }, []);

  const createCalculation = async (data: CreateCalculationRequest) => {
    try {
      await calculationAPI.createCalculation(data);
      await fetchTrees(); // Refresh trees
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create calculation');
    }
  };

  const deleteCalculation = async (id: number) => {
    try {
      await calculationAPI.deleteCalculation(id);
      await fetchTrees(); // Refresh trees
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete calculation');
    }
  };

  return {
    trees,
    loading,
    error,
    createCalculation,
    deleteCalculation,
    refetch: fetchTrees,
  };
};

