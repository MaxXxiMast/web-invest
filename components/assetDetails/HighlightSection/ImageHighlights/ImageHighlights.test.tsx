import { render, screen, fireEvent } from '@testing-library/react';
import ImageHighlights from './index';

jest.mock('../HighlightLabel', () => {
    return function MockedHighlightLabel({ label, index }) {
        return <div data-testid="highlight-label" key={`${label}-${index}`}>{label}</div>;
    };
});

jest.mock('../../../primitives/Button', () => {
    const Button = ({ children, onClick, className }) => (
        <button 
          data-testid="button-component"
          className={className}
          onClick={onClick}
        >
            {children}
        </button>
    );
    Button.ButtonType = {
        BorderLess: 'borderless',
    };
    return Button;
});

jest.mock('next/image', () => {
    return function MockImage({ src, alt, width, height, key }) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} width={width} height={height} data-testid="next-image" key={key} />;
    };
});

jest.mock('../../../../utils/string', () => ({
    GRIP_INVEST_BUCKET_URL: 'https://mocked-bucket-url/',
    handleExtraProps: (className) => className,
}));

const createBannerDataWithIds = (data) => {
    const result = {};
    Object.keys(data).forEach(key => {
      result[key] = data[key].map((item, idx) => ({...item, id: `${key}-item-${idx}`}));
    });
    return result;
};

describe('ImageHighlights Component', () => {
    const mockBannerData = createBannerDataWithIds({
        'Feature 1': [
            { content: 'https://example.com/image1.jpg' },
            { content: 'https://example.com/image2.jpg' },
        ],
        'Feature 2': [
            { content: 'https://example.com/image3.jpg' },
        ],
    });

    const mockFallbackBannerData = createBannerDataWithIds({
        'Fallback Feature': [
            { 
                content: 'image1.png', 
                alt: 'Image 1 Alt', 
                featureText: 'Feature Text 1' 
            },
        ],
    });

    const mockHandleModal = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders with banner data correctly', () => {
        render(<ImageHighlights bannerData={mockBannerData} handleModal={mockHandleModal} />);

        expect(screen.getByText('Feature 1')).toBeInTheDocument();
        expect(screen.getByText('Feature 2')).toBeInTheDocument();

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(3);
    });

    test('renders with fallback card correctly', () => {
        render(
            <ImageHighlights 
              bannerData={mockFallbackBannerData} 
              handleModal={mockHandleModal} 
              isFallbackCard={true} 
            />
        );

        expect(screen.getByText('Fallback Feature')).toBeInTheDocument();  
        expect(screen.getByAltText('Image 1 Alt')).toBeInTheDocument();    
        expect(screen.getByText('Feature Text 1')).toBeInTheDocument();
    });

    test('applies custom className correctly', () => {
      const { container } = render(
        <ImageHighlights 
          bannerData={mockBannerData} 
          handleModal={mockHandleModal} 
          className="custom-class" 
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    test('does not show "See more" button when showSeeMore is false', () => {
        render(
            <ImageHighlights 
              bannerData={mockBannerData} 
              handleModal={mockHandleModal} 
              showSeeMore={false} 
            />
        );

        expect(screen.queryByText('See more')).not.toBeInTheDocument();
    });

    test('calls handleModal when "See more" button is clicked', () => {
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
            configurable: true,
            get: function() { return 200; }
        });

        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            configurable: true,
            get: function() { return 100; }
        });

        render(
            <ImageHighlights 
              bannerData={mockBannerData} 
              handleModal={mockHandleModal} 
              showSeeMore={true} 
            />
        );

        const seeMoreButton = screen.getByText('See more');
        expect(seeMoreButton).toBeInTheDocument();

        fireEvent.click(seeMoreButton);
        expect(mockHandleModal).toHaveBeenCalledWith('imgHighlights');
    });

    test('correctly processes URL from content', () => {
        const mixedContentBannerData = createBannerDataWithIds({
            'Mixed Content': [
                { content: 'This is text with a URL https://example.com/image.jpg embedded in it' },
                { content: 'This has no URL' },
            ],
        });

        render(<ImageHighlights bannerData={mixedContentBannerData} handleModal={mockHandleModal} />);

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
        expect(images[0]).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    test('handles empty banner data', () => {
        render(<ImageHighlights bannerData={{}} handleModal={mockHandleModal} />);
        expect(screen.queryByTestId('highlight-label')).not.toBeInTheDocument();
    });

    test('handles null or undefined values in bannerData', () => {
        const nullValueBannerData = createBannerDataWithIds({
            'Feature with null': [
                { content: null },
                { content: undefined },
                { content: 'https://example.com/valid-image.jpg' }
            ],
        });
      
        render(<ImageHighlights bannerData={nullValueBannerData} />);

        expect(screen.getByText('Feature with null')).toBeInTheDocument();

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
        expect(images[0]).toHaveAttribute('src', 'https://example.com/valid-image.jpg');
    });

    test('handles undefined bannerData without crashing', () => {
        render(<ImageHighlights bannerData={undefined} />);

        expect(screen.queryByTestId('highlight-label')).not.toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
});