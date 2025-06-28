import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TabSwitch from './TabSwitch';
import classes from './TabSwitch.module.css';

describe('TabSwitch Component', () => {
  const tabs = [
    { label: 'Tab 1', value: 'tab1', isDisabled: false },
    { label: 'Tab 2', value: 'tab2', isDisabled: false },
    { label: 'Tab 3', value: 'tab3', isDisabled: true }, // Disabled tab
  ];
  const activeTab = 'tab1';
  const mockSetActiveTab = jest.fn();

  beforeEach(() => {
    mockSetActiveTab.mockClear();
  });

  it('renders without crashing', () => {
    render(<TabSwitch tabs={tabs} activeTab={activeTab} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<TabSwitch tabs={tabs} activeTab={activeTab} />);
    tabs.forEach((tab) => {
      expect(screen.getByText(tab.label)).toBeInTheDocument();
    });
  });

  it('applies active class to the active tab', () => {
    render(<TabSwitch tabs={tabs} activeTab={activeTab} />);
    const activeTabElement = screen.getByText('Tab 1');
    expect(activeTabElement).toHaveClass(classes.ActiveTab);
  });

  it('calls setActiveTab when a non-disabled tab is clicked', () => {
    render(
      <TabSwitch
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={mockSetActiveTab}
      />
    );
    const tabElement = screen.getByText('Tab 2');
    fireEvent.click(tabElement);
    expect(mockSetActiveTab).toHaveBeenCalledWith('tab2');
  });

  it('does not call setActiveTab when a disabled tab is clicked', () => {
    render(
      <TabSwitch
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={mockSetActiveTab}
      />
    );
    const disabledTabElement = screen.getByText('Tab 3');
    fireEvent.click(disabledTabElement);
    expect(mockSetActiveTab).not.toHaveBeenCalled();
  });
  it('does not render anything if tabs array is empty', () => {
    const { container } = render(<TabSwitch tabs={[]} activeTab={activeTab} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies the correct styles to the wrapper', () => {
    render(<TabSwitch tabs={tabs} activeTab={activeTab} />);
    const wrapper = screen.getByTestId('tablist');
    expect(wrapper).toHaveAttribute('role', 'tablist');
  });

  it('applies the correct styles to the tabs', () => {
    render(<TabSwitch tabs={tabs} activeTab={activeTab} />);
    const tabElement = screen.getByText('Tab 1');
    expect(tabElement).toHaveClass(classes.Tab);
  });

  it('applies disabled class to disabled tabs', () => {
    render(<TabSwitch tabs={tabs} activeTab={activeTab} />);
    const disabledTabElement = screen.getByText('Tab 3');
    expect(disabledTabElement).toHaveClass(classes.Disabled);
  });
});
