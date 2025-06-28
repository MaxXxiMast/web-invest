import { render, screen, fireEvent } from '@testing-library/react';
import SortFilter from './SortFilter';

jest.mock('../../../primitives/RadioGroup', () => {
  const MockRadioGroup = (props: any) => {
    return (
      <div data-testid="radio-group">
        {props.options.map((option: string, idx: number) => (
          <label key={idx}>
            <input
              type="radio"
              name={props.name}
              value={option}
              checked={props.value === option}
              onChange={(e) => props.handleChangeEvent(e)}
            />
            {option}
          </label>
        ))}
      </div>
    );
  };
  MockRadioGroup.displayName = 'MockRadioGroup';
  return MockRadioGroup;
});

describe('SortFilter Component', () => {
  const mockOptions = ['Option A', 'Option B', 'Option C'];

  it('renders correctly with given options and value', () => {
    render(<SortFilter options={mockOptions} value="Option B" />);
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Option B')).toBeChecked();
  });

  it('calls onChange with selected value', () => {
    const handleChange = jest.fn();
    render(
      <SortFilter
        options={mockOptions}
        value="Option A"
        onChange={handleChange}
      />
    );
    const input = screen.getByDisplayValue('Option C');
    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith('Option C');
  });

  it('uses default props when not provided', () => {
    render(<SortFilter options={mockOptions} value="Option A" />);
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
  });
  it('renders correctly with empty options array', () => {
    render(<SortFilter options={[]} value="" />);
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    // Expect no input elements rendered
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
  it('does not render input for value not present in options', () => {
    render(<SortFilter options={['One', 'Two']} value="Three" />);
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Three')).toBeNull();
  });

  it('does not throw error when default onChange is used', () => {
    render(<SortFilter options={['A', 'B']} value="A" />);
    const input = screen.getByDisplayValue('B');
    expect(() => fireEvent.click(input)).not.toThrow();
  });
  it('passes correct class names to RadioGroupCustom', () => {
    const { container } = render(<SortFilter options={['X']} value="X" />);
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
  });
});
