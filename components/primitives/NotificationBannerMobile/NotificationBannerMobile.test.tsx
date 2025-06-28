// NotificationBannerMobile.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationBannerMobile from '../NotificationBannerMobile';
import * as redux from '../../../redux/slices/hooks';
import Cookies from 'js-cookie';
import * as api from '../../../api/user';
import * as gtm from '../../../utils/gtm';
import * as appHelpers from '../../../utils/appHelpers';

// Mock next/image
jest.mock('next/image', () => {
  const MockImage = (props: any) => {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...props} alt={props.alt || ''} />
      </>
    )
  };
  MockImage.displayName = 'MockImage';
  return {
    __esModule: true,
    default: MockImage,
  };
});

// Mock modules
jest.mock('../../../api/user');
jest.mock('js-cookie');

const useAppSelectorMock = jest.spyOn(redux, 'useAppSelector');

describe('NotificationBannerMobile', () => {
  const userAgent = 'Mozilla/5.0';
  const userDataMock = {
    investmentData: { isInvested: true },
    userID: '12345',
    emailID: 'test@example.com',
    mobileNo: '1234567890',
    firstName: 'Test',
    lastName: 'User',
    documents: [],
    dematNo: '',
    kycPanStatus: '',
    kycAadhaarStatus: '',
    additionalProperty1: 'mockValue1',
    additionalProperty2: 'mockValue2',
  };
  const kycMock = {
    pan: 'verified',
    aadhar: 'verified',
    bank: 'verified',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window.navigator, 'userAgent', {
      value: userAgent,
      configurable: true,
    });
    useAppSelectorMock.mockImplementation((selector) =>
      selector({
        user: {
          userData: userDataMock as any,
          kycConfigStatus: kycMock,
        },
      } as any)
    );
  });

  test('should render banner when in webview, no cookie, and notifications are off', async () => {
    (Cookies.get as jest.Mock).mockImplementation((key) => {
      if (key === 'webViewRendered') return 'true';
      return undefined;
    });

    (api.fetchUserPreferences as jest.Mock).mockResolvedValue({
      config: { app: { transactional: false } },
    });

    render(<NotificationBannerMobile pageName="discover" />);
    await waitFor(() => {
      expect(screen.getByText(/Enable/)).toBeInTheDocument();
      expect(screen.getByText(/Maybe later/)).toBeInTheDocument();
    });
  });

  test('should not render banner if cookie exists', async () => {
    (Cookies.get as jest.Mock).mockImplementation((key) => {
      if (key === 'webViewRendered') return 'true';
      if (key === 'mayBeLaterGc') return 'clicked';
    });

    render(<NotificationBannerMobile />);
    await waitFor(() => {
      expect(screen.queryByText(/Enable/)).not.toBeInTheDocument();
    });
  });

  test('should call onClick handlers for Enable and Maybe later', async () => {
    (Cookies.get as jest.Mock).mockImplementation((key) => {
      if (key === 'webViewRendered') return 'true';
    });

    (api.fetchUserPreferences as jest.Mock).mockResolvedValue({
      config: { app: { transactional: false } },
    });

    const postMsgMock = jest.spyOn(appHelpers, 'postMessageToNativeOrFallback');
    const trackMock = jest.spyOn(gtm, 'trackEvent');

    render(<NotificationBannerMobile />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Enable'));
      fireEvent.click(screen.getByText('Maybe later'));
    });

    expect(postMsgMock).toHaveBeenCalledWith('MaybeLaterClick', {});
    expect(trackMock).toHaveBeenCalledWith(
      'maybe_later_clicked',
      expect.any(Object)
    );
    expect(postMsgMock).toHaveBeenCalledWith('AppAlerts', {
      data: { transactional: true },
    });
  });

  test('should not render banner for new user with pending KYC', async () => {
    useAppSelectorMock.mockImplementation((selector) =>
      selector({
        user: {
          userData: { investmentData: { isInvested: false } } as any,
          kycConfigStatus: { pan: 'pending' },
        },
      } as any)
    );

    (Cookies.get as jest.Mock).mockImplementation((key) => {
      if (key === 'webViewRendered') return 'true';
    });

    render(<NotificationBannerMobile />);
    await waitFor(() => {
      expect(screen.queryByText(/Enable/)).not.toBeInTheDocument();
    });
  });
});
