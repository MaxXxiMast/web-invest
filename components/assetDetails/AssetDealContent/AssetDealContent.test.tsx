import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AssetDealContent from '../AssetDealContent/index';

jest.mock('../../common/pdfViewer', () => ({
  __esModule: true,
  default: ({ url }) => <div data-testid="pdf-viewer">PDF Viewer: {url}</div>,
}));

jest.mock('../../../utils/htmlSanitizer', () => ({
  __esModule: true,
  htmlSanitizer: jest.fn((content) => content),
}));

jest.mock('../../../utils/string', () => ({
  __esModule: true,
  handleExtraProps: jest.fn((props) => props || ''),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  __esModule: true,
  useAppSelector: jest.fn(),
}));

jest.mock('../../../api/details', () => ({
  __esModule: true,
  getSignedUrl: jest.fn(),
}));

jest.mock('../utils', () => ({
  __esModule: true,
  processContent: jest.fn((content) => content),
}));

jest.mock('../../primitives/Accordian', () => ({
  __esModule: true,
  default: ({ title, children, defaultValue, toggleCallback, ...props }) => (
    <div data-testid="accordion" data-title={title} data-default={defaultValue}>
      <button onClick={toggleCallback}>Toggle {title}</button>
      {children}
    </div>
  ),
}));

jest.mock('../../../utils/gtm', () => ({
  __esModule: true,
  trackEvent: jest.fn(),
}));

import { htmlSanitizer } from '../../../utils/htmlSanitizer';
import { handleExtraProps } from '../../../utils/string';
import { useAppSelector } from '../../../redux/slices/hooks';
import { getSignedUrl } from '../../../api/details';
import { processContent } from '../utils';
import { trackEvent } from '../../../utils/gtm';

const mockHtmlSanitizer = htmlSanitizer as jest.Mock;
const mockHandleExtraProps = handleExtraProps as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;
const mockGetSignedUrl = getSignedUrl as jest.Mock;
const mockProcessContent = processContent as jest.Mock;
const mockTrackEvent = trackEvent as jest.Mock;

const createMockStore = (state = {}) => {
  return configureStore({
    reducer: {
      assets: (state = { selectedAssetDocuments: [] }) => state,
    },
    preloadedState: state,
  });
};

const renderWithProvider = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(<Provider store={store}>{component}</Provider>);
};

