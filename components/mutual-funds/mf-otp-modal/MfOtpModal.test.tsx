import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// Component
import OTPModal from './MfOtpModal';

// Mocked Redux Hooks
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';

// API & Toast mocks
import { requestMfOtp, verifyMfOtp } from '../../../api/mf';
import { callErrorToast, processError } from '../../../api/strapi';

// Redux Toolkit store
const createTestStore = () =>
  configureStore({
    reducer: () => ({}), // Provide dummy reducer if hooks are mocked
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

// Mock hooks and APIs
jest.mock('../../../redux/slices/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../../api/mf', () => ({
  requestMfOtp: jest.fn(),
  verifyMfOtp: jest.fn(),
}));

jest.mock('../../../api/strapi', () => ({
  callErrorToast: jest.fn(),
  processError: jest.fn().mockReturnValue('Processed Error'),
}));

// Mock UI components
jest.mock('../../primitives/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
}));

jest.mock('../../primitives/BackBtn/BackBtn', () => ({
  __esModule: true,
  default: ({ handleBackEvent }: any) => (
    <button onClick={() => handleBackEvent('1234')}>Back</button>
  ),
}));

jest.mock('../mf-otp-resend-timer/MfOtpResendTimer', () => ({
  __esModule: true,
  default: ({ onResend }: any) => (
    <button onClick={onResend}>Resend OTP</button>
  ),
}));

jest.mock('../../common/inputFieldSet', () => ({
  __esModule: true,
  default: ({ onChange, onKeyPress, value }: any) => (
    <input
      placeholder="OTP"
      onChange={onChange}
      onKeyDown={onKeyPress}
      value={value}
    />
  ),
}));

const mockDispatch = jest.fn();

describe('OTPModal with Redux Toolkit Store', () => {
  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  const renderWithStore = () => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        <OTPModal />
      </Provider>
    );
  };

  it('renders user instructions', () => {
    (useAppSelector as jest.Mock).mockImplementation((selectorFn: any) =>
      selectorFn({
        user: {
          userData: { emailID: 'user@example.com', mobileNo: '1234567890' },
        },
        mfConfig: { purchaseID: '', assetId: 'id', inputValue: '1000' },
      })
    );

    renderWithStore();

    expect(
      screen.getByText('user@example.com & 1234567890')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('OTP')).toBeInTheDocument();
  });

  it('handles confirm with valid OTP', async () => {
    (useAppSelector as jest.Mock).mockImplementation((selectorFn: any) =>
      selectorFn({
        user: { userData: {} },
        mfConfig: { purchaseID: 'abc123' },
      })
    );

    (verifyMfOtp as jest.Mock).mockResolvedValue({ success: true });

    renderWithStore();

    fireEvent.change(screen.getByPlaceholderText('OTP'), {
      target: { value: '1234' },
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(verifyMfOtp).toHaveBeenCalledWith({
        purchaseID: 'abc123',
        otp: 1234,
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'mf/setMfData',
        payload: { isOTPModalOpen: false },
      });
    });
  });

  it('calls toast on OTP error', async () => {
    (useAppSelector as jest.Mock).mockImplementation((selectorFn: any) =>
      selectorFn({
        user: { userData: {} },
        mfConfig: { purchaseID: 'abc123' },
      })
    );

    (verifyMfOtp as jest.Mock).mockResolvedValue({ success: false });

    renderWithStore();

    fireEvent.change(screen.getByPlaceholderText('OTP'), {
      target: { value: '1234' },
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(callErrorToast).toHaveBeenCalledWith('Invalid OTP');
    });
  });

  it('handles OTP resend', async () => {
    (useAppSelector as jest.Mock).mockImplementation((selectorFn: any) =>
      selectorFn({
        user: { userData: {} },
        mfConfig: { assetId: 'id1', inputValue: '1000' },
      })
    );

    (requestMfOtp as jest.Mock).mockResolvedValue({
      purchaseID: 'newPurchase',
    });

    renderWithStore();

    fireEvent.click(screen.getByText('Resend OTP'));

    await waitFor(() => {
      expect(requestMfOtp).toHaveBeenCalledWith({
        assetID: 'id1',
        amount: 1000,
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'mf/setMfData',
        payload: { purchaseID: 'newPurchase' },
      });
    });
  });

  it('cleans up on unmount', () => {
    (useAppSelector as jest.Mock).mockImplementation((selectorFn: any) =>
      selectorFn({
        user: { userData: {} },
        mfConfig: {},
      })
    );

    const { unmount } = renderWithStore();

    unmount();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'mf/setMfData',
      payload: { purchaseID: '' },
    });
  });
});
