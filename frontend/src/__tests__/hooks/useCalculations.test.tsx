import { renderHook, waitFor } from '@testing-library/react';
import { useCalculations } from '../../hooks/useCalculations';
import { calculationAPI } from '../../services/api';

jest.mock('../../services/api');

const mockTrees = [
  {
    id: 1,
    user_id: 1,
    parent_id: null,
    operation_type: null,
    operand: 10,
    result: 10,
    depth: 0,
    created_at: '2024-01-01T00:00:00Z',
    username: 'testuser',
    children: [],
  },
];

describe('useCalculations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches trees on mount', async () => {
    (calculationAPI.getAllTrees as jest.Mock).mockResolvedValue(mockTrees);

    const { result } = renderHook(() => useCalculations());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trees).toEqual(mockTrees);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch';
    (calculationAPI.getAllTrees as jest.Mock).mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    const { result } = renderHook(() => useCalculations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.trees).toEqual([]);
  });

  it('creates calculation and refetches', async () => {
    (calculationAPI.getAllTrees as jest.Mock).mockResolvedValue(mockTrees);
    (calculationAPI.createCalculation as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useCalculations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.createCalculation({ operand: 20 });

    expect(calculationAPI.createCalculation).toHaveBeenCalledWith({ operand: 20 });
    expect(calculationAPI.getAllTrees).toHaveBeenCalledTimes(2);
  });
});

