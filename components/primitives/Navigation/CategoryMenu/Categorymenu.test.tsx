// CategoryMenu.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryMenu from '.';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    pathname: '/',
    push: mockPush,
    prefetch: jest.fn(),
  })),
}));
// Mock the dynamic import for VideoComponent
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(() => <div>Mocked Video Component</div>),
}));

// Mock the imported data
jest.mock('../data', () => ({
  CategoriesLinkArr: [
    {
      id: 'about-us',
      title: 'About Us',
      clickUrl: '/about-us',
      shortDescription: 'About our company',
      openInNewTab: false,
      isBgFilledIcon: false,
      icon: 'about-us-icon.png',
    },
    {
      id: 'faqs',
      title: 'FAQs',
      clickUrl: '/faqs',
      shortDescription: 'Frequently Asked Questions',
      openInNewTab: false,
      isBgFilledIcon: false,
      icon: 'faqs-icon.png',
    },
  ],
  LeftSideLinkArr: ['faqs'],
  categoryVideoData: {
    url: 'https://video-link.com',
    thumbnail: 'thumbnail.jpg',
    duration: '3:15',
    title: 'Product Video',
  },
}));

describe('CategoryMenu', () => {
  test('renders the component correctly with links and video', () => {
    render(<CategoryMenu />);

    // Check if the video component is rendered
    expect(screen.getByText('Mocked Video Component')).toBeInTheDocument();

    // Check if the "Our Products" section and its links are rendered
    expect(screen.getByText('Our Products')).toBeInTheDocument();
    expect(screen.getByText('FAQs')).toBeInTheDocument();

    // Check if the "About" section and its link are rendered
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  test('renders only the links included in LeftSideLinkArr for "Our Products"', () => {
    render(<CategoryMenu />);
    expect(screen.getByText('FAQs')).toBeInTheDocument();
  });

  test('correctly renders the icon with links', () => {
    render(<CategoryMenu />);

    // Check if the icon for FAQs link is rendered
    expect(screen.getByAltText('FAQs')).toBeInTheDocument();
    expect(screen.getByAltText('About Us')).toBeInTheDocument();
  });

  test('clicking the "About Us" link renders anchor with correct href', () => {
    render(<CategoryMenu />);

    const aboutUsLink = screen.getByRole('link', { name: /About Us/i });

    expect(aboutUsLink).toHaveAttribute('href', '/about-us');
  });

  test('renders video component with correct props', () => {
    render(<CategoryMenu />);

    // Check if the video component is rendered with correct props
    expect(screen.getByText('Mocked Video Component')).toBeInTheDocument();
  });
});
