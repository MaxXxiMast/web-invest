import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import MfCalculatorButton from './MfCalculatorButton';
import { useAppSelector, useAppDispatch } from '../../../redux/slices/hooks';
import { setOpenMFStepperLoader } from '../redux/mf';

// Mock the useRouter hook
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the useAppSelector and useAppDispatch hooks
jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

// Mock the setMfData action
jest.mock('../redux/mf', () => ({
  setOpenMFStepperLoader: jest.fn(),
}));

describe('MfCalculatorButton', () => {
  const mockPush = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Invest Now" when KYC is verified', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: { default: { isFilteredKYCComplete: true } },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: false };
      }
    });

    render(<MfCalculatorButton />);
    expect(screen.getByText('Invest Now')).toBeInTheDocument();
  });

  it('renders "Complete KYC" when KYC status is continue or pending', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: {
            default: { kycTypes: [{ isKYCComplete: false }] },
          },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: false };
      }
    });

    render(<MfCalculatorButton />);
    expect(screen.getByText('Complete KYC')).toBeInTheDocument();
  });

  it('disables the button when KYC status is pending verification', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: {
            default: { kycTypes: [{ isKYCPendingVerification: true }] },
          },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: false };
      }
    });

    render(<MfCalculatorButton />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('navigates to KYC page when button is clicked and status is continue or pending', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: {
            default: { kycTypes: [{ isKYCComplete: false }] },
          },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: false };
      }
    });

    render(<MfCalculatorButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockPush).toHaveBeenCalledWith('/user-kyc');
  });

  it('opens Progress modal when button is clicked and status is verified', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: { default: { isFilteredKYCComplete: true } },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: false };
      }
    });

    render(<MfCalculatorButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockDispatch).toHaveBeenCalledWith(
      setOpenMFStepperLoader({ open: true, step: 0 })
    );
  });

  it('does nothing when button is clicked and status is pending verification', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: {
            default: { kycTypes: [{ isKYCPendingVerification: true }] },
          },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: false };
      }
    });

    render(<MfCalculatorButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('renders KYC status message when status is pending verification', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: {
            default: { kycTypes: [{ isKYCPendingVerification: true }] },
          },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: false };
      }
    });

    render(<MfCalculatorButton />);
    expect(
      screen.getByText(/Your KYC process is under review/i)
    ).toBeInTheDocument();
  });

  it('does not render KYC status message for other statuses', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: { default: { isFilteredKYCComplete: true } },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: false };
      }
    });

    render(<MfCalculatorButton />);
    expect(
      screen.queryByText(/Your KYC process is under review/i)
    ).not.toBeInTheDocument();
  });

  it('disables the button when isCalculatorBtnDisabled is true', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: { default: { isFilteredKYCComplete: true } },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: true };
      }
    });

    render(<MfCalculatorButton />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state when kycConfigStatus is empty', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return { kycConfigStatus: {} };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isCalculatorBtnDisabled: false };
      }
    });

    render(<MfCalculatorButton />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button').textContent).toBe('');
  });

  it('shows loading state when isPaymentMethodsLoading is loading', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('user')) {
        return {
          kycConfigStatus: { default: { isFilteredKYCComplete: true } },
        };
      }
      if (selector.toString().includes('mfConfig')) {
        return { isPaymentMethodsLoading: true };
      }
    });

    render(<MfCalculatorButton />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button').textContent).toBe('');
  });
});