describe('AssetDealContent', () => {
  const defaultProps = {
    data: [],
    assetID: 123,
    id: 'test-id',
    className: 'test-class',
    isPartnerSection: false,
    compactContent: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockReturnValue([]);
    mockHtmlSanitizer.mockImplementation((content) => content);
    mockHandleExtraProps.mockImplementation((props) => props || '');
    mockProcessContent.mockImplementation((content) => content);
  });

  test('renders empty component when data is empty array', () => {
    renderWithProvider(<AssetDealContent {...defaultProps} />);
    
    expect(screen.queryByText(/About Partners/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument();
  });

  test('renders PDF viewer when investor deck URL is available', async () => {
    const mockDocuments = [
      { docType: 'investor_deck', docID: 'doc123' }
    ];
    
    mockUseAppSelector.mockReturnValue(mockDocuments);
    mockGetSignedUrl.mockResolvedValue({ url: 'https://example.com/pdf' });

    renderWithProvider(<AssetDealContent {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
      expect(screen.getByText('PDF Viewer: https://example.com/pdf')).toBeInTheDocument();
    });

    expect(mockGetSignedUrl).toHaveBeenCalledWith({
      docID: 'doc123',
      module: 'asset',
    });
  });

  test('renders regular content when no investor deck is available', () => {
    const mockData = [
      {
        title: 'Test Section',
        content: '<p>Test content</p>',
        page: 'Test Page',
        moduleID: 123,
        isDynamicContent: false,
      }
    ];

    mockUseAppSelector.mockReturnValue([]);
    
    renderWithProvider(
      <AssetDealContent {...defaultProps} data={mockData} />
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByTestId('accordion')).toBeInTheDocument();
  });

  test('renders partner section correctly', () => {
    const mockPartnerData = [
      {
        'partner1': [
          {
            title: 'Partner Info',
            content: '<p>Partner details</p>',
            page: 'Partners',
            moduleID: 123,
            isDynamicContent: false,
          }
        ]
      }
    ];

    renderWithProvider(
      <AssetDealContent 
        {...defaultProps} 
        data={mockPartnerData} 
        isPartnerSection={true} 
      />
    );

    expect(screen.getByText('About Partners')).toBeInTheDocument();
    expect(screen.getByTestId('accordion')).toBeInTheDocument();
  });

  test('renders dynamic content without dangerouslySetInnerHTML', () => {
    const dynamicContent = <div>Dynamic React Content</div>;
    const mockData = [
      {
        title: 'Dynamic Section',
        content: dynamicContent,
        page: 'Test Page',
        moduleID: 123,
        isDynamicContent: true,
      }
    ];

    renderWithProvider(
      <AssetDealContent {...defaultProps} data={mockData} />
    );

    expect(screen.getByText('Dynamic React Content')).toBeInTheDocument();
  });

  test('applies compact content class when compactContent is true', () => {
    const mockData = [
      {
        title: 'Test Section',
        content: '<p>Test content</p>',
        page: 'Test Page',
        moduleID: 123,
        isDynamicContent: false,
      }
    ];

    const { container } = renderWithProvider(
      <AssetDealContent 
        {...defaultProps} 
        data={mockData} 
        compactContent={true} 
      />
    );

    expect(container.querySelector('.Compact')).toBeInTheDocument();
  });

  test('calls trackEvent when accordion is toggled', async () => {
    const mockData = [
      {
        title: 'Test Section',
        content: '<p>Test content</p>',
        page: 'Test Page',
        moduleID: 123,
        isDynamicContent: false,
      }
    ];

    renderWithProvider(
      <AssetDealContent {...defaultProps} data={mockData} />
    );

    const toggleButton = screen.getByText('Toggle Test Section');
    toggleButton.click();

    expect(mockTrackEvent).toHaveBeenCalledWith('Asset Detail Tab Accordian Clicked', {
      title: 'Test Section',
      tab_name: 'Test Page',
      asset_id: 123,
    });
  });

  test('renders content without accordion when title matches finalTitle', () => {
    const mockData = [
      {
        title: 'Test Page',
        content: '<p>Test content</p>',
        page: 'Test Page',
        moduleID: 123,
        isDynamicContent: false,
      }
    ];

    renderWithProvider(
      <AssetDealContent {...defaultProps} data={mockData} />
    );

    expect(screen.queryByTestId('accordion')).not.toBeInTheDocument();
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  test('processes content through sanitizer and processContent utilities', () => {
    const mockData = [
      {
        title: 'Test Section',
        content: '<script>alert("xss")</script><p>Safe content</p>',
        page: 'Test Page',
        moduleID: 123,
        isDynamicContent: false,
      }
    ];

    renderWithProvider(
      <AssetDealContent {...defaultProps} data={mockData} />
    );

    expect(mockProcessContent).toHaveBeenCalledWith('<script>alert("xss")</script><p>Safe content</p>');
    expect(mockHtmlSanitizer).toHaveBeenCalled();
  });

  test('applies custom className and id props', () => {
    const { container } = renderWithProvider(
      <AssetDealContent {...defaultProps} className="custom-class" id="custom-id" />
    );

    expect(container.querySelector('#custom-id')).toBeInTheDocument();
    expect(mockHandleExtraProps).toHaveBeenCalledWith('custom-class');
  });

  test('handles multiple partner sections correctly', () => {
    const mockPartnerData = [
      {
        'partner1': [
          {
            title: 'Partner 1 Info',
            content: '<p>Partner 1 details</p>',
            page: 'Partners',
            moduleID: 123,
            isDynamicContent: false,
          }
        ]
      },
      {
        'partner2': [
          {
            title: 'Partner 2 Info',
            content: '<p>Partner 2 details</p>',
            page: 'Partners',
            moduleID: 123,
            isDynamicContent: false,
          }
        ]
      }
    ];

    renderWithProvider(
      <AssetDealContent 
        {...defaultProps} 
        data={mockPartnerData} 
        isPartnerSection={true} 
      />
    );

    expect(screen.getByText('About Partners')).toBeInTheDocument();
    expect(screen.getAllByTestId('accordion')).toHaveLength(2);
  });

  test('sets first accordion as default open', () => {
    const mockData = [
      {
        title: 'First Section',
        content: '<p>First content</p>',
        page: 'Test Page',
        moduleID: 123,
        isDynamicContent: false,
      },
      {
        title: 'Second Section',
        content: '<p>Second content</p>',
        page: 'Test Page',
        moduleID: 123,
        isDynamicContent: false,
      }
    ];

    renderWithProvider(
      <AssetDealContent {...defaultProps} data={mockData} />
    );

    const accordions = screen.getAllByTestId('accordion');
    expect(accordions[0]).toHaveAttribute('data-default', 'true');
    expect(accordions[1]).toHaveAttribute('data-default', 'false');
  });
});