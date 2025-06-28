import { render, screen } from '@testing-library/react';
import LiveCards from './index';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

describe('LiveCards Component', () => {
  const mockComparisonData = [
    {
      id: 82,
      Value: 'Tab 1',
      image: {
        data: {
          id: 783,
          attributes: {
            name: 'CompariosnCard2.png',
            alternativeText: 'CompariosnCard2.png',
            caption: 'CompariosnCard2.png',
            width: 1364,
            height: 1524,
            url: 'https://gi-strapi.s3.ap-south-1.amazonaws.com/Compariosn_Card2_28d35fe16d.png',
          },
        },
      },
    },
    {
      id: 131,
      Value: 'Tab 2',
      image: {
        data: {
          id: 957,
          attributes: {
            name: 'Portfolio page.png',
            alternativeText: null,
            caption: null,
            width: 360,
            height: 360,
            url: 'https://gi-strapi.s3.ap-south-1.amazonaws.com/Portfolio_page_afa6eb5592.png',
          },
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display title only if available', () => {
    const { rerender } = render(
      <LiveCards comparisonData={mockComparisonData} title="Test Title" />
    );
    const titleElement = screen.getByRole('heading', { level: 3 });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('Test Title');

    rerender(<LiveCards comparisonData={mockComparisonData} />);
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  test('should display LiveTabs list if isMobile is true, else no list', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true); // Simulate mobile view
    const { rerender } = render(
      <LiveCards comparisonData={mockComparisonData} />
    );
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(2);

    (useMediaQuery as jest.Mock).mockReturnValue(false); // Simulate desktop view
    rerender(<LiveCards comparisonData={mockComparisonData} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('should render only one card if isMobile is true, else render all cards', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true); // Simulate mobile view
    const { rerender } = render(
      <LiveCards comparisonData={mockComparisonData} />
    );

    // Query images and verify their src attributes
    const cards = screen.getAllByRole('img');
    expect(cards.length).toBe(1);

    (useMediaQuery as jest.Mock).mockReturnValue(false); // Simulate desktop view
    rerender(<LiveCards comparisonData={mockComparisonData} />);
    const allCards = screen.getAllByRole('img');
    expect(allCards.length).toBe(mockComparisonData.length); // All cards should be rendered in desktop view
  });

  test('should display card only if image is present, else should not display card', () => {
    const incompleteData = [
      { Value: 'Tab 1' }, // Missing image
      {
        Value: 'Tab 2',
        image: {
          data: {
            id: 957,
            attributes: {
              name: 'Portfolio page.png',
              alternativeText: null,
              caption: null,
              width: 360,
              height: 360,
              url: 'https://gi-strapi.s3.ap-south-1.amazonaws.com/Portfolio_page_afa6eb5592.png',
            },
          },
        },
      },
    ];
    render(<LiveCards comparisonData={incompleteData} />);
    const cards = screen.getAllByRole('img');
    expect(cards.length).toBe(1); // Only one valid image should be rendered
  });
});
