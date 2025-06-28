import { render, screen, waitFor } from '@testing-library/react';
import NumberAnimation from './index';

describe('NumberAnimation Component', () => {

  it('handles empty or null values gracefully', async () => {
    const numValue = '';
  
    render(<NumberAnimation numValue={numValue} />);
    const numberText = screen.queryByText('1,234.00');
    expect(numberText).toBeNull();
  }); 

  it('returns null when numValue is NaN', () => {
    const numValue = NaN;
  
    render(<NumberAnimation numValue={numValue} />);
  
    const numberElement = screen.queryByText(/[\d,\.]+/);
    expect(numberElement).not.toBeInTheDocument();
  });

  it('formats the number correctly based on locale', async() => {
    render(<NumberAnimation numValue={1234567.89} locale="de-DE" />);
  
    const numberElement = await screen.findByLabelText('1.234.567,89');
    expect(numberElement).toBeInTheDocument();
  
    expect(screen.getByText('₹')).toBeInTheDocument();
  });
  

  it('renders correctly with the prefixIcon', () => {
    const numValue = 1234;
    const prefixIcon = '€';

    render(<NumberAnimation numValue={numValue} prefixIcon={prefixIcon} />);

    const numberElement = screen.getByText('€');
    expect(numberElement).toHaveTextContent('€');
  });

  it('renders FlipNumbers correctly', async () => {
    render(<NumberAnimation numValue={1234} />);

    const numberElement = await screen.findByLabelText('1,234.00');
    expect(numberElement).toBeInTheDocument();
    expect(screen.getByText('₹')).toBeInTheDocument();
  });
  
  it('renders number with prefixIcon', async () => {
    render(<NumberAnimation numValue={1234} prefixIcon="€" />);
    expect(screen.getByText('€')).toBeInTheDocument();
    const numberElement = await screen.findByLabelText('1,234.00');
    expect(numberElement).toBeInTheDocument();
  });

  it('handles NaN numValue', () => {
    render(<NumberAnimation numValue={NaN} />);
    const numberElement = screen.queryByText(/\d/);
    expect(numberElement).toBeNull();
  });

  it('formats number according to locale', async () => {
    render(<NumberAnimation numValue={1234567.89} locale="de-DE" />);
    const numberElement = await screen.findByLabelText('1.234.567,89');
    expect(numberElement).toBeInTheDocument();
  });

  it('applies wrapperClassName', () => {
    const { container } = render(
      <NumberAnimation numValue={1234} wrapperClassName="test-wrapper" />
    );
    expect(container.querySelector('.test-wrapper')).toBeInTheDocument();
  });

  it('rounds off decimal places correctly', async () => {
    render(<NumberAnimation numValue={1234.567} roundOff={1} />);
    const numberElement = await screen.findByLabelText('1,234.6');
    expect(numberElement).toBeInTheDocument();
  });

  it('renders 0 correctly', async () => {
    render(<NumberAnimation numValue={0} />);
    const numberElement = await screen.findByLabelText('0.00');
    expect(numberElement).toBeInTheDocument();
  });

});