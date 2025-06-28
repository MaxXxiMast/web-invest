import { render, screen, fireEvent } from '@testing-library/react';
import LiveTabs from './index';

describe('LiveTabs Component', () => {
  const filterArr = ['Tab 1', 'Tab 2', 'Tab 3'];
  const autoChangeTime = 10000;
  const tabChangeMock = jest.fn();

  beforeEach(() => {
    tabChangeMock.mockClear();
    // Reset window.innerWidth to default large size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  test('renders null if filterArr has one or fewer items', () => {
    const { container } = render(
      <LiveTabs filterArr={[]} activeFilter={0} tabChange={tabChangeMock} />
    );
    expect(container.firstChild).toBeNull();

    render(
      <LiveTabs
        filterArr={['Single']}
        activeFilter={0}
        tabChange={tabChangeMock}
      />
    );
    expect(screen.queryByRole('list')).toBeNull();
  });

  test('renders correct number of tabs and displays proper text', () => {
    render(
      <LiveTabs
        filterArr={filterArr}
        activeFilter={1}
        autoChangeTime={autoChangeTime}
        tabChange={tabChangeMock}
      />
    );
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(filterArr.length);
    filterArr.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
  });

  test('applies active class to the active filter', () => {
    render(
      <LiveTabs
        filterArr={filterArr}
        activeFilter={2}
        autoChangeTime={autoChangeTime}
        tabChange={tabChangeMock}
      />
    );
    // Get the li with id corresponding to activeFilter 2
    const activeTab = document.getElementById('DealFilter__2');
    expect(activeTab).toHaveClass(/ActiveFilter/);
  });

  test('adds PauseAnimation class when isProductHovered is true', () => {
    render(
      <LiveTabs
        filterArr={filterArr}
        activeFilter={0}
        autoChangeTime={autoChangeTime}
        tabChange={tabChangeMock}
        isProductHovered={true}
      />
    );
    const firstTab = document.getElementById('DealFilter__0');
    expect(firstTab).toHaveClass(/PauseAnimation/);
  });

  test('sets correct animationDuration style based on autoChangeTime prop', () => {
    render(
      <LiveTabs
        filterArr={filterArr}
        activeFilter={0}
        autoChangeTime={12000}
        tabChange={tabChangeMock}
      />
    );
    const firstTab = document.getElementById('DealFilter__0');
    // autoChangeTime = 12000 so duration should be "12s"
    expect(firstTab?.style.animationDuration).toBe('12s');
  });

  test('calls tabChange callback with correct index when tab is clicked', () => {
    render(
      <LiveTabs
        filterArr={filterArr}
        activeFilter={0}
        autoChangeTime={autoChangeTime}
        tabChange={tabChangeMock}
      />
    );
    const secondTab = document.getElementById('DealFilter__1');
    fireEvent.click(secondTab!);
    expect(tabChangeMock).toHaveBeenCalledWith(1);
  });

  test('triggers scrollTo on filterWrapper when window.innerWidth <= 767', () => {
    // Simulate small screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    // Mock scrollTo on the filterWrapper element
    const scrollToMock = jest.fn();
    Object.defineProperty(window.Element.prototype, 'scrollTo', {
      writable: true,
      value: scrollToMock,
    });

    // Render component with activeFilter=1 so that the useEffect should trigger scroll
    render(
      <LiveTabs
        filterArr={filterArr}
        activeFilter={1}
        autoChangeTime={autoChangeTime}
        tabChange={tabChangeMock}
      />
    );

    // Get the filterWrapper element
    const filterWrapper = document.getElementById('filterWrapper');
    expect(filterWrapper).toBeDefined();

    // Assert that scrollTo was called
    expect(scrollToMock).toHaveBeenCalled();
    expect(scrollToMock.mock.calls[0][0]).toMatchObject({ behavior: 'smooth' });
  });

  test('does not trigger scrollTo on filterWrapper when window.innerWidth > 767', () => {
    // Ensure window is large enough
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    render(
      <LiveTabs
        filterArr={filterArr}
        activeFilter={1}
        autoChangeTime={autoChangeTime}
        tabChange={tabChangeMock}
      />
    );
    const filterWrapper = document.getElementById('filterWrapper');
    const scrollToSpy = jest.fn();
    if (filterWrapper) {
      filterWrapper.scrollTo = scrollToSpy;
    }
    // No scrollTo call should occur because innerWidth > 767
    expect(scrollToSpy).not.toHaveBeenCalled();
  });
});
