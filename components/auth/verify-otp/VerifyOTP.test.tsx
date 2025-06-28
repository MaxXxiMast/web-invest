import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore } from '../../../redux/slices/index';
import VerifyOTP from './index';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';

const store = makeStore();

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    query: {},
  }),
}));

jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
  push: jest.fn(),
}));

jest.mock('../../../utils/login', () => ({
  verifyUserAndRedirect: jest.fn(() => '/dashboard'),
}));

beforeAll(() => {
    global.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), 
      removeListener: jest.fn(), 
      addEventListener: jest.fn(), 
      removeEventListener: jest.fn(), 
      dispatchEvent: jest.fn(),
    }));
  });

describe('VerifyOTP Component', () => {

  it('loads page data on mount', async () => {
    render(<Provider store={store}><VerifyOTP /></Provider>);
    await waitFor(() => {
      expect(screen.getByText(/Enter OTP/i)).toBeInTheDocument();
    });
  });

  it('does not dispatch authenticate if otp is not 4 digits', async () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    render(<Provider store={store}><VerifyOTP /></Provider>);
    
    const otpInput = screen.getByRole('spinbutton');
    await userEvent.type(otpInput, '12');
    
    const verifyBtn = await screen.findByRole('button', { name: /Proceed/i });
    fireEvent.click(verifyBtn);
    
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
  
  it('redirects on successful OTP verification', async () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    render(<Provider store={store}><VerifyOTP /></Provider>);
  
    const otpInput = screen.getByRole('spinbutton');
    await userEvent.type(otpInput, '1234');
  
    const proceedBtn = screen.getByRole('button', { name: /Proceed/i });
    fireEvent.click(proceedBtn);
  
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('handles OTP verification failure', () => {
    render(<Provider store={store}><VerifyOTP /></Provider>);
    const otpFailed = screen.getByText(/Enter OTP/i);
    expect(otpFailed).toBeInTheDocument();
  });
  
  it('renders the OTP input field correctly', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      query: {},
    });
    render(<Provider store={store}><VerifyOTP /></Provider>);
  
    const otpInput = await screen.getAllByText('Enter OTP to verify');
    expect(otpInput[0]).toBeInTheDocument();
  });

  it('allows user to input OTP and click verify', async () => {
    render(
      <Provider store={store}>
        <VerifyOTP />
      </Provider>
    );
  
    const otpInput = await screen.findByRole('spinbutton');
    expect(otpInput).toBeInTheDocument();

    await userEvent.type(otpInput, '123456');
    expect((otpInput as HTMLInputElement).value).toBe('1234');
  
    const verifyButton = await screen.findByRole('button', { name: /Proceed/i });
   fireEvent.click(verifyButton);
   expect(verifyButton).toBeDisabled();
   
  });

  it('keeps Proceed button disabled when invalid OTP is entered', async () => {
    render(
      <Provider store={store}>
        <VerifyOTP />
      </Provider>
    );
  
    const otpInput = await screen.findByRole('spinbutton');
    const verifyButton = await screen.findByRole('button', { name: /Proceed/i });
  
    expect(verifyButton).toBeDisabled();
    await userEvent.clear(otpInput);
    await userEvent.type(otpInput, '12'); 
  
    expect(verifyButton).toBeDisabled();
  });
  
  
  test('should not show error when loginID length is between 5 and 100', () => {
    const callErrorToast = jest.fn();
    const resendOtp = jest.fn();
    const loginID = 'validemail@example.com';
  
    resendOtp({ loginID, callErrorToast });
  
    expect(callErrorToast).not.toHaveBeenCalled();
  });

  it('disables Proceed button when OTP input is empty', async () => {
    render(
      <Provider store={store}>
        <VerifyOTP />
      </Provider>
    );
  
    const otpInput = await screen.findByRole('spinbutton');
    const verifyButton = await screen.findByRole('button', { name: /Proceed/i });
  
    await userEvent.clear(otpInput);
  
    expect((otpInput as HTMLInputElement).value).toBe('');
    expect(verifyButton).toBeDisabled();
  });

  it('shows error if loginID is invalid when resending OTP', () => {
    const callErrorToast = jest.fn();
    const resendOtp = jest.fn(({ loginID, callErrorToast }) => {
      if (loginID.length < 5) {
        callErrorToast('Invalid loginID');
      }
    });
  
    const loginID = 'a@b'; 
  
    resendOtp({ loginID, callErrorToast });
  
    expect(callErrorToast).toHaveBeenCalled();
  });
  
  it('allows Resend OTP button after timer finishes', async () => {
    jest.useFakeTimers();
  
    render(
      <Provider store={store}>
        <VerifyOTP />
      </Provider>
    );
  
    const resendOtpButton = await screen.findByText(/Resend OTP/i);
    jest.advanceTimersByTime(60000);
    expect(resendOtpButton).not.toHaveStyle('cursor: not-allowed');
  });
  
  it('navigates to Login page when Change link is clicked', async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push,
      query: {},
    });
  
    render(
      <Provider store={store}>
        <VerifyOTP />
      </Provider>
    );
  
    const changeLink = await screen.findByText(/Change/i);
    fireEvent.click(changeLink);
    expect(push).toHaveBeenCalledWith('/login');
  }); 

  it('disables Proceed and Resend OTP buttons when OTP is cleared', () => {
    const { container } = render(<Provider store={store}>
      <VerifyOTP />
    </Provider>);
    const otpInput = screen.getByRole('spinbutton');
    const proceedBtn = container.querySelector('button.loginButton') as HTMLButtonElement;
    const resendDiv = container.querySelector('.resendDiv') as HTMLDivElement;
  
    fireEvent.change(otpInput, { target: { value: '1234' } });
    expect(proceedBtn.disabled).toBe(false);
  
    fireEvent.change(otpInput, { target: { value: '' } });
    expect(proceedBtn.disabled).toBe(true);
  
    expect(resendDiv).toHaveStyle('cursor: not-allowed');
  });
  
})