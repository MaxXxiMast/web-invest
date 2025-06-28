// BlogNavigationContent.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BlogNaviagtionContent from '../BlogNavigationContent';
import * as hooks from '../../../../utils/customHooks/useMediaQuery';
import * as cookie from 'js-cookie';

// Mock modules
jest.mock('js-cookie');
jest.mock('../../../../utils/media');
jest.mock('../../../../utils/customHooks/useMediaQuery');

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    prefetch: jest.fn(),
    query: {},
    pathname: '/',
  })),
}));

jest.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div>{children}</div>,
  SwiperSlide: ({ children }) => <div>{children}</div>,
}));

describe('BlogNaviagtionContent', () => {
  const mockContextData = {
    loading: false,
    recentArticles: [
      {
        Article: {
          articleHeading: 'Article 1',
          publishedAt: '2025-04-01',
          coverImage: 'image1.jpg',
          authorImage: 'author1.jpg',
          articleContent: { richLabel: 'Description 1' },
          author: 'Author 1',
        },
        slug: '/article-1',
      },
      {
        Article: {
          articleHeading: 'Article 2',
          publishedAt: '2025-04-02',
          coverImage: 'image2.jpg',
          authorImage: 'author2.jpg',
          articleContent: { richLabel: 'Description 2' },
          author: 'Author 2',
        },
        slug: '/article-2',
      },
    ],
    totalBlogCount: 20,
    countBlogCategory: {
      Tech: 10,
      Lifestyle: 5,
    },
    blogCategories: [
      {
        label: 'Tech',
        image: { desktopUrl: 'tech.jpg' },
        showNavigationDesktop: true,
        showNavigationMobile: true,
      },
      {
        label: 'Lifestyle',
        image: { desktopUrl: 'lifestyle.jpg' },
        showNavigationDesktop: true,
        showNavigationMobile: false,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render the component correctly', async () => {
    (hooks.useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop view

    render(<BlogNaviagtionContent contextData={mockContextData} />);

    // Check if categories and articles are rendered
    expect(screen.getByText('Top blog categories')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Lifestyle')).toBeInTheDocument();
    expect(screen.getByText('Latest from our blogs')).toBeInTheDocument();
    expect(screen.getByText('Article 1')).toBeInTheDocument();
    expect(screen.getByText('Article 2')).toBeInTheDocument();
  });

  test('should render mobile view correctly with swiper', async () => {
    (hooks.useMediaQuery as jest.Mock).mockReturnValue(true); // Mobile view

    render(<BlogNaviagtionContent contextData={mockContextData} />);
  });

  test('should call cookie set on category click', async () => {
    (cookie.set as jest.Mock).mockImplementation(() => {});
    (hooks.useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop view

    render(<BlogNaviagtionContent contextData={mockContextData} />);

    // Click on category link
    fireEvent.click(screen.getByText('Tech'));

    // Assert that cookie.set is called
    expect(cookie.set).toHaveBeenCalledWith('clickTag', '1');
  });

  test('should handle no recent articles', async () => {
    const emptyContextData = {
      ...mockContextData,
      recentArticles: [],
    };

    render(<BlogNaviagtionContent contextData={emptyContextData} />);

    // Assert that no articles are displayed
    expect(screen.queryByText('Article 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Article 2')).not.toBeInTheDocument();
  });

  test('should handle loading state', async () => {
    const loadingContextData = {
      ...mockContextData,
      loading: true,
    };

    render(<BlogNaviagtionContent contextData={loadingContextData} />);

    // Assert that nothing is rendered during loading
    expect(screen.queryByText('Top blog categories')).not.toBeInTheDocument();
  });

  test('should handle categories visibility based on device type', async () => {
    const mobileContextData = {
      ...mockContextData,
      blogCategories: [
        {
          label: 'Tech',
          image: { desktopUrl: 'tech.jpg' },
          showNavigationDesktop: true,
          showNavigationMobile: true,
        },
        {
          label: 'Lifestyle',
          image: { desktopUrl: 'lifestyle.jpg' },
          showNavigationDesktop: true,
          showNavigationMobile: false,
        },
      ],
    };

    (hooks.useMediaQuery as jest.Mock).mockReturnValue(true); // Mobile view

    render(<BlogNaviagtionContent contextData={mobileContextData} />);

    // Only Tech should be visible on mobile view
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.queryByText('Lifestyle')).not.toBeInTheDocument();
  });
});
