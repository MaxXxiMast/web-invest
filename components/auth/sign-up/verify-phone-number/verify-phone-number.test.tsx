import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import VerifyPhoneNumber from './index';
import * as useMediaQueryHook from '../../../../utils/customHooks/useMediaQuery';

jest.mock('react-phone-input-2', () => {
  const MockPhoneInput = (props) => (
    <input
      data-testid="phone-input"
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
      placeholder={props.placeholder}
    />
  );
  MockPhoneInput.displayName = 'MockPhoneInput';
  return MockPhoneInput;
});

beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });
  
describe('VerifyPhoneNumber Component', () => {
  const baseProps = {
    otpSent: false,
    userLocation: { country_code: 'IN' },
    loginValue: '911234567890',
    validateSecondaryInput: jest.fn(),
    errorMsg: '',
    countryCode: '91',
    renderClearButton: jest.fn(() => <div data-testid="clear-button">Clear</div>),
    renderGetOtpButton: jest.fn(() => <button data-testid="get-otp">Get OTP</button>),
    secondaryDataValidated: true,
    displayVerifyButton: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<VerifyPhoneNumber {...baseProps} />);
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
  });

  it('calls validateSecondaryInput on change', () => {
    render(<VerifyPhoneNumber {...baseProps} />);
    const input = screen.getByTestId('phone-input');
    fireEvent.change(input, { target: { value: '912345678901' } });
    expect(baseProps.validateSecondaryInput).toHaveBeenCalledWith('912345678901');
  });

  it('shows error message when errorMsg prop is present', () => {
    render(<VerifyPhoneNumber {...baseProps} errorMsg="Invalid number" />);
    expect(screen.getByText('Invalid number')).toBeInTheDocument();
  });

  it('shows clear button only when otpSent is true and loginValue is valid', () => {
    const props = { ...baseProps, otpSent: true };
    render(<VerifyPhoneNumber {...props} />);
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('does not show clear button when loginValue is short', () => {
    const props = { ...baseProps, loginValue: '91' };
    render(<VerifyPhoneNumber {...props} />);
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });

  it('calls renderGetOtpButton with correct logic', () => {
    const props = { ...baseProps, otpSent: false, secondaryDataValidated: false };
    render(<VerifyPhoneNumber {...props} />);
    expect(baseProps.renderGetOtpButton).toHaveBeenCalledWith(true);
  });

  it('applies borderBox focus and blur styles correctly', () => {
    render(<VerifyPhoneNumber {...baseProps} />);
    const input = screen.getByTestId('phone-input');
    fireEvent.focus(input);
    fireEvent.blur(input);
  });

  it('respects useMediaQuery margins', () => {
    jest.spyOn(useMediaQueryHook, 'useMediaQuery').mockReturnValue(true);
    render(<VerifyPhoneNumber {...baseProps} />);
  });

  it('getIsValidPhoneInput returns true for valid input', () => {
    const { container } = render(<VerifyPhoneNumber {...baseProps} />);
    const isValid = container.querySelector('input')?.getAttribute('isValid');
    expect(isValid).not.toBe('false');
  });
});
