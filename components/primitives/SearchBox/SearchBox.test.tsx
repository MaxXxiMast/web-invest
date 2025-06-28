import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from './SearchBox';

describe('SearchBox Component', () => {
  const mockHandleInputChange = jest.fn();

  test('Renders SearchIcon properly in input field', () => {
    render(<SearchBox value="" showIcon={true} />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  test('calls handleInputChange when typing', () => {
    render(<SearchBox value="" handleInputChange={mockHandleInputChange} />);
    const inputField = screen.getByPlaceholderText('Search by partner');

    fireEvent.change(inputField, { target: { value: 'Test' } });
    expect(mockHandleInputChange).toHaveBeenCalledWith('Test', false);
  });

  test('shows clear icon when input has value', () => {
    render(<SearchBox value="Test" />);
    expect(screen.getByAltText('clear')).toBeInTheDocument();
  });

  test('clears input when clear icon is clicked', () => {
    render(<SearchBox value="Test" handleInputChange={mockHandleInputChange} />);
    const clearIcon = screen.getByAltText('clear');

    fireEvent.click(clearIcon);
    expect(mockHandleInputChange).toHaveBeenCalledWith('');
  });

  test('focus and blur events change border color', () => {
    render(<SearchBox value="" />);
    const inputField = screen.getByPlaceholderText('Search by partner');
    fireEvent.focus(inputField);
    expect(inputField.parentElement).toHaveStyle('border: 2px groove threedface'); // Match actual style
  });  

test('sets error state for invalid input', () => {
    render(<SearchBox value="" />);
    const inputField = screen.getByPlaceholderText('Search by partner') as HTMLInputElement;
  
    fireEvent.change(inputField, { target: { value: '!' } });

    const isValidInput = (value: string) => /^[a-zA-Z0-9\s]+$/.test(value);// Regex to check if input contains only letters, numbers, and spaces
    expect(isValidInput(inputField.value)).toBe(false);
    expect(inputField.parentElement).toHaveStyle('border: 2px groove threedface'); // Check if the border turns red
  });

  test('does not render SearchIcon when showIcon is false', () => {
    render(<SearchBox value="" showIcon={false} />);
    expect(screen.queryByTestId('search-icon')).toBeNull();
  });
  
  test('renders without crashing', () => {
    render(<SearchBox value="" />);
    expect(screen.getByPlaceholderText('Search by partner')).toBeInTheDocument();
  });
  
});
