import { render, screen, fireEvent } from '@testing-library/react';
import FilterButton from './FilterButton';
import * as hooks from '../../../../redux/slices/hooks';
import * as scrollUtils from '../../../../utils/scroll';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

// Mocks
jest.mock('../../../primitives/Button', () => ({
  __esModule: true,
  default: (props: any) => (
    <button onClick={props.onClick} data-testid="filter-btn">
      {props.children}
    </button>
  ),
  ButtonType: {
    PrimaryLight: 'PrimaryLight',
  },
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('FilterButton', () => {
  beforeEach(() => {
    (useDispatch as jest.Mock).mockReturnValue(jest.fn());
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/' });
  });

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/' } as any);
    jest
      .spyOn(hooks, 'useAppSelector')
      .mockReturnValue({ isFilteredKYCComplete: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<FilterButton setShowFilters={jest.fn()} />);
    expect(screen.getByTestId('filter-btn')).toBeInTheDocument();
    expect(screen.getByText('Sort & Filter')).toBeInTheDocument();
  });

  it('calls setShowFilters(true) on button click', () => {
    const setShowFilters = jest.fn();
    render(<FilterButton setShowFilters={setShowFilters} />);
    fireEvent.click(screen.getByTestId('filter-btn'));
    expect(setShowFilters).toHaveBeenCalledWith(true);
  });

  it('renders filter applied indicator when isFilterApplied is true', () => {
    const { container } = render(
      <FilterButton isFilterApplied={true} setShowFilters={jest.fn()} />
    );
    const filterDot = container.querySelector(`.${'filterApplied'}`);
    expect(filterDot).toBeInTheDocument();
  });

  it('adjusts button width and hides text when isMobile is true', () => {
    const { container } = render(<FilterButton isMobile={true} setShowFilters={jest.fn()} />);
    
    // Check that the icon is present
    const filterIcon = container.querySelector('.icon-filter');
    expect(filterIcon).toBeInTheDocument();
    
    // Check that the text is hidden
    expect(screen.queryByText('Sort & Filter')).not.toBeInTheDocument();
  });

  it('adds scroll event listener on /assets page with small screen and incomplete KYC', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    const mockAddEventListener = jest.spyOn(window, 'addEventListener');
    const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener');
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/assets' } as any);
    jest
      .spyOn(hooks, 'useAppSelector')
      .mockReturnValue({ isFilteredKYCComplete: false });

    const setActiveClassSpy = jest
      .spyOn(scrollUtils, 'setActiveClass')
      .mockImplementation(() => {});

    const { unmount } = render(<FilterButton setShowFilters={jest.fn()} />);
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });
  it('calls setActiveClass on scroll when conditions are met', () => {
    // Set mobile screen width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    // Set scrollY to simulate scrolling past 50px
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 100,
    });

    // Mock router pathname as '/assets'
    (useRouter as jest.Mock).mockReturnValue({ pathname: '/assets' });

    // Force incomplete KYC
    jest
      .spyOn(hooks, 'useAppSelector')
      .mockReturnValue({ isFilteredKYCComplete: false });

    // Mock setActiveClass
    const setActiveClassSpy = jest
      .spyOn(scrollUtils, 'setActiveClass')
      .mockImplementation(() => {});

    // Render and simulate scroll
    render(<FilterButton setShowFilters={jest.fn()} />);
    const assetFilterButton = document.getElementById('assetFilterButton');

    fireEvent.scroll(window);

    expect(setActiveClassSpy).toHaveBeenCalledWith(
      assetFilterButton,
      true,
      'Active'
    );
  });
});
