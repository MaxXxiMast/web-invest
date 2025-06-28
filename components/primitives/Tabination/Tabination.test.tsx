import { render, screen, fireEvent } from '@testing-library/react';
import Tabination from './Tabination';

describe('Tabination Component', () => {
  const mockTabs = ['Tab 1', 'Tab 2', 'Tab 3'];
  const mockHandleTabChange = jest.fn();

  const MockChildren = () => (
    <>
      <div tab-ele="Tab 1" data-testid="tab-content">
        Content 1
      </div>
      <div tab-ele="Tab 2" data-testid="tab-content">
        Content 2
      </div>
      <div tab-ele="Tab 3" data-testid="tab-content">
        Content 3
      </div>
    </>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tabs based on tabArr', () => {
    render(
      <Tabination
        tabArr={mockTabs}
        activeTab="Tab 1"
        handleTabChange={mockHandleTabChange}
      >
        <MockChildren />
      </Tabination>
    );

    mockTabs.forEach((tab) => {
      expect(screen.getByText(tab)).toBeInTheDocument();
    });
  });

  it('highlights the active tab', () => {
    render(
      <Tabination
        tabArr={mockTabs}
        activeTab="Tab 2"
        handleTabChange={mockHandleTabChange}
      >
        <MockChildren />
      </Tabination>
    );

    const activeTab = screen.getByText('Tab 2');
    expect(activeTab.classList.contains('active')).toBe(true);
  });

  it('calls handleTabChange when a tab is clicked', () => {
    render(
      <Tabination
        tabArr={mockTabs}
        activeTab="Tab 1"
        handleTabChange={mockHandleTabChange}
      >
        <MockChildren />
      </Tabination>
    );

    fireEvent.click(screen.getByText('Tab 3'));
    expect(mockHandleTabChange).toHaveBeenCalledWith('Tab 3');
  });

  it('renders only the content of the active tab', () => {
    render(
      <Tabination
        tabArr={mockTabs}
        activeTab="Tab 2"
        handleTabChange={mockHandleTabChange}
      >
        <MockChildren />
      </Tabination>
    );

    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('applies additional className and tabContentClass if provided', () => {
    const { container } = render(
      <Tabination
        tabArr={mockTabs}
        activeTab="Tab 1"
        className="custom-tab"
        tabContentClass="custom-content"
      >
        <MockChildren />
      </Tabination>
    );

    expect(container.querySelector('.custom-tab')).toBeInTheDocument();
    expect(container.querySelector('.custom-content')).toBeInTheDocument();
  });

  it('renders children directly if children is not an array', () => {
    render(
      <Tabination tabArr={mockTabs} activeTab="Tab 1">
        <div tab-ele="Tab 1">Single Child</div>
      </Tabination>
    );

    expect(screen.getByText('Single Child')).toBeInTheDocument();
  });

  it('renders nothing when tabArr is empty', () => {
    render(
      <Tabination tabArr={[]} activeTab="Tab 1">
        <MockChildren />
      </Tabination>
    );

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
