import { render, screen, fireEvent } from '@testing-library/react';
import PreLoginButton from './PreLoginButton';

jest.mock('../Button', () => {
  const Button = ({ children, onClick, className }) => (
    <button onClick={onClick} className={className} data-testid="button">
      {children}
    </button>
  );
  Button.defaultProps = {
    variant: '',
    compact: false,
    width: '',
  };
  return {
    __esModule: true,
    default: Button,
    ButtonType: {
      Secondary: 'Secondary',
      SecondaryLight: 'SecondaryLight',
      Inverted: 'Inverted',
    },
  };
});

jest.mock('./ReferEarnBtn', () => {
  return {
    __esModule: true,
    default: ({ handleBtnClickEvent }) => (
      <button onClick={handleBtnClickEvent} data-testid="refer-earn-btn">
        Refer & Earn
      </button>
    ),
  };
});

// Mock window.open
const originalOpen = window.open;
beforeEach(() => {
  window.open = jest.fn();
});
afterEach(() => {
  window.open = originalOpen;
});

describe('PreLoginButton Component', () => {
  test('renders nothing when both showLogoutBtn and showLoginBtn are false', () => {
    render(<PreLoginButton showLogoutBtn={false} showLoginBtn={false} />);

    expect(screen.queryByTestId('button')).not.toBeInTheDocument();
  });

  test('renders logout button when showLogoutBtn is true', () => {
    const handleLogoutMock = jest.fn();
    render(
      <PreLoginButton
        showLogoutBtn={true}
        handleLogoutClick={handleLogoutMock}
      />
    );

    const logoutButton = screen.getByText('Log Out');
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(logoutButton);
    expect(handleLogoutMock).toHaveBeenCalledTimes(1);
  });

  test('renders login and signup buttons when showLoginBtn is true', () => {
    const handleLoginSignupMock = jest.fn();
    render(
      <PreLoginButton
        showLoginBtn={true}
        handleLoginSignupClick={handleLoginSignupMock}
      />
    );

    const loginButton = screen.getByText('Login');
    const signUpButton = screen.getByText('Sign Up');
    const mobileButton = screen.getByText('Login / Sign Up');

    expect(loginButton).toBeInTheDocument();
    expect(signUpButton).toBeInTheDocument();
    expect(mobileButton).toBeInTheDocument();

    fireEvent.click(loginButton);
    expect(handleLoginSignupMock).toHaveBeenCalledTimes(1);

    fireEvent.click(signUpButton);
    expect(handleLoginSignupMock).toHaveBeenCalledTimes(2);

    fireEvent.click(mobileButton);
    expect(handleLoginSignupMock).toHaveBeenCalledTimes(3);
  });

  test('renders referral button when showReferral is true', () => {
    render(<PreLoginButton showLoginBtn={true} showReferral={true} />);

    const referralButton = screen.getByTestId('refer-earn-btn');
    expect(referralButton).toBeInTheDocument();

    fireEvent.click(referralButton);
    expect(window.open).toHaveBeenCalledWith('/referral', '_self');
  });

  test('does not render referral button when showReferral is false', () => {
    render(<PreLoginButton showLoginBtn={true} showReferral={false} />);

    expect(screen.queryByTestId('refer-earn-btn')).not.toBeInTheDocument();
  });

  test('applies correct CSS classes to buttons', () => {
    render(<PreLoginButton showLoginBtn={true} />);

    const buttons = screen.getAllByTestId('button');

    // Check desktop buttons have the right classes
    expect(buttons[0].className).toContain('HideInMobile');
    expect(buttons[1].className).toContain('HideInMobile');

    // Check mobile button has the right class
    expect(buttons[2].className).toContain('HideInDesktop');
  });

  test('uses default props when none provided', () => {
    const { container } = render(<PreLoginButton />);

    // Should render login buttons (default behavior)
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Login / Sign Up')).toBeInTheDocument();
  });

  test('calls default empty handlers when no handlers provided', () => {
    render(<PreLoginButton />);

    const loginButton = screen.getByText('Login');
    // This should not throw an error even though no handler was provided
    fireEvent.click(loginButton);
  });
});
