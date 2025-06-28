import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VerifyEmailAddress from './index';

jest.mock('../utils', () => ({
  secondaryFieldName: jest.fn(() => ({
    placeHolder: 'Email Address',
  })),
}));

describe('VerifyEmailAddress Component', () => {
  const mockValidate = jest.fn();
  const mockClearButton = jest.fn(() => <button>Clear</button>);
  const mockOtpButton = jest.fn(() => <button>Get OTP</button>);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls validateSecondaryInput on input change', () => {
    render(
      <VerifyEmailAddress
        typeLoginID="email"
        loginValue=""
        otpSent={false}
        errorMsg=""
        validateSecondaryInput={mockValidate}
        renderClearButton={mockClearButton}
        renderGetOtpButton={mockOtpButton}
        secondaryDataValidated={false}
        displayVerifyEmailButton={true}
      />
    );
  
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(mockValidate).toHaveBeenCalledWith('test@example.com');
  });
  

  it('disables input when otpSent is true', () => {
    render(
      <VerifyEmailAddress
        typeLoginID="email"
        loginValue="abc@example.com"
        otpSent={true}
        errorMsg=""
        validateSecondaryInput={mockValidate}
        renderClearButton={mockClearButton}
        renderGetOtpButton={mockOtpButton}
        secondaryDataValidated={false}
        displayVerifyEmailButton={true}
      />
    );
    expect(screen.getByDisplayValue('abc@example.com')).toBeDisabled();
  });
  
  it('renders Get OTP button when loginValue is present', () => {
    render(
      <VerifyEmailAddress
        typeLoginID="email"
        loginValue="abc@example.com"
        otpSent={false}
        errorMsg=""
        validateSecondaryInput={mockValidate}
        renderClearButton={mockClearButton}
        renderGetOtpButton={mockOtpButton}
        secondaryDataValidated={false}
        displayVerifyEmailButton={true}
      />
    );
    expect(screen.getByText('Get OTP')).toBeInTheDocument();
  });

  it('renders Clear button when otpSent is true and loginValue is present', () => {
    render(
      <VerifyEmailAddress
        typeLoginID="email"
        loginValue="abc@example.com"
        otpSent={true}
        errorMsg=""
        validateSecondaryInput={mockValidate}
        renderClearButton={mockClearButton}
        renderGetOtpButton={mockOtpButton}
        secondaryDataValidated={true}
        displayVerifyEmailButton={true}
      />
    );
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('displays error message when errorMsg is present', () => {
    render(
      <VerifyEmailAddress
        typeLoginID="email"
        loginValue="abc@example.com"
        otpSent={false}
        errorMsg="Invalid email"
        validateSecondaryInput={mockValidate}
        renderClearButton={mockClearButton}
        renderGetOtpButton={mockOtpButton}
        secondaryDataValidated={false}
        displayVerifyEmailButton={true}
      />
    );
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });
});
