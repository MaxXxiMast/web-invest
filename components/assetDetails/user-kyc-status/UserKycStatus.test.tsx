import { render, screen } from '@testing-library/react';
import UserKycStatus from './index';

describe('UserKycStatus Component', () => {
  it('should render the provided message', () => {
    render(<UserKycStatus message="KYC Verified" />);
    expect(screen.getByText('KYC Verified')).toBeInTheDocument();
  });

  it('should render the info icon', () => {
    render(<UserKycStatus message="KYC Pending" />);
    const iconElement = screen.getByTestId('kyc-icon');
    expect(iconElement).toHaveClass('icon-info');
  });

  it('should apply additional className if provided', () => {
    render(<UserKycStatus message="KYC Required" className="extra-class" />);
    const wrapperDiv = screen.getByText('KYC Required').parentElement;
    expect(wrapperDiv).toHaveClass('extra-class');
  });

  it('should render with undefined message and className to trigger defaults', () => {
    render(<UserKycStatus message={undefined as any} className={undefined as any} />);
    const msg = screen.getByTestId('kyc-message');
    expect(msg.textContent).toBe('');
  });
  
  
});
