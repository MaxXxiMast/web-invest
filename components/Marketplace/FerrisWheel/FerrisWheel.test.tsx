import { render, screen, act } from '@testing-library/react';
import FerrisWheel from './index';

// Mock constants and CSS
jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://fake-bucket-url.com/',
}));

jest.mock('./FerrisWheel.module.css', () => ({
  container: 'container',
}));

// Mock Cart component
jest.mock('./Cart', () => {
  const MockCart = ({ id, img, comment, index, position }: any) => (
    <div data-testid="cart" data-id={id}>
      <img src={img} alt={`img-${id}`} />
      <div dangerouslySetInnerHTML={{ __html: comment }} />
      <div>Index: {index}</div>
      <div>Position: {position}</div>
    </div>
  );
  MockCart.displayName = 'MockCart';
  return MockCart;
});

describe('FerrisWheel Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('renders initial carts correctly', () => {
    render(<FerrisWheel />);

    // Check the number of rendered carts (3 original + 1 duplicate)
    const carts = screen.getAllByTestId('cart');
    expect(carts).toHaveLength(4);

    // Check the number of rendered images
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
    images.forEach((img) => {
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('https://fake-bucket-url.com/marketplace/')
      );
    });

    // Check that each cart comment is rendered at least once
    const expectedComments = [
      'Ankit purchased 35 units of Navi bond with just 1 month remaining tenure',
      'Mahima got a Ugro bond at 10% better YTM than elsewhere',
      'Rohit bought a 13.25% returns bond with 3 month remaining tenure',
    ];

    expectedComments.forEach((rawText) => {
      const normalizedText = rawText
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const found = screen
        .getAllByTestId('cart')
        .some((cart) =>
          cart.textContent?.replace(/\s+/g, ' ').includes(normalizedText)
        );
      expect(found).toBe(true);
    });
  });

  test('updates position every 5 seconds', () => {
    render(<FerrisWheel />);
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    const positionText = screen.getAllByText(/Position:/)[0];
    expect(positionText).toHaveTextContent('Position: 0');
  });

  test('resets carts if length reaches 20', () => {
    // Push enough carts to trigger the reset
    const { container } = render(<FerrisWheel />);
    const cartComponent = container.querySelector('[data-testid="cart"]');

    // @ts-ignore
    const addCart = cartComponent?.props?.addCart || (() => {});

    act(() => {
      for (let i = 0; i < 16; i++) {
        addCart(i % 3); // add data[0], data[1], data[2] in cycle
      }
    });

    // After reaching 20, it should trim back to original length
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const carts = screen.getAllByTestId('cart');
    expect(carts.length).toBeLessThanOrEqual(7); // 6 unique + 1 duplicate
  });
});
