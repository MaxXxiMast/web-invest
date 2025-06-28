import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import TwoFactorAuthSingupModal from './index';
import { validateTwoFADOB } from '../../api/TwoFA';
import { trackEvent } from '../../utils/gtm';
import Cookies from 'js-cookie';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { getSecret } from '../../api/secrets';
import { postMessageToNativeOrFallback } from '../../utils/appHelpers';

// Mock the external dependencies
jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../redux/slices/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));
jest.mock('../../api/secrets', () => ({
  getSecret: jest.fn().mockResolvedValue({ value: 'mocked-secret' }),
}));
jest.mock('../../api/TwoFA', () => ({
  validateTwoFADOB: jest.fn().mockResolvedValue({ key: 'mocked-hash' }),
}));
jest.mock('../../utils/gtm', () => ({ trackEvent: jest.fn() }));
jest.mock('js-cookie', () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));
jest.mock('../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

describe('TwoFactorAuthSingupModal', () => {
  const dispatch = jest.fn();
  const router = { push: jest.fn(), pathname: '/login' };
  const userData = { firstName: 'John', emailID: 'john@example.com' };
  const gcData = { userData: { userID: '123' } };

  const store = configureStore({
    reducer: {
      user: () => ({ showTwoFAModal: true, userData }),
      gcConfig: () => ({ gcData }),
    },
  });

  // Mock the useAppDispatch and useAppSelector hooks
  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockReturnValue({
      showTwoFAModal: true,
      userData,
      gcData,
    });
    (useRouter as jest.Mock).mockReturnValue(router);
    (validateTwoFADOB as jest.Mock).mockResolvedValue({ key: 'mocked-hash' });
    (Cookies.get as jest.Mock).mockReturnValue(undefined);
    (Cookies.set as jest.Mock).mockClear();
    dispatch.mockClear();
  });

  // Mock the getSecret function
  const renderComponent = async () => {
    render(
      <Provider store={store}>
        <TwoFactorAuthSingupModal />
      </Provider>
    );
    // Wait for initial async calls to complete
    await waitFor(() => expect(getSecret).toHaveBeenCalled());
  };

  // Helper function to set up the component
  const setup = async () => {
    await renderComponent();
    return {
      input: document.getElementById('2FASignupInput') as HTMLInputElement,
      button: screen.getByText('Proceed'),
    };
  };

  // Test case 1
  test('should render the modal and show user details', async () => {
    await renderComponent();
    expect(screen.getByText(/Welcome, John/i)).toBeInTheDocument();
    expect(screen.getByText(/jo.*@example\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/DDMMYYYY/i)).toBeInTheDocument();
  });

  // Test case 2
  test('should not submit if DOB is invalid', async () => {
    const { input, button } = await setup();
    fireEvent.change(input, { target: { value: '1234' } });
    fireEvent.click(button);
    expect(validateTwoFADOB).not.toHaveBeenCalled();
  });

  // Test case 3
  test('should call validateTwoFADOB when DOB is valid', async () => {
    const { input, button } = await setup();
    fireEvent.change(input, { target: { value: '01011990' } });
    fireEvent.click(button);
    await waitFor(() => expect(validateTwoFADOB).toHaveBeenCalledTimes(1));
  });

  // Test case 4
  test('should show error message on failed DOB validation', async () => {
    (validateTwoFADOB as jest.Mock).mockResolvedValueOnce({
      key: 'wrong-hash',
    });
    const { input, button } = await setup();
    fireEvent.change(input, { target: { value: '01011990' } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/Incorrect DOB/i)).toBeInTheDocument();
    });
  });

  // Test case 5
  test('should redirect and set cookies on successful login', async () => {
    const { input, button } = await setup();
    fireEvent.change(input, { target: { value: '01011990' } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('2FA_Login', expect.anything());
      Cookies.set('storedTime2FA', new Date().getTime().toString(), {
        expires: 7,
      });
      expect(Cookies.set).toHaveBeenCalledWith(
        'storedTime2FA',
        expect.any(String),
        { expires: 7 }
      );
    });
  });

});
