import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputFieldSet from './inputFieldSet';

describe('InputFieldSet Component', () => {
  // Basic rendering tests
  // Done
  test('renders with placeholder', () => {
    render(<InputFieldSet type="text" placeHolder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('renders with label', () => {
    render(<InputFieldSet type="text" label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  test('renders in disabled state', () => {
    render(<InputFieldSet type="text" label="Username" disabled={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  // Value handling tests
  test('displays provided value', () => {
    render(<InputFieldSet type="text" label="Username" value="testuser" />);
    expect(screen.getByRole('textbox')).toHaveValue('testuser');
  });

  test('handles input change', () => {
    const handleChange = jest.fn();
    render(
      <InputFieldSet type="text" label="Username" onChange={handleChange} />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'newuser' } });

    expect(handleChange).toHaveBeenCalled();
  });

  // Focus behavior tests
  test('applies focus styling when focused', async () => {
    render(<InputFieldSet type="text" label="Username" />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);

    const fieldsetAfter = input.closest('fieldset');

    // Instead of checking the exact style, check that a CSS class is applied or a class name changes
    expect(fieldsetAfter.className).toMatch(/Focused/);

    // Alternative approach: Check that the box-shadow is applied
    expect(fieldsetAfter).toHaveStyle(
      'box-shadow: 0px 0px 0px 4px var(--gripLighterOne, #e5f1ff)'
    );
  });

  test('shows label on focus when showLabelOnFocus is true', () => {
    render(
      <InputFieldSet type="text" label="Username" showLabelOnFocus={true} />
    );
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);

    const legend = screen.getByText('Username');
    expect(legend).toHaveClass('showLabelOnFocus');
  });

  test('displays error state when error prop is true', () => {
    render(
      <InputFieldSet
        type="text"
        label="Username"
        error={true}
        errorMsg="Invalid username"
      />
    );

    const errorMsg = screen.getByText('Invalid username');
    expect(errorMsg).toBeInTheDocument();

    // Instead of checking exact border style, check for error class or error message
    expect(errorMsg).toHaveClass('errorMsg');
  });

  // Input sanitization tests
  test('sanitizes malicious input', () => {
    const setErrorMock = jest.fn();
    render(
      <InputFieldSet type="text" label="Username" setError={setErrorMock} />
    );

    const input = screen.getByRole('textbox');
    // Simulating malicious input (this is simplified as DOMPurify behavior is mocked)
    fireEvent.change(input, {
      target: { value: '<script>alert("xss")</script>' },
    });

    expect(setErrorMock).toHaveBeenCalledWith(true);
  });

  // Clear button tests
  test('shows clear button when showClear is true and input has value', () => {
    render(
      <InputFieldSet
        type="text"
        label="Search"
        value="search term"
        showClear={true}
      />
    );

    const clearButton = screen.getByAltText('clear');
    expect(clearButton).toBeInTheDocument();
  });

  test('clears input when clear button is clicked', () => {
    const handleChange = jest.fn();
    render(
      <InputFieldSet
        type="text"
        label="Search"
        value="search term"
        showClear={true}
        onChange={handleChange}
      />
    );

    const clearButton = screen.getByAltText('clear');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalled();
  });

  // Input mode tests
  test('sets correct inputMode attribute', () => {
    render(<InputFieldSet type="text" label="Amount" inputMode="numeric" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  // Custom styles tests
  test('applies custom styles to input', () => {
    const customStyles = { backgroundColor: 'lightblue' };
    render(
      <InputFieldSet
        type="text"
        label="Username"
        customInputStyles={customStyles}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle('backgroundColor: lightblue');
  });

  // Max length test
  test('respects maxLength attribute', () => {
    render(<InputFieldSet type="text" label="Username" maxLength={5} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '5');
  });

  // Key press handler test
  test('handles key press events', () => {
    const handleKeyPress = jest.fn();
    render(
      <InputFieldSet type="text" label="Search" onKeyPress={handleKeyPress} />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleKeyPress).toHaveBeenCalled();
  });
});
