import { render, screen, fireEvent } from '@testing-library/react';
import NewsLetter from './NewsLetter';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('NewsLetter Component', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and buttons', () => {
    render(<NewsLetter />);
    expect(screen.getByText('Start investing on Grip now')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('clicking Login button calls router.push with "/login"', () => {
    render(<NewsLetter />);
    fireEvent.click(screen.getByText('Login'));
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('clicking Sign up button also calls router.push with "/login"', () => {
    render(<NewsLetter />);
    fireEvent.click(screen.getByText('Sign up'));
    expect(pushMock).toHaveBeenCalledWith('/login');
  });
});
