import { render, screen } from '@testing-library/react';
import Cart from './index';

// Mocks
jest.mock('../utils', () => ({
  getCartPosition: jest.fn().mockReturnValue({
    bottom: '20px',
    zIndex: 2,
    transform: 'scale(1)',
    containerOpacity: 1,
    opacity: 0.9,
  }),
}));

jest.mock('./Cart.module.css', () => ({
  container: 'container',
}));

jest.mock('../../../primitives/Image', () => {
  const MockImage = (props: any) => (
    <img src={props.src} alt="mock-img" data-testid="mock-image" />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('Cart Component', () => {
  const props = {
    id: 1,
    img: 'https://example.com/test.jpg',
    comment: 'User bought <b>10 units</b> of bond',
    index: 2,
    position: -1,
    addCart: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders image with correct src', () => {
    render(<Cart {...props} />);
    const img = screen.getByTestId('mock-image');
    expect(img).toHaveAttribute('src', props.img);
  });

  test('renders comment HTML correctly', () => {
    render(<Cart {...props} />);
    expect(screen.getByText(/10 units/)).toBeInTheDocument();
  });

  test('calls addCart when index + position === 0', () => {
    render(<Cart {...props} index={1} position={-1} />);
    expect(props.addCart).toHaveBeenCalledWith(props.id);
  });

  test('does not call addCart when index + position !== 0', () => {
    render(<Cart {...props} index={2} position={-1} />);
    expect(props.addCart).not.toHaveBeenCalled();
  });

  test('applies correct inline styles from getCartPosition', () => {
    const { container } = render(<Cart {...props} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      bottom: '20px',
      zIndex: '2',
      transform: 'scale(1)',
      opacity: '1',
    });
  });
});
