import { render } from '@testing-library/react';
import CircularProgressLoader from './index';

describe('CircularProgressLoader Component', () => {
  test('should render with default size and thickness', () => {
    const { container } = render(<CircularProgressLoader />);

    const progressLoaders = container.querySelectorAll(
      '.MuiCircularProgress-root'
    );

    progressLoaders.forEach((loader) => {
      expect(loader).toHaveAttribute('style', expect.stringContaining('40px'));
    });
  });

  test('should render with custom size, thickness, and progress colors', () => {
    const customSize = 60;
    const customThickness = 10;

    const { container } = render(
      <CircularProgressLoader size={customSize} thickness={customThickness} />
    );

    const progressLoaders = container.querySelectorAll(
      '.MuiCircularProgress-root'
    );

    progressLoaders.forEach((loader) => {
      expect(loader).toHaveAttribute(
        'style',
        expect.stringContaining(`${customSize}px`)
      );
    });
  });
});
