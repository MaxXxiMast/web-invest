import { render, screen, fireEvent } from '@testing-library/react';
import MobileTabs from './index';

// Mock styles
jest.mock('./MobileTabs.module.css', () => ({
  container: 'container',
}));

// Mock Tab component
jest.mock('./Tab', () => {
  const MockTab = ({ tab, isActive, onClick }: any) => (
    <button
      data-testid="tab"
      data-active={isActive}
      onClick={onClick}
      disabled={tab.count === 0}
    >
      {tab.name} ({tab.count})
    </button>
  );
  MockTab.displayName = 'MockTab';
  return MockTab;
});

// Sample tabs
const tabs = [
  { id: 'tab1', name: 'Tab 1', count: 5 },
  { id: 'tab2', name: 'Tab 2', count: 0 },
  { id: 'tab3', name: 'Tab 3', count: 2 },
];

describe('MobileTabs Component', () => {
  test('renders only non-zero count tabs by default', () => {
    render(
      <MobileTabs tabs={tabs} activeTabId="tab1" handleTabChange={() => {}} />
    );

    const renderedTabs = screen.getAllByTestId('tab');
    expect(renderedTabs).toHaveLength(2); // tab2 should be hidden
    expect(screen.queryByText(/Tab 2/)).not.toBeInTheDocument();
  });

  test('renders all tabs when hideZeroCountTabs is false', () => {
    render(
      <MobileTabs
        tabs={tabs}
        activeTabId="tab1"
        handleTabChange={() => {}}
        hideZeroCountTabs={false}
      />
    );

    const renderedTabs = screen.getAllByTestId('tab');
    expect(renderedTabs).toHaveLength(3);
    expect(screen.getByText(/Tab 2/)).toBeInTheDocument();
  });

  test('does not render anything if fewer than 2 tabs with count > 0', () => {
    const singleTab = [{ id: 'only', name: 'Only', count: 1 }];
    const { container } = render(
      <MobileTabs
        tabs={singleTab}
        activeTabId="only"
        handleTabChange={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('marks the correct tab as active', () => {
    render(
      <MobileTabs tabs={tabs} activeTabId="tab3" handleTabChange={() => {}} />
    );
    const tabButtons = screen.getAllByTestId('tab');
    const activeTab = tabButtons.find((btn) => btn.dataset.active === 'true');
    expect(activeTab).toHaveTextContent('Tab 3');
  });

  test('triggers handleTabChange when a tab is clicked', () => {
    const mockHandler = jest.fn();
    render(
      <MobileTabs
        tabs={tabs}
        activeTabId="tab1"
        handleTabChange={mockHandler}
      />
    );
    fireEvent.click(screen.getByText(/Tab 3/));
    expect(mockHandler).toHaveBeenCalledWith('tab3');
  });
});
