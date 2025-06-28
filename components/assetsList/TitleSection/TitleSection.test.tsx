import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TitleSection from './index';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { importCalendlyScript } from '../../../utils/ThirdParty/calendly';
import { fetchLeadOwnerDetails } from '../../../api/user';

declare global {
  interface Window {
    Calendly: {
      initPopupWidget: jest.Mock;
    };
  }
}

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/mock-path',
  }),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('next/dynamic', () => {
  return function dynamicMock(importFunc, options) {
    importFunc();

    const VideoPlayerComponent = ({ videoLink, autoPlay, height }) => (
      <div
        data-testid="video-player"
        data-video-link={videoLink}
        data-auto-play={autoPlay}
        data-height={height}
      >
        Video Player
      </div>
    );
    return VideoPlayerComponent;
  };
});

jest.mock('../../primitives/Image', () => ({
  __esModule: true,
  default: (props) => (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.src}
        alt={props.alt || props.alternativeText}
        width={props.width}
        height={props.height}
        data-testid="mock-image"
      />
    </>
  ),
}));

jest.mock('../../common/Swipper', () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="mock-swipper">
      {props.sliderData?.map((item, index) => (
        <div key={index} data-testid="mock-slide">
          {props.customSliderComponent && props.customSliderComponent(item)}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../primitives/MobileDrawer/MobileDrawer', () => ({
  __esModule: true,
  default: ({
    children,
    showFlyer,
    handleDrawerClose,
    className,
    backgroundColor,
  }) => (
    <div
      data-testid="mobile-drawer"
      data-show={showFlyer}
      className={className || ''}
      style={{ backgroundColor: backgroundColor || '' }}
      onClick={() => handleDrawerClose(false)}
    >
      {children}
    </div>
  ),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn((selector) =>
    selector({
      user: {
        userData: {
          userID: 'mock-user-id',
        },
      },
      assets: {
        assetProps: {
          title: 'Mock Asset Title',
          id: 'mock-id',
        },
      },
    })
  ),
}));

jest.mock('../utils', () => ({
  getMenuDrawerBackground: jest.fn(() => '#f1f1f1'),
  getSlideIcon: jest.fn(() => 'mock-slide-icon.svg'),
}));

jest.mock('../../../utils/ThirdParty/calendly', () => ({
  importCalendlyScript: jest.fn().mockResolvedValue(true),
  removeCalendlyScript: jest.fn(),
}));

jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(() => false),
}));

jest.mock('../../../api/user', () => ({
  fetchLeadOwnerDetails: jest.fn().mockResolvedValue({
    firstName: 'mock',
    lastName: '1',
    calendlyLink: 'https://calendly.com/mock1',
    email: 'mock.1@example.com',
  }),
}));

const mockData = {
  description: 'Test description',
  mobileDescription: 'Mobile test description',
  videoUrl: 'https://example.com/video.mp4',
  videoButtonName: 'Learn More',
  title: 'Test Title',
  learnData: {
    learnHeading: 'Learn more about this',
    learnDrawer: [
      {
        id: '1',
        title: 'What are Bonds?',
        sliderData: [
          {
            icon: 'https://example.com/icon.svg',
            subTitle: 'Bond Subtitle',
            description: 'Bond Description',
          },
        ],
      },
      {
        id: '2',
        title: 'Why invest in Bonds?',
        sliderData: [
          {
            icon: 'why-bond-icon.svg',
            subTitle: 'Why Bond Subtitle',
            description: 'Why Bond Description',
          },
        ],
      },
    ],
  },
};

describe('TitleSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    window.Calendly = {
      initPopupWidget: jest.fn(),
    };
  });

  test('renders correctly in desktop view', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(<TitleSection data={mockData} productType="bonds" />);

    expect(screen.getAllByText('Test description')[0]).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
    expect(screen.getByText('Watch Now')).toBeInTheDocument();
  });

  test('renders correctly in mobile view', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<TitleSection data={mockData} productType="bonds" />);

    expect(screen.getByText('Mobile test description')).toBeInTheDocument();
    expect(screen.getByText('SEBI regulated')).toBeInTheDocument();
    expect(screen.getByText('About Bonds')).toBeInTheDocument();
  });

  test('opens video modal when "Watch Now" is clicked', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(<TitleSection data={mockData} productType="bonds" />);

    const watchNowButton = screen.getByText('Watch Now').parentElement;
    fireEvent.click(watchNowButton);

    const videoPlayer = screen.getAllByTestId('video-player');
    expect(videoPlayer[0]).toBeInTheDocument();
  });

  test('closes video modal in mobile view when close button is clicked', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<TitleSection data={mockData} productType="bonds" />);

    const aboutBondsButton = screen.getByText('Watch Now');
    fireEvent.click(aboutBondsButton);
    const videoPlayer = screen.getAllByTestId('video-player');
    expect(videoPlayer[1]).toBeInTheDocument();

    const closeButton = screen.getByTestId('mock-image').closest('span');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('video Player')).not.toBeInTheDocument();
    });
  });

  test('navigates to slider menu when a learn item is clicked', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<TitleSection data={mockData} productType="bonds" id="test-id" />);

    fireEvent.click(screen.getByText('About Bonds'));

    await waitFor(() => {
      expect(screen.getByText('What are Bonds?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('What are Bonds?'));

    expect(screen.getByText('Bond Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Bond Description')).toBeInTheDocument();
  });

  test('sets showFlyer to true when clicking About Bonds in mobile view without learnData', () => {
    const dataWithoutLearnData = {
      ...mockData,
      learnData: null,
    };

    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<TitleSection data={dataWithoutLearnData} productType="bonds" />);

    fireEvent.click(screen.getByText('About Bonds'));
    const mobileDrawer = screen.getAllByTestId('mobile-drawer')[0];
    expect(mobileDrawer.getAttribute('data-show')).toBe('true');
    expect(screen.getAllByTestId('video-player')[0]).toBeInTheDocument();
  });

  test('sets showFlyer to true when clicking Learn More without learnData in desktop view', () => {
    const dataWithoutLearnData = {
      ...mockData,
      description: 'Test description',
      videoUrl: 'https://example.com/video.mp4',
      videoButtonName: 'Learn More',
      learnData: null,
    };

    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(<TitleSection data={dataWithoutLearnData} productType="bonds" />);

    fireEvent.click(screen.getByText('Learn More'));
    expect(screen.getAllByTestId('video-player')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Test description')[0]).toBeInTheDocument();
  });

  test('clicking back arrow in slider menu returns to more details view', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<TitleSection data={mockData} productType="bonds" />);

    fireEvent.click(screen.getByText('About Bonds'));
    await waitFor(() => {
      expect(screen.getByText('What are Bonds?')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('What are Bonds?'));
    expect(screen.getByText('Bond Subtitle')).toBeInTheDocument();

    const backArrow = document.querySelector('.icon-arrow-left');
    fireEvent.click(backArrow);
    await waitFor(() => {
      expect(screen.getAllByText('What are Bonds?')[1]).toBeInTheDocument();
    });
  });

  test('calls Calendly when "Get in touch with your Relationship Manager" is clicked', async () => {
    const {
      importCalendlyScript,
    } = require('../../../utils/ThirdParty/calendly');
    const { trackEvent } = require('../../../utils/gtm');

    render(<TitleSection data={mockData} productType="bonds" />);
    fireEvent.click(screen.getByText('Learn More'));

    const getInTouchButtons = screen.getAllByText(
      'Get in touch with your Relationship Manager'
    );
    fireEvent.click(getInTouchButtons[0]);

    expect(importCalendlyScript).toHaveBeenCalled();

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('Click_book_a_call', {
        url: '/mock-path',
      });

      expect(window.Calendly.initPopupWidget).toHaveBeenCalledWith({
        url: 'https://calendly.com/mock1?utm_campaign=profile&utm_source=mock-user-id',
        prefill: {
          name: 'mock 1',
          firstName: 'mock',
          lastName: '1',
          email: 'mock.1@example.com',
        },
      });
    });
  });

  test('directly calls onBookWM when calendly is already loaded', async () => {
    render(<TitleSection data={mockData} productType="bonds" />);

    fireEvent.click(screen.getByText('Learn More'));
    const getInTouchButtons = screen.getAllByText(
      'Get in touch with your Relationship Manager'
    );
    fireEvent.click(getInTouchButtons[0]);

    await waitFor(() => {
      expect(importCalendlyScript).toHaveBeenCalled();
      expect(window.Calendly.initPopupWidget).toHaveBeenCalled();
    });

    (importCalendlyScript as jest.Mock).mockClear();
    window.Calendly.initPopupWidget.mockClear();

    fireEvent.click(getInTouchButtons[0]);

    await waitFor(() => {
      expect(importCalendlyScript).not.toHaveBeenCalled();
      expect(window.Calendly.initPopupWidget).toHaveBeenCalled();
    });
  });

  test('handles error in onBookWM function', async () => {
    (fetchLeadOwnerDetails as jest.Mock).mockRejectedValueOnce(
      new Error('API failure')
    );

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<TitleSection data={mockData} productType="bonds" />);

    fireEvent.click(screen.getByText('Learn More'));

    const getInTouchButton = screen.getAllByText(
      'Get in touch with your Relationship Manager'
    )[0];
    fireEvent.click(getInTouchButton);

    await waitFor(() => {
      expect(fetchLeadOwnerDetails).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  test('should return nullwhen no product type ', () => {
    render(<TitleSection data={mockData} productType="" />);

    expect(screen.getAllByText('Test description')[0]).toBeInTheDocument();
  });

  test('renders regulatory text based on id and product type', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    const { rerender } = render(
      <TitleSection data={mockData} productType="bonds" id="sebi_section" />
    );

    expect(screen.getByText('SEBI regulated')).toBeInTheDocument();

    rerender(
      <TitleSection data={mockData} productType="highyieldfd" id="test-id" />
    );

    expect(screen.getByText('RBI regulated')).toBeInTheDocument();
  });

  test('handles error when Calendly script fails to load', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    (importCalendlyScript as jest.Mock).mockRejectedValue(
      new Error('Failed to load script')
    );

    render(<TitleSection data={mockData} productType="bonds" id="test-id" />);

    fireEvent.click(screen.getByText('Learn More'));

    fireEvent.click(
      screen.getAllByText('Get in touch with your Relationship Manager')[0]
    );

    await waitFor(() => {
      expect(importCalendlyScript).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load Calendly script:',
        expect.any(Error)
      );
    });

    console.error = originalConsoleError;
  });

  test('handleDescription returns empty string when no data is provided', () => {
    render(<TitleSection productType="bonds" data={null} />);

    const descriptionElements = screen.queryAllByText(/description/i);
    expect(descriptionElements.length).toBe(0);
  });

  test('handleDescription handles missing description properties', () => {
    const incompleteData = {
      ...mockData,
      description: undefined,
      mobileDescription: undefined,
    };

    (useMediaQuery as jest.Mock).mockReturnValue(false);
    const { rerender } = render(
      <TitleSection data={incompleteData} productType="bonds" />
    );

    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Mobile test description')
    ).not.toBeInTheDocument();

    (useMediaQuery as jest.Mock).mockReturnValue(true);
    rerender(<TitleSection data={incompleteData} productType="bonds" />);

    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Mobile test description')
    ).not.toBeInTheDocument();
  });
});
