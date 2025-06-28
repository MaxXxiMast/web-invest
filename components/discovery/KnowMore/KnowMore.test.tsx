import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import KnowMore from '../KnowMore';
import { useRouter } from 'next/router';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { trackEvent } from '../../../utils/gtm';

jest.mock('next/dynamic', () => {
  const GenericModal = ({ 
    showModal, 
    title, 
    Content, 
    handleModalClose, 
    handleBtnClick, 
    btnText,
    hideIcon,
    hideClose
  }) => {
    if (!showModal) return null;
    return (
      <div data-testid="generic-modal">
        <h2>{title}</h2>
        {Content && <Content />}
        {!hideClose && (
          <button onClick={handleModalClose} data-testid="modal-close-btn">Close</button>
        )}
        <button onClick={handleBtnClick} data-testid="modal-action-btn">{btnText}</button>
      </div>
    );
  };

  return {
    __esModule: true,
    default: () => GenericModal,
  };
});

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('../../primitives/Image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} data-testid={alt} />
  ),
}));

jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://example.com/',
}));

jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

describe('KnowMore Component', () => {
  const mockRouterPush = jest.fn();
  const mockTrackEvent = trackEvent as jest.Mock;
  
  const innerPageDataMock = {
    nonInvestedBanner: {
      bannerTitle: 'Test Banner Title',
      bannerDescription: 'Test Banner Description',
      bannerCta: 'Click Here',
      rightIcon: '',
      bannerImage: 'test-image.svg',
      modalTitle: 'Test Modal Title',
      modalPoints: ['<b>Point 1</b>', '<i>Point 2</i>'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockImplementation(() => ({
      pathname: '/test',
      push: mockRouterPush,
    }));
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  test('opens and closes modal when banner is clicked', async () => {
    render(<KnowMore innerPageData={innerPageDataMock} />);
    
    const banner = screen.getByText('Test Banner Title').closest('div[class*="TopContainer"]');
    fireEvent.click(banner);
    
    await act(async () => {
      await waitFor(() => {
        expect(screen.getByTestId('generic-modal')).toBeInTheDocument();
        expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('modal-action-btn'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('generic-modal')).toBeInTheDocument();
      });
    });
  });

  test('redirects to quick-start page and tracks event when on discover page', async () => {
    (useRouter as jest.Mock).mockImplementation(() => ({
      pathname: '/discover',
      push: mockRouterPush,
    }));
    
    render(<KnowMore innerPageData={innerPageDataMock} />);
    
    const banner = screen.getByText('Test Banner Title').closest('div[class*="TopContainer"]');
    fireEvent.click(banner);
    
    await act(async () => {
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('product-detail/quick-start');
        expect(mockTrackEvent).toHaveBeenCalledWith('quick_start_page_entry');
        expect(screen.queryByTestId('generic-modal')).not.toBeInTheDocument();
      });
    });
  });

  test('renders with mobile layout when useMediaQuery returns true', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    
    render(<KnowMore innerPageData={innerPageDataMock} />);
    
    const banner = screen.getByText('Test Banner Title').closest('div[class*="TopContainer"]');
    fireEvent.click(banner);
    
    await act(async () => {
      await waitFor(() => {
        expect(screen.getByTestId('generic-modal')).toBeInTheDocument();
        expect(screen.getByTestId('modal-close-btn')).toBeInTheDocument();
      });
    });
    
    expect(useMediaQuery).toHaveBeenCalled();
  });

  test('renders null for Points when modalPoints is not provided', async () => {
    const propsWithoutPoints = {
      nonInvestedBanner: {
        bannerTitle: 'Test Banner Title',
        bannerDescription: 'Test Banner Description',
        bannerCta: 'Click Here',
        modalTitle: 'Test Modal Title'
      },
    };
    
    render(<KnowMore innerPageData={{ ...propsWithoutPoints }} />);
    
    const banner = screen.getByText('Test Banner Title').closest('div[class*="TopContainer"]');
    fireEvent.click(banner);
    
    await act(async () => {
      await waitFor(() => {
        expect(screen.getByTestId('generic-modal')).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
    });
  });

  test('renders rightIcon when provided', () => {
    const propsWithRightIcon = {
      nonInvestedBanner: {
        ...innerPageDataMock.nonInvestedBanner,
        rightIcon: 'test-icon-class',
      },
    };
    
    render(<KnowMore innerPageData={propsWithRightIcon} />);
    
    expect(document.querySelector('.test-icon-class')).toBeInTheDocument();
    expect(screen.queryByTestId('KnowMoreVideoIcon')).not.toBeInTheDocument();
  });

  test('handles empty or undefined innerPageData', () => {
    render(<KnowMore innerPageData={undefined} />);
    
    expect(screen.queryByText('Test Banner Title')).not.toBeInTheDocument();
  });

  test('passes correct modal props including hideIcon and hideClose based on mobile state', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    render(<KnowMore innerPageData={innerPageDataMock} />);
    
    const banner = screen.getByText('Test Banner Title').closest('div[class*="TopContainer"]');
    fireEvent.click(banner);
    
    await waitFor(() => {
      expect(screen.getByTestId('generic-modal')).toBeInTheDocument();
      expect(screen.queryByTestId('modal-close-btn')).not.toBeInTheDocument();
      expect(screen.getByText('Okay! Understood')).toBeInTheDocument();
    });
  });
});