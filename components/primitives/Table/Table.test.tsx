import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Table from './index';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  memo: (component) => component,
}));

jest.mock('@mui/material', () => ({
  Tooltip: jest.fn(({ children, title }) => (
    <div data-testid="mock-tooltip" data-title={title}>
      {children}
    </div>
  )),
}));

jest.mock('../../../utils/string', () => ({
  handleExtraProps: jest.fn((className) => className || ''),
}));

describe('Table Component', () => {
  const mockHeaders = [
    { key: 'name', label: 'Name',},
    { key: 'age', label: 'Age' },
    { 
      key: 'actions', 
      label: 'Actions',
      customRow: (item) => <button>Action for {item.name}</button> 
    },

  ];

  const mockData = [
    { name: 'mock-1', age: 30 },
    { name: 'mock-2', age: 25 },
  ];

  test('renders the table with correct headers', () => {
    render(<Table headers={mockHeaders} rows={mockData} />);
    
    mockHeaders.forEach(header => {
      expect(screen.getByText(header.label)).toBeInTheDocument();
    });
  });

  test('uses formatter function for cell values', () => {
    const headersWithFormatter = [
      { key: 'name', label: 'Name' },
      { 
        key: 'age', 
        label: 'Age', 
        formatter: (value: number) => `${value} years old`
      },
    ];

    render(<Table headers={headersWithFormatter} rows={mockData} />);

    expect(screen.getByText('30 years old')).toBeInTheDocument();
    expect(screen.getByText('25 years old')).toBeInTheDocument();
  });

  test('shows tooltip when showTooltip is true', () => {
    const headersWithTooltip = [
      { key: 'name', label: 'Name', showTooltip: true },
      { key: 'age', label: 'Age' },
    ];

    render(<Table headers={headersWithTooltip} rows={mockData} />);

    const tooltips = screen.getAllByTestId('mock-tooltip');
    expect(tooltips).toHaveLength(2);
    expect(tooltips[0]).toHaveAttribute('data-title', 'mock-1');
    expect(tooltips[1]).toHaveAttribute('data-title', 'mock-2');
  });

  test('shows tooltip with customRow when both are provided', () => {
    const headersWithTooltipAndCustomRow = [
      { 
        key: 'name', 
        label: 'Name', 
        showTooltip: true,
        customRow: (item: any) => <span data-testid="custom-tooltip-row">{item.name.toUpperCase()}</span>
      },
      { key: 'age', label: 'Age' },
    ];

    render(<Table headers={headersWithTooltipAndCustomRow} rows={mockData} />);

    const tooltips = screen.getAllByTestId('mock-tooltip');
    expect(tooltips).toHaveLength(2);
    
    const customRows = screen.getAllByTestId('custom-tooltip-row');
    expect(customRows).toHaveLength(2);
    expect(customRows[0]).toHaveTextContent('MOCK-1');
    expect(customRows[1]).toHaveTextContent('MOCK-2');
  });

  test('displays dash when cell value is empty', () => {
    const dataWithEmptyValues = [
      { name: 'mock', age: '' },
      { name: '', age: 25 },
    ];

    render(<Table headers={mockHeaders} rows={dataWithEmptyValues} />);

    const dashCells = screen.getAllByText('-');
    expect(dashCells).toHaveLength(2);
  });

  test('displays dash inside tooltip when customRow returns null/undefined and key is empty', () => {
    const headers = [
      { key: '', label: 'Name', showTooltip: true, customRow: () => null },
      { key: '', label: 'Age', showTooltip: true, customRow: () => undefined }
    ];

    render(<Table headers={headers} rows={mockData} />);

    const tooltips = screen.getAllByTestId('mock-tooltip');
    expect(tooltips).toHaveLength(4);
    const dashesInsideTooltips = screen.getAllByText('-');
    expect(dashesInsideTooltips).toHaveLength(4);
  });
});