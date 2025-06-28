import { render, screen, fireEvent } from '@testing-library/react';
import ReferEarnBtn from '.';
import { classes } from '../../../assetAgreement/InvestmentDetailsStyle';

jest.mock('../../Button', () => {
  const Button = ({ children, onClick, variant, compact, width }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-compact={compact ? 'true' : 'false'}
      data-width={width}
      data-testid="button"
    >
      {children}
    </button>
  );
  return {
    __esModule: true,
    default: Button,
    ButtonType: {
      Secondary: 'Secondary',
    },
  };
});

describe('ReferEarnBtn Component', () => {
  test('renders button with correct props', () => {
    render(<ReferEarnBtn />);

    const button = screen.getByTestId('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-variant', 'Secondary');
    expect(button).toHaveAttribute('data-compact', 'true');
    expect(button).toHaveAttribute('data-width', '150px');
  });

  test('button displays correct content', () => {
    render(<ReferEarnBtn />);

    expect(screen.getByText('Refer Now')).toBeInTheDocument();
    expect(document.querySelector('.icon-refer')).toBeInTheDocument();
  });

  test('calls handleBtnClickEvent when button is clicked', () => {
    const mockClickHandler = jest.fn();
    render(<ReferEarnBtn handleBtnClickEvent={mockClickHandler} />);

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  test('uses default empty handler when none provided', () => {
    render(<ReferEarnBtn />);

    const button = screen.getByTestId('button');
    // This should not throw an error
    fireEvent.click(button);
  });

  test('does not display rewards text when not provided', () => {
    const { container } = render(<ReferEarnBtn />);

    expect(
      container.querySelector(`.${classes.ReferralAmount}`)
    ).not.toBeInTheDocument();
  });
});
