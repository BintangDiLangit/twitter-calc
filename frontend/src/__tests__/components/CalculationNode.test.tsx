import { render, screen } from '@testing-library/react';
import { CalculationNode } from '../../components/CalculationNode';
import { CalculationTree, OperationType } from '../../types';
import { AuthProvider } from '../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const mockCalculation: CalculationTree = {
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
};

const mockChildCalculation: CalculationTree = {
  id: 2,
  user_id: 1,
  parent_id: 1,
  operation_type: OperationType.ADD,
  operand: 5,
  result: 15,
  depth: 1,
  created_at: '2024-01-01T00:00:00Z',
  username: 'testuser',
  children: [],
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('CalculationNode', () => {
  const mockOnAddOperation = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders root calculation correctly', () => {
    renderWithProviders(
      <CalculationNode
        node={mockCalculation}
        onAddOperation={mockOnAddOperation}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Starting number:/i)).toBeInTheDocument();
    expect(screen.getByText('= 10')).toBeInTheDocument();
    expect(screen.getByText(/by testuser/i)).toBeInTheDocument();
  });

  it('renders child calculation with operation', () => {
    renderWithProviders(
      <CalculationNode
        node={mockChildCalculation}
        onAddOperation={mockOnAddOperation}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Previous result/i)).toBeInTheDocument();
    expect(screen.getByText('= 15')).toBeInTheDocument();
  });

  it('renders children recursively', () => {
    const calculationWithChild: CalculationTree = {
      ...mockCalculation,
      children: [mockChildCalculation],
    };

    renderWithProviders(
      <CalculationNode
        node={calculationWithChild}
        onAddOperation={mockOnAddOperation}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('= 10')).toBeInTheDocument();
    expect(screen.getByText('= 15')).toBeInTheDocument();
  });
});

