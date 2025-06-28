import { render, screen, fireEvent } from '@testing-library/react';
import Tab from './index';

// Mock styles
jest.mock('./MobileTabs.module.css', () => ({
  container: 'container',
  name: 'name',
  nameActive: 'nameActive',
  count: 'count',
  countActive: 'countActive',
  bottomLine: 'bottomLine',
  active: 'active',
}));

describe('Mobile Tab Component', () => {
  const tab = { id: 'tab1', name: 'Tab 1', count: 3 };

  test('renders tab name and count', () => {
    render(<Tab tab={tab} isActive={false} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('applies active styles when active', () => {
    render(<Tab tab={tab} isActive={true} />);
    expect(screen.getByText('Tab 1')).toHaveClass('nameActive');
    expect(screen.getByText('3')).toHaveClass('countActive');
    expect(screen.getByTestId('bottom-line')).toHaveClass('active');
  });

  test('applies inactive styles when not active', () => {
    render(<Tab tab={tab} isActive={false} />);
    expect(screen.getByText('Tab 1')).toHaveClass('name');
    expect(screen.getByText('3')).toHaveClass('count');
    expect(screen.getByTestId('bottom-line')).not.toHaveClass('active');
  });

  test('triggers onClick when clicked', () => {
    const mockClick = jest.fn();
    render(<Tab tab={tab} isActive={false} onClick={mockClick} />);
    fireEvent.click(screen.getByText('Tab 1'));
    expect(mockClick).toHaveBeenCalled();
  });
});
