import { render, screen, fireEvent, waitFor} from '@testing-library/react';
import OTPInput from './index';

describe('OTPInput Component', () => {
  let handleOtpChange: jest.Mock;
  let triggerOtp: jest.Mock;

  beforeEach(() => {
    handleOtpChange = jest.fn();
    triggerOtp = jest.fn();
  });

  it('calls handleOtpChange when user types in OTP input', () => {
    const handleOtpChange = jest.fn();
  
    render(
      <OTPInput
        otpValue=""
        handleOtpChange={handleOtpChange}
        seconds={0}
        otpSent={true}
        triggerOtp={jest.fn()}
      />
    );
  
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '123456' } });
  
    expect(handleOtpChange).toHaveBeenCalledTimes(1);

    const calledEvent = handleOtpChange.mock.calls[0][0];
  
    expect(calledEvent).toHaveProperty('target');
    expect(calledEvent.target).toBe(input);
  });
  
  
  it('renders and enables the Resend button when seconds === 0 and otpSent is true', () => {
    render(
      <OTPInput
        otpValue=""
        handleOtpChange={handleOtpChange}
        seconds={0}
        otpSent={true}
        triggerOtp={triggerOtp}
      />
    );
    const resendButton = screen.getByText('Resend');
    expect(resendButton).toBeInTheDocument();
    expect(resendButton).not.toBeDisabled();
  });

  it('disables the Resend button when otpSent is false', () => {
    render(
      <OTPInput
        otpValue=""
        handleOtpChange={handleOtpChange}
        seconds={0}
        otpSent={false}
        triggerOtp={triggerOtp}
      />
    );
    const resendButton = screen.getByText('Resend');
    expect(resendButton).toBeDisabled();
  });

  it('displays the countdown timer correctly when seconds > 0', () => {
    render(
      <OTPInput
        otpValue=""
        handleOtpChange={handleOtpChange}
        seconds={90}
        otpSent={true}
        triggerOtp={triggerOtp}
      />
    );
    const resendText = screen.getByText(/Resend/i);
    const timeText = screen.getByText(/in 1:30/i);
    
    expect(resendText).toBeInTheDocument();
    expect(timeText).toBeInTheDocument();
  });
  it('calls triggerOtp when Resend button is clicked', async () => {
    render(
      <OTPInput
        otpValue=""
        handleOtpChange={handleOtpChange}
        seconds={0}
        otpSent={true}
        triggerOtp={triggerOtp}
      />
    );
    const resendButton = screen.getByText('Resend');
    fireEvent.click(resendButton);
    await waitFor(() => {
      expect(triggerOtp).toHaveBeenCalledWith('Resend');
    });
  });

  it('formats the seconds correctly when seconds < 10', () => {
    render(
      <OTPInput
        otpValue=""
        handleOtpChange={handleOtpChange}
        seconds={5}
        otpSent={true}
        triggerOtp={triggerOtp}
      />
    );

    const resendText = screen.getByText(/Resend/i);
    const timeText = screen.getByText(/in 0:05/i);
    
    expect(resendText).toBeInTheDocument();
    expect(timeText).toBeInTheDocument();
  });
  

  it('does not show Resend button when seconds > 0', () => {
    render(
      <OTPInput
        otpValue=""
        handleOtpChange={handleOtpChange}
        seconds={30}
        otpSent={true}
        triggerOtp={triggerOtp}
      />
    );
    expect(screen.queryByRole('button', { name: /Resend/i })).not.toBeInTheDocument();
  });
  
  it('displays the countdown timer correctly when seconds < 10', () => {
    const seconds = 9; 
  
    render(
      <OTPInput
        otpValue="1234"
        handleOtpChange={handleOtpChange}
        seconds={seconds}
        otpSent={true}
        triggerOtp={triggerOtp}
      />
    );
    expect(screen.getByText(/in 0:09/)).toBeInTheDocument();
  });
});
