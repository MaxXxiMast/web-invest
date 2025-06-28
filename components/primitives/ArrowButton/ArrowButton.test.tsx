import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArrowButton from '.';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

import { useRouter } from 'next/router';

describe('ArrowButton', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  test('renders children correctly', () => {
    render(<ArrowButton>Test Button</ArrowButton>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('ArrowButton');
  });

  test('applies custom class name when provided', () => {
    render(<ArrowButton className="custom-class">Test Button</ArrowButton>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  test('applies correct class for button without bottom line', () => {
    render(<ArrowButton hideBottomLine>Test Button</ArrowButton>);
    expect(screen.getByRole('button')).toHaveClass('ArrowButtonWOLine');
    expect(screen.getByRole('button')).not.toHaveClass('ArrowButton');
  });

  test('applies animated arrow class when isAnimatedArrow is true', () => {
    render(<ArrowButton isAnimatedArrow>Test Button</ArrowButton>);
    expect(screen.getByRole('button')).toHaveClass('AnimatedArrow');
  });

  test('sets custom id when provided', () => {
    render(<ArrowButton id="custom-id">Test Button</ArrowButton>);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'custom-id');
  });

  test('applies arrow rotation style when angle is provided', () => {
    render(<ArrowButton ArrowrotateAngle="90">Test Button</ArrowButton>);
    const arrowElement = screen
      .getByRole('button')
      .querySelector(`.ButtonImage`);
    expect(arrowElement).toHaveStyle('transform: rotate(90deg)');
  });

  test('calls onClick handler when button is clicked', () => {
    const handleClick = jest.fn();
    render(<ArrowButton onClick={handleClick}>Test Button</ArrowButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('navigates to clickUrl when provided', () => {
    render(<ArrowButton clickUrl="/test-url">Test Button</ArrowButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(mockRouter.push).toHaveBeenCalledWith('/test-url');
  });

  test('prioritizes clickUrl over onClick when both are provided', () => {
    const handleClick = jest.fn();
    render(
      <ArrowButton onClick={handleClick} clickUrl="/test-url">
        Test Button
      </ArrowButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockRouter.push).toHaveBeenCalledWith('/test-url');
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('renders arrow icon correctly', () => {
    render(<ArrowButton>Test Button</ArrowButton>);
    expect(
      screen.getByRole('button').querySelector('.icon-arrow-right-semi-circle')
    ).toBeInTheDocument();
  });
});
