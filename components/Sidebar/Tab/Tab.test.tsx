import { render, screen, fireEvent } from '@testing-library/react';
import Tab from './index';
import type { Tab as TabType } from '../types';

// Mock CSS Modules
jest.mock('./Sidebar.module.css', () => ({
  container: 'container',
  containerActive: 'containerActive',
  name: 'name',
  nameActive: 'nameActive',
  count: 'count',
}));

describe('Tab Component', () => {
  const mockTab: TabType = {
    id: 'tab1',
    name: 'Overview',
    count: 5,
  };

  test('renders tab name and count', () => {
    render(<Tab tab={mockTab} isActive={false} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('applies active styles when isActive is true', () => {
    const { container } = render(<Tab tab={mockTab} isActive />);
    expect(container.querySelector('button')?.className).toContain(
      'containerActive'
    );
    expect(container.querySelector('span')?.className).toBe('nameActive');
  });

  test('applies inactive styles when isActive is false', () => {
    const { container } = render(<Tab tab={mockTab} isActive={false} />);
    expect(container.querySelector('button')?.className).toContain('container');
    expect(container.querySelector('span')?.className).toBe('name');
  });

  test('calls onClick when clicked and count > 0', () => {
    const handleClick = jest.fn();
    render(<Tab tab={mockTab} isActive={false} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
