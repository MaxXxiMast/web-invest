import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button, { ButtonType } from '.';
import btnStyles from './Button.module.css';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  //Test Case 1:
  test('display the correct text inside the button', () => {
    render(<Button>Press Here</Button>);
    const buttonElement = screen.getByText(/Press Here/i);
    expect(buttonElement).toBeInTheDocument();
  });

  //Test Case 2:
  test('applies proper style based on button variants', () => {
    const { rerender } = render(
      <Button variant={ButtonType.Primary}>Submit</Button>
    );
    const primaryButton = screen.getByRole('button', { name: /Submit/i });
    expect(primaryButton).toHaveClass(btnStyles.primaryButton);

    rerender(<Button variant={ButtonType.Secondary}>Cancel</Button>);
    const secondaryButton = screen.getByRole('button', { name: /Cancel/i });
    expect(secondaryButton).toHaveClass(btnStyles.secondaryButton);

    rerender(<Button variant={ButtonType.Disabled}>Disable</Button>);
    const disabledButton = screen.getByRole('button', { name: /Disable/i });
    expect(disabledButton).toHaveClass(btnStyles.disabledButton);
  });

  //Test Case 3:
  test('disable the button when "disabled" prop is passed', () => {
    render(<Button disabled> Unavailable </Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
  });

  //Test Case 4:
  test('execute onClick when button is click', () => {
    const onClickMock = jest.fn();
    render(<Button onClick={onClickMock}>Click me </Button>);
    const buttonElement = screen.getByText(/Click me/i);
    fireEvent.click(buttonElement);
    expect(onClickMock).toHaveBeenCalled();
  });

  //Test Case 5:
  test('prevents onClick when button is disabled', () => {
    const onClickMock = jest.fn();
    render(
      <Button onClick={onClickMock} disabled>
        Do Not Click
      </Button>
    );
    const buttonElement = screen.getByText(/Do Not Click/i);
    fireEvent.click(buttonElement);
    expect(onClickMock).not.toHaveBeenCalled();
  });

  //Test Case 6:
  test('display a loading spinner when isLoading is true', () => {
    render(<Button isLoading>Loading...</Button>);
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  //Test Case 7:
  test('applying custom width when width prop is passes', () => {
    render(<Button width={100}>Custom Width Button</Button>);
    const buttonElement = screen.getByRole('button', {
      name: /Custom Width Button/i,
    });
    expect(buttonElement).toHaveStyle({ width: '100px' });
  });

  //Test Case 8:
  test('triggers onKeyDown event when any key is pressed', () => {
    const onKeyDownMock = jest.fn();
    render(<Button onKeyDown={onKeyDownMock}>Press Enter</Button>);
    const buttonElement = screen.getByText(/Press Enter/i);
    fireEvent.keyDown(buttonElement, { key: 'Enter' });
    expect(onKeyDownMock).toHaveBeenCalled();
  });

  //Test Case 9:
  test('renders with role="button"', () => {
    render(<Button>Accessible Button</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeInTheDocument();
  });

  //Test Case 10:
  test('renders with isLoading and disabled simultaneously', () => {
    render(
      <Button disabled isLoading>
        Loading Button
      </Button>
    );
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  //Test Case 11:
  test('calls onClick with correct buttonId when clicked', () => {
    const onClickMock = jest.fn();
    render(
      <Button id="test-id" onClick={onClickMock}>
        Click Me
      </Button>
    );
    const buttonElement = screen.getByText(/Click Me/i);
    fireEvent.click(buttonElement);
    expect(onClickMock).toHaveBeenCalledWith({ buttonId: 'test-id' });
  });
});
