import { render, screen, fireEvent } from '@testing-library/react';
import CompleteKYCNudge from '../CompleteKYCNudge';
import { ProfileContext } from '../../ProfileContext/ProfileContext';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import {
  getOverallDefaultKycSteps,
  getDiscoveryKycStatus,
} from '../../../utils/discovery';
import { trackEvent } from '../../../utils/gtm';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('../../primitives/Image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
jest.mock('../../../utils/discovery');
jest.mock('../../../utils/gtm');

describe('CompleteKYCNudge component', () => {
  const mockPush = jest.fn();
  const defaultUserData = { userID: 99 };
  const contextValues = { userKycData: [{}, {}] };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSelector as jest.Mock).mockImplementation((selectorFn) =>
      selectorFn({ user: { userData: defaultUserData, kycDetails: {} } })
    );
    mockPush.mockClear();
    (trackEvent as jest.Mock).mockClear();
  });

  it('renders nothing when RFQ KYC is complete', () => {
    (getOverallDefaultKycSteps as jest.Mock).mockReturnValue({
      completed: 2,
      total: 2,
    });

    const { container } = render(
      <ProfileContext.Provider value={contextValues as any}>
        <CompleteKYCNudge />
      </ProfileContext.Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows KYC CTA when old KYC not verified and RFQ incomplete, and handles click', () => {
    (getOverallDefaultKycSteps as jest.Mock).mockReturnValue({
      completed: 1,
      total: 2,
    });
    (getDiscoveryKycStatus as jest.Mock).mockReturnValue('pending');

    render(
      <ProfileContext.Provider value={contextValues as any}>
        <CompleteKYCNudge />
      </ProfileContext.Provider>
    );

    const container = screen.getByText('Complete your KYC');
    expect(container).toBeInTheDocument();

    fireEvent.click(container.parentElement!);
    expect(trackEvent).toHaveBeenCalledWith('kyc_redirect', {
      page: 'profile',
      userID: defaultUserData.userID,
      activeTab: 'complete_kyc_nudge',
    });
    expect(mockPush).toHaveBeenCalledWith('/user-kyc');
  });

  it('shows Re-KYC CTA when old KYC verified and RFQ incomplete', () => {
    (getOverallDefaultKycSteps as jest.Mock).mockReturnValue({
      completed: 0,
      total: 1,
    });
    (getDiscoveryKycStatus as jest.Mock).mockReturnValue('verified');

    render(
      <ProfileContext.Provider value={contextValues as any}>
        <CompleteKYCNudge />
      </ProfileContext.Provider>
    );

    expect(screen.getByText('Complete your Re-KYC')).toBeInTheDocument();
  });
});
