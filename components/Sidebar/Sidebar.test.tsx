import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './index';
import type { Tabs } from './types';

jest.mock('./Tab', () => {
  const MockTab = ({ tab, isActive, onClick }: any) => (
    <div data-testid="tab" data-active={isActive} onClick={onClick}>
      {tab.name}
    </div>
  );
  MockTab.displayName = 'MockTab';
  return MockTab;
});

describe('Sidebar Component', () => {
  const mockTabs: Tabs = [
    { id: 'tab1', name: 'Tab 1', count: 0 },
    { id: 'tab2', name: 'Tab 2', count: 5 },
  ];

  const setup = (propsOverride = {}) => {
    const props = {
      tabs: mockTabs,
      activeTabId: 'tab1',
      handleTabChange: jest.fn(),
      banner: <div data-testid="banner">Banner</div>,
      ...propsOverride,
    };

    render(<Sidebar {...props} />);
    return props;
  };

  test('renders all tabs', () => {
    setup();
    const tabs = screen.getAllByTestId('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent('Tab 1');
    expect(tabs[1]).toHaveTextContent('Tab 2');
  });

  test('marks the correct tab as active', () => {
    setup({ activeTabId: 'tab2' });
    const tabs = screen.getAllByTestId('tab');
    expect(tabs[0].dataset.active).toBe('false');
    expect(tabs[1].dataset.active).toBe('true');
  });

  test('calls handleTabChange when a tab is clicked', () => {
    const { handleTabChange } = setup();
    const tabs = screen.getAllByTestId('tab');
    fireEvent.click(tabs[1]);
    expect(handleTabChange).toHaveBeenCalledWith('tab2');
  });

  test('renders the banner if provided', () => {
    setup();
    expect(screen.getByTestId('banner')).toBeInTheDocument();
  });
});
