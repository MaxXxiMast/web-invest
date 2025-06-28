import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PastAssetDetailCalculator from './index';
import { fetchAPI } from '../../../api/strapi';

jest.mock('../AssetMobileButton', () => ({
    __esModule: true,
    default: ({ dealType, className }) => (
        <div data-testid="asset-mobile-button" className={className} data-deal-type={dealType}>
            Mock Asset Mobile Button
        </div>
    ),
}));

jest.mock('../../css-scroll-carousel', () => ({
    __esModule: true,
    default: ({ slideWidth, animationSpeed, data, renderItem }) => (
        <div data-testid="css-scroll-carousel" data-slide-width={slideWidth} data-animation-speed={animationSpeed}>
            {data?.map((item, index) => (
                <div key={index} data-testid="carousel-item">
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    ),
}));

jest.mock('../../primitives/CustomSkeleton/CustomSkeleton', () => ({
    __esModule: true,
    default: ({ styles }) => (
        <div 
            data-testid="custom-skeleton" 
            style={{ 
                height: styles.height, 
                width: styles.width 
            }}
        >
            Mock Skeleton
        </div>
    ),
}));

jest.mock('../../testimonial-card', () => ({
    __esModule: true,
    default: ({ item }) => (
        <div data-testid="testimonial-card" data-user-name={item?.name}>
            Mock Testimonial Card for {item?.name || 'Unknown User'}
        </div>
    ),
}));

jest.mock('../../../api/strapi', () => ({
    fetchAPI: jest.fn()
}));

describe('PastAssetDetailCalculator Component', () => {

    const mockTestimonialData = [
        {
          name: 'mock name 1',
          designation: 'Software Engineer',
          testimonial: 'Great investment platform!',
          profilePic: {
            data: {
              attributes: {
                url: 'mock-url-1.jpg'
              }
            }
          }
        },
        {
          name: 'mock name 2',
          designation: 'Financial Analyst',
          testimonial: 'Excellent returns on my investments.',
          profilePic: {
            data: {
              attributes: {
                url: 'mock-url-2.jpg'
              }
            }
          }
        }
    ];

    const mockApiResponse = {
        data: [
          {
            attributes: {
              pageData: [
                {
                  __component: 'shared.testimonial-component',
                  testimonials: mockTestimonialData,
                  headerContent: {
                    title: 'What our customers say',
                    description: 'Hear from our happy investors'
                  }
                },
                {
                  __component: 'some.other-component'
                }
              ]
            }
          }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    test("renders loading skeleton initially", () => {
        (fetchAPI as jest.Mock).mockImplementation(() => new Promise(resolve => {
            setTimeout(() => resolve({}), 1000);
        }));

        render(<PastAssetDetailCalculator/>);

        const skeletons = screen.getAllByTestId('custom-skeleton');
        expect(skeletons).toHaveLength(2);
    });

    test("render PastAssetDetailCalculator", async() => {

        (fetchAPI as jest.Mock).mockResolvedValue(mockApiResponse)

        render(<PastAssetDetailCalculator/>);

        await waitFor(() => {
            expect(screen.queryByTestId('custom-skeleton')).not.toBeInTheDocument();
        });

        const testimonialCards = screen.getAllByTestId('testimonial-card');
        expect(testimonialCards).toHaveLength(2);
    });

    test('handles API error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        (fetchAPI as jest.Mock).mockRejectedValue(new Error('API Error'));

        render(<PastAssetDetailCalculator />);

        await waitFor(() => {
        expect(screen.queryByTestId('custom-skeleton')).not.toBeInTheDocument();
        });
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    test('handles undefined homePageTopFold', async () => {
        (fetchAPI as jest.Mock).mockResolvedValue(undefined);

        render(<PastAssetDetailCalculator />);

        await waitFor(() => {
            expect(screen.queryByTestId('custom-skeleton')).not.toBeInTheDocument();
        });

        const carousel = screen.getByTestId('css-scroll-carousel');
        expect(carousel).toBeInTheDocument();
        expect(screen.queryAllByTestId('carousel-item')).toHaveLength(0);
    });
});