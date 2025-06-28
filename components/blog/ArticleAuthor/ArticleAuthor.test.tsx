import { render, screen } from '@testing-library/react';
import ArticleAuthor from '.';
import { AuthorModel } from '../../../utils/blog';
import { handleExtraProps } from '../../../utils/string';

jest.mock('../../../utils/media', () => ({
  getStrapiMediaS3Url: jest.fn((url) => `https://s3.amazonaws.com/${url}`),
}));

jest.mock('../../../utils/string', () => ({
  handleExtraProps: jest.fn((className) => className),
}));

jest.mock('../../primitives/Image', () => ({
  __esModule: true,
  default: (props: any) => (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-testid="mock-image" alt={props.altText} {...props} />,
    </>
  )
}));

jest.mock('../ReadTime', () => {
  const MockedReadTime = ({ showReadTime, description }) =>
    showReadTime ? <div data-testid="read-time">{description}</div> : null;
  MockedReadTime.displayName = 'MockedReadTime';
  return MockedReadTime;
});

jest.mock('dayjs', () => {
  const actualDayjs = jest.requireActual('dayjs');
  const mockedDayjs = (...args) => {
    const instance = actualDayjs(...args);
    instance.format = jest.fn(() => 'Jan 01, 2023');
    return instance;
  };
  mockedDayjs.extend = jest.fn();
  return mockedDayjs;
});

jest.mock('dayjs/plugin/utc', () => () => {});
jest.mock('dayjs/plugin/timezone', () => () => {});

describe('ArticleAuthor Component', () => {
  const defaultProps = {
    authorData: {
      name: 'John Doe',
      image: {
        desktopUrl: 'test-image.jpg',
        altText: 'Author Image',
        data: {
          attributes: {
            updatedAt: '2023-01-01T00:00:00Z',
          },
        },
      },
    },
    showReadTime: false,
    description: 'Test description',
    className: '',
    showTitleWithDot: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders author name and image correctly', () => {
    render(<ArticleAuthor {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    const image = screen.getByTestId('mock-image');
    expect(image).toHaveAttribute(
      'src',
      'https://s3.amazonaws.com/test-image.jpg'
    );
    expect(image).toHaveAttribute('width', '32');
    expect(image).toHaveAttribute('height', '32');
  });

  test('does not render image if desktopUrl is missing', () => {
    const props = {
      ...defaultProps,
      authorData: {
        name: 'John Doe',
        image: null,
      },
    };
    render(<ArticleAuthor {...props} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument();
  });

  test('does not render date if updatedAt is missing', () => {
    const props = {
      ...defaultProps,
      authorData: {
        name: 'John Doe',
        image: {
          desktopUrl: 'test-image.jpg',
          altText: 'Author Image',
          data: {
            attributes: {
              updatedAt: null,
            },
          },
        },
      },
    };
    render(<ArticleAuthor {...props} />);
    expect(screen.queryByText('Jan 01, 2023')).not.toBeInTheDocument();
  });

  test('renders ReadTime component when showReadTime is true', () => {
    const props = {
      ...defaultProps,
      showReadTime: true,
    };
    render(<ArticleAuthor {...props} />);
    const readTime = screen.getByTestId('read-time');
    expect(readTime).toBeInTheDocument();
    expect(readTime).toHaveTextContent('Test description');
  });

  test('applies custom className correctly', () => {
    const props = {
      ...defaultProps,
      className: 'custom-class',
    };
    render(<ArticleAuthor {...props} />);
    const wrapper = screen.getByText('John Doe')?.parentElement?.parentElement;
    expect(wrapper?.className).toContain('custom-class');
    expect(handleExtraProps).toHaveBeenCalledWith('custom-class');
  });

  test('handles empty authorData gracefully', () => {
    const props = {
      ...defaultProps,
      authorData: new AuthorModel(),
    };
    render(<ArticleAuthor {...props} />);
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument();
  });

  test('uses default props correctly', () => {
    render(<ArticleAuthor />);
    expect(screen.queryByTestId('read-time')).not.toBeInTheDocument();
  });
});
