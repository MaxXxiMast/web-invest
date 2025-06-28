import { render, fireEvent } from '@testing-library/react';
import MenuToggle from './MenuToggle';

describe('MenuToggle Component', () => {
  test('renders MenuToggle component', () => {
    render(<MenuToggle />);
    const menuToggleElement = document.querySelector('.MenuToggle');
    expect(menuToggleElement).toBeInTheDocument();
    expect(menuToggleElement).toHaveClass('MenuToggle');
    expect(menuToggleElement).not.toHaveClass('ToggleMenu');
  });

  test('applies the active class when activeClass is true', () => {
    render(<MenuToggle activeClass={true} />);
    const menuToggleElement = document.querySelector('.MenuToggle');
    expect(menuToggleElement).toHaveClass('MenuToggle');
    expect(menuToggleElement).toHaveClass('ToggleMenu');
  });

  test('calls handleOnClick when clicked', () => {
    const mockHandleOnClick = jest.fn();
    render(<MenuToggle handleOnClick={mockHandleOnClick} />);
    
    const menuToggleElement = document.querySelector('.MenuToggle');
    fireEvent.click(menuToggleElement);
    
    expect(mockHandleOnClick).toHaveBeenCalledTimes(1);
  });

  test('uses default handleOnClick when not provided', () => {
    render(<MenuToggle />);
    
    const menuToggleElement = document.querySelector('.MenuToggle');
    expect(() => {
      fireEvent.click(menuToggleElement);
    }).not.toThrow();
  });
});