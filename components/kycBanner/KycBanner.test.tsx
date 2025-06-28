import { render, screen } from '@testing-library/react';

// redux
import { useSelector } from 'react-redux';
import { useAppSelector } from '../../redux/slices/hooks';

// components
import KycBanner from '.';

// utils
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

// mock functions
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));
jest.mock('../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));
jest.mock('../../api/strapi', () => ({
  fetchAPI: jest.fn(),
  callErrorToast: jest.fn(),
}));
jest.mock('./utils', () => ({
  getContent: jest.fn(),
}));

describe('KYC Banner', () => {
  beforeAll(() => {
    (useAppSelector as jest.Mock).mockReturnValue({
      userData: {},
      kycDetails: {},
      commentsCount: 0,
      uccStatus: {},
      kycTypes: [],
      kycStatusLoaded: false,
      isFilteredKYCComplete: false,
    });
    (useSelector as jest.Mock).mockReturnValue({
      userID: '',
    });
  });
  test('visibilty false', async () => {
    const mockContent = {
      visibilty: false,
    };
    const { container } = render(
      <KycBanner isUserOBPPInvested mockContent={mockContent} />
    );
    expect(container.firstChild).toBeNull();
  });
  test('visibilty true', async () => {
    const mockContent = {
      visibilty: true,
    };
    render(<KycBanner isUserOBPPInvested mockContent={mockContent} />);
    expect(screen.getByTestId('KYC-ENTRY-BANNER')).toBeInTheDocument();
  });
  test('icon', async () => {
    const mockContent = {
      visibilty: true,
      icon: 'user-in-frame-new.png',
    };
    render(<KycBanner isUserOBPPInvested mockContent={mockContent} />);
    const icon = screen.getByRole('img', { name: 'Banner Image' });
    expect(icon).toBeInTheDocument();
  });
  test('desktop heading', async () => {
    const mockContent = {
      visibilty: true,
      desktop: {
        heading: 'You are just one step away from your investment',
      },
    };
    render(<KycBanner isUserOBPPInvested mockContent={mockContent} />);
    expect(screen.getByText(mockContent.desktop.heading)).toBeInTheDocument();
  });
  test('desktop action buttons', async () => {
    const mockContent = {
      visibilty: true,
      desktop: {
        primaryButtonTxt: 'Resume KYC',
        secondaryButtonTxt: 'Need Help?',
      },
    };
    render(<KycBanner isUserOBPPInvested mockContent={mockContent} />);
    expect(
      screen.getByText(mockContent.desktop.primaryButtonTxt)
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockContent.desktop.secondaryButtonTxt)
    ).toBeInTheDocument();
  });
  test('desktop sub-heading', async () => {
    const mockContent = {
      visibilty: true,
      subHeading: 'Facing issue? let us assist you.',
    };
    render(<KycBanner isUserOBPPInvested mockContent={mockContent} />);
    expect(screen.getByText(mockContent.subHeading)).toBeInTheDocument();
  });
  test('mobile heading', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    const mockContent = {
      visibilty: true,
      mobile: {
        heading: 'You are just one step away from your investment',
      },
    };
    render(<KycBanner isUserOBPPInvested mockContent={mockContent} />);
    expect(screen.getByText(mockContent.mobile.heading)).toBeInTheDocument();
  });
  test('mobile sub-heading', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    const mockContent = {
      visibilty: true,
      subHeading: 'Facing issue? let us assist you.',
      mobileSubHeading: true,
    };
    render(<KycBanner isUserOBPPInvested mockContent={mockContent} />);
    expect(screen.getAllByText(mockContent.subHeading)).toHaveLength(2);
  });
  test('mobile action buttons', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    const mockContent = {
      visibilty: true,
      desktop: {
        primaryButtonTxt: 'Resume KYC',
        secondaryButtonTxt: 'Need Help?',
      },
      mobile: {
        primaryButtonTxt: 'Resume KYC',
        secondaryButtonTxt: 'Need Help?',
      },
      mobileSubHeading: true,
    };
    render(<KycBanner isUserOBPPInvested mockContent={mockContent} />);
    expect(
      screen.getByText(mockContent.mobile.primaryButtonTxt)
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockContent.mobile.secondaryButtonTxt)
    ).toBeInTheDocument();
  });
});
