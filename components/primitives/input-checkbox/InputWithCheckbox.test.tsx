import { render, screen, fireEvent } from '@testing-library/react';
import InputWithCheckBox from './InputWithCheckbox';

const mockOnChange = jest.fn();
const mockOnCheckboxChange = jest.fn();

const defaultProps = {
  id: 'unitsToSell',
  value: '10',
  maxValue: '100',
  onChange: mockOnChange,
  checkboxChecked: false,
  onCheckboxChange: mockOnCheckboxChange,
};

describe('InputWithCheckBox Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render InputWithCheckBox', () => {
    render(<InputWithCheckBox {...defaultProps} />);

    expect(screen.getByText('Units to Sell')).toBeInTheDocument();
    expect(screen.getByText('Withdraw All')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  test('should call onChange on input value change', () => {
    render(<InputWithCheckBox {...defaultProps} />);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '20' } });

    expect(mockOnChange).toHaveBeenCalledWith('20');
  });

  test('should call onCheckboxChange on checkbox click', () => {
    render(<InputWithCheckBox {...defaultProps} />);

    const checkbox = screen.getByText('Withdraw All').previousSibling;
    fireEvent.click(checkbox);

    expect(mockOnCheckboxChange).toHaveBeenCalled();
  });

  test('should show tick icon when checkboxChecked is true', () => {
    render(<InputWithCheckBox {...defaultProps} checkboxChecked={true} />);

    const checkbox = screen.getByText('Withdraw All').previousSibling;
    expect(checkbox).toHaveClass('checked');
  });
});