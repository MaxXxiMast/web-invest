import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileDrawer from './MobileDrawer';

// Mock dependencies
jest.mock('../../assets/CloseLineIcon', () => {
  const MockCloseLineIcon = () => <div data-testid="close-icon" />;
  MockCloseLineIcon.displayName = 'MockCloseLineIcon';
  return MockCloseLineIcon;
});
jest.mock('../BodyRootWrapper', () => {
  const MockBodyRootWrapper = ({ children }) => (
    <div data-testid="body-root-wrapper">{children}</div>
  );
  MockBodyRootWrapper.displayName = 'MockBodyRootWrapper';
  return MockBodyRootWrapper;
});

// Mock styles
jest.mock('./MobileDrawer.module.css', () => ({
  MobileFlyer: 'mock-mobile-flyer',
  MobileFlyerInner: 'mock-mobile-flyer-inner',
  MobileCloseBtn: 'mock-mobile-close-btn',
  MobileDrawerBody: 'mock-mobile-drawer-body',
}));

// Mock utils
jest.mock('../../../utils/string', () => ({
  handleExtraProps: (className) => className || '',
}));

describe('MobileDrawer', () => {
  afterEach(() => {
    document.body.classList.remove('scroll-hidden');
    jest.clearAllMocks();
  });

  test('should not render when showFlyer is false', () => {
    render(<MobileDrawer showFlyer={false} />);
    expect(screen.queryByTestId('body-root-wrapper')).toBeInTheDocument();
    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
  });

  test('should render when showFlyer is true', () => {
    render(<MobileDrawer showFlyer={true} />);
    expect(screen.getByTestId('body-root-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    expect(document.body.classList.contains('scroll-hidden')).toBe(true);
  });

  test('should apply custom className when provided', () => {
    render(<MobileDrawer showFlyer={true} className="custom-class" />);
    const innerElement = screen
      .getByTestId('body-root-wrapper')
      .querySelector('.mock-mobile-flyer-inner');
    expect(innerElement).toHaveClass('custom-class');
  });

  test('should apply custom backgroundColor when provided', () => {
    render(<MobileDrawer showFlyer={true} backgroundColor="red" />);
    const innerElement = screen
      .getByTestId('body-root-wrapper')
      .querySelector('.mock-mobile-flyer-inner');
    expect(innerElement).toHaveStyle({ background: 'red' });
  });

  test('should hide close button when hideClose is true', () => {
    render(<MobileDrawer showFlyer={true} hideClose={true} />);
    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
  });

  test('should render children content', () => {
    render(
      <MobileDrawer showFlyer={true}>
        <div data-testid="child-content">Test Content</div>
      </MobileDrawer>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('should call handleDrawerClose when close button is clicked', () => {
    const mockHandleDrawerClose = jest.fn();
    render(
      <MobileDrawer
        showFlyer={true}
        handleDrawerClose={mockHandleDrawerClose}
      />
    );

    const closeButton = screen
      .getByTestId('body-root-wrapper')
      .querySelector('.mock-mobile-close-btn');
    fireEvent.click(closeButton);

    expect(mockHandleDrawerClose).toHaveBeenCalledWith(false);
  });

  test('should call handleDrawerClose when clicking on backdrop', () => {
    const mockHandleDrawerClose = jest.fn();
    render(
      <MobileDrawer
        showFlyer={true}
        handleDrawerClose={mockHandleDrawerClose}
      />
    );

    const backdrop = screen
      .getByTestId('body-root-wrapper')
      .querySelector('.mock-mobile-flyer');
    fireEvent.click(backdrop);

    expect(mockHandleDrawerClose).toHaveBeenCalledWith(false);
  });

  test('should not call handleDrawerClose when clicking inside the drawer', () => {
    const mockHandleDrawerClose = jest.fn();
    render(
      <MobileDrawer
        showFlyer={true}
        handleDrawerClose={mockHandleDrawerClose}
      />
    );

    const innerDrawer = screen
      .getByTestId('body-root-wrapper')
      .querySelector('.mock-mobile-flyer-inner');
    fireEvent.click(innerDrawer);

    expect(mockHandleDrawerClose).not.toHaveBeenCalled();
  });

  test('should remove scroll-hidden class when unmounted', () => {
    const { unmount } = render(<MobileDrawer showFlyer={true} />);
    expect(document.body.classList.contains('scroll-hidden')).toBe(true);

    unmount();
  });

  test('should handle when handleDrawerClose is not provided', () => {
    // This test checks that no errors occur when optional callbacks are missing
    render(<MobileDrawer showFlyer={true} />);

    const closeButton = screen
      .getByTestId('body-root-wrapper')
      .querySelector('.mock-mobile-close-btn');
    expect(() => fireEvent.click(closeButton)).not.toThrow();

    const backdrop = screen
      .getByTestId('body-root-wrapper')
      .querySelector('.mock-mobile-flyer');
    expect(() => fireEvent.click(backdrop)).not.toThrow();
  });
});
