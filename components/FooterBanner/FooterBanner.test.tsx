import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FooterBanner from './FooterBanner';
import { trackEvent } from '../../utils/gtm';
import { redirectHandler } from '../../utils/windowHelper';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { fetchAPI } from '../../api/strapi';
import { isGCOrder } from '../../utils/gripConnect';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/test-path',
        push: jest.fn(),
    })),
}));

jest.mock('swiper', () => ({
    Autoplay: 'Autoplay',
    Pagination: 'Pagination',
    Navigation: 'Navigation',
}));

jest.mock('swiper/react', () => ({
    Swiper: ({ children, pagination, navigation, autoplay }) => (
        <div data-testid="swiper">
            {children}
        </div>
    ),
    SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/css', () => ({}));

jest.mock('dompurify', () => ({
    sanitize: jest.fn(content => content),
}));

jest.mock('../../components/primitives/Image', () => ({
    __esModule: true,
    default: props => (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
            src={props.src} 
            width={props.width} 
            height={props.height} 
            alt={props.alt || 'mock-image'} 
            data-testid="mock-image" 
        />
      </>
    ),
}));

jest.mock('../primitives/Button', () => ({
    __esModule: true,
    default: props => (
        <button
            onClick={props.onClick} 
            data-testid="mock-button"
            style={props.width ? { width: props.width } : {}}
        >
            {props.children}
        </button>
    ),
}));

// Mock utility functions
jest.mock('../../utils/string', () => ({
    GRIP_INVEST_BUCKET_URL: 'mock-url',
    handleExtraProps: jest.fn(),
}));

jest.mock('../../utils/customHooks/useMediaQuery', () => ({
    useMediaQuery: jest.fn(() => false),
}));

jest.mock('../../utils/userAgent', () => ({
    getOS: jest.fn(() => 'android'),
}));

jest.mock('../../utils/gtm', () => ({
    trackEvent: jest.fn(),
}));

jest.mock('../../utils/gripConnect', () => ({
    isGCOrder: jest.fn(() => false),
}));

jest.mock('../../utils/windowHelper', () => ({
    redirectHandler: jest.fn(),
}));

jest.mock('../../utils/appHelpers', () => ({
    isRenderedInWebview: jest.fn(() => false),
}));

// Mock API
jest.mock('../../api/strapi', () => ({
    fetchAPI: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            attributes: {
              pageData: [
                {
                  objectData: {
                    bannerDataArr: [
                      {
                        title: 'GRIP your investments',
                        keys: ['High returns', 'Low risk', 'Fixed tenure'],
                        QrCode: 'mock-qr-code',
                        storeDevices: {
                          desktop: [
                            {
                              device: 'desktop',
                              logo: 'mock-desktop-logo',
                              link: 'mock-desktop-link',
                            },
                            {
                              device: 'desktop',
                              logo: 'mock-desktop-logo',
                              link: 'mock-desktop-link',
                            },
                          ],
                          mobile: [
                            {
                              device: 'android',
                              logo: 'mock-mobile-logo',
                              link: 'mock-mobile-link',
                            },
                            {
                              device: 'android',
                              logo: 'mock-mobile-logo',
                              link: 'mock-mobile-link',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
    ),
}));

// Mock KnowYourInvestor component
jest.mock('../discovery/KnowYourInvestor', () => ({
    __esModule: true,
    default: props => (
        <div data-testid="know-your-investor" >
            KnowYourInvestor Component
        </div>
    ),
}));

const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('FooterBanner Component', () => {
  
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    // Test case - 1
    test('render FooterBanner', async () => {
        render(<FooterBanner />);
    
        await waitFor(() => {
            expect(screen.getByTestId('swiper')).toBeInTheDocument();
        });
    });

    test('handles click on desktop store button correctly', async() => {
        render(<FooterBanner />);

        await waitFor(() => {
            const storeButtons = screen.getAllByTestId('mock-image').filter(
                img => img.getAttribute('src') === 'mock-desktop-logo'
            );
            fireEvent.click(storeButtons[0].parentElement);
            
            expect(trackEvent as jest.Mock).toHaveBeenCalledWith("button_clicked", {"CTA_text": "Download on the App Store", "page": "test-path"});
            expect(redirectHandler as jest.Mock).toHaveBeenCalledWith({"pageName": "footer_banner", "pageUrl": "mock-desktop-link"});
        })
    });

    test('handles click on mobile store button correctly', async () => {
        (useMediaQuery as jest.Mock).mockReturnValue(true);

        render(<FooterBanner />);

        await waitFor(() => {
            const storeButtons = screen.getAllByTestId('mock-image').filter(
                img => img.getAttribute('src') === 'mock-mobile-logo'
            );
            fireEvent.click(storeButtons[0].parentElement);
            
            expect(trackEvent as jest.Mock).toHaveBeenCalledWith("button_clicked", {"CTA_text": "Get it on Google Play", "page": "test-path"});
            expect(redirectHandler as jest.Mock).toHaveBeenCalledWith({"pageName": "footer_banner", "pageUrl": "mock-mobile-link"});
        });

        await waitFor(() => {
            const button = screen.getByText('Get the App');
            fireEvent.click(button);

            expect(trackEvent as jest.Mock).toHaveBeenCalledWith("button_clicked", {"CTA_text": "Get the App", "page": "test-path"});
            expect(redirectHandler as jest.Mock).toHaveBeenCalledWith({"pageName": "footer_banner", "pageUrl": "mock-mobile-link"});
        })
    });

    test('logs error when no link is found for current device', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);
      (fetchAPI as jest.Mock).mockImplementation(() => Promise.resolve({
          data: [
              {
                attributes: {
                  pageData: [
                    {
                      objectData: {
                        bannerDataArr: [
                          {
                            title: 'Mock Title',
                            keys: ['High returns', 'Low risk', 'Fixed tenure'],
                            QrCode: 'mock-qr-code',
                            storeDevices: {
                              mobile: [
                                {
                                  device: 'Android',
                                  logo: 'mock-mobile-logo',
                                },
                                {
                                  device: 'android',
                                  logo: 'mock-mobile-logo',
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
          ],
      }));

      render(<FooterBanner />);

      await waitFor(() => {
          const storeButtons = screen.getAllByTestId('mock-image').filter(
              img => img.getAttribute('src') === 'mock-mobile-logo'
          );
          fireEvent.click(storeButtons[0].parentElement);

          expect(consoleErrorMock).toHaveBeenCalledWith('No link found for the current device');
      })     
    });

    test('handles missing storeDevices data gracefully', async () => {
      (fetchAPI as jest.Mock).mockImplementationOnce(() => Promise.resolve({
        data: [
          {
            attributes: {
              pageData: [
                {
                  objectData: {
                    bannerDataArr: [
                      {
                        title: 'Mock Title',
                        keys: ['High returns', 'Low risk', 'Fixed tenure'],
                        QrCode: 'mock-qr-code',
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }));
    
      render(<FooterBanner />);
    
      await waitFor(() => {
        const button = screen.getByText('Get the App');
        fireEvent.click(button);
    
        expect(trackEvent as jest.Mock).toHaveBeenCalledWith("button_clicked", {"CTA_text": "Get the App", "page": "test-path"});
        expect(consoleErrorMock).toHaveBeenCalledWith('No link found for the current device');
      });
    });

    test('does not render when bannerDataArray is empty', async () => {
        (fetchAPI as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            data: [],
        }));
    
        const { container } = render(<FooterBanner />);
        
        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    test("does not render when isGC is true", async() => {
        (isGCOrder as jest.Mock).mockReturnValue(true);

        const { container } = render(<FooterBanner />);
        
        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        })
    });
});