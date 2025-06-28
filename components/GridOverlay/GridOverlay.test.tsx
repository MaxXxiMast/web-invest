import React from 'react';
import { render, screen } from '@testing-library/react';
import GridOverlay from './index';

// Mock CSS module
jest.mock('./GridOverlay.module.css', () => ({
  container: 'container',
  overlay: 'overlay',
  background: 'background',
  horizontalLine: 'horizontalLine',
  verticalLine: 'verticalLine',
}));

describe('GridOverlay', () => {
  test('renders without crashing', () => {
    render(<GridOverlay />);
    expect(
      screen.getAllByText((_, element) =>
        element.classList.contains('container')
      ).length
    ).toBe(2);
  });

  test('renders 100 horizontal lines with correct class', () => {
    render(<GridOverlay />);
    const horizontalLines = document.querySelectorAll('.horizontalLine');
    expect(horizontalLines.length).toBe(100);
  });

  test('renders 100 vertical lines with correct class', () => {
    render(<GridOverlay />);
    const verticalLines = document.querySelectorAll('.verticalLine');
    expect(verticalLines.length).toBe(100);
  });

  test('renders children correctly', () => {
    render(
      <GridOverlay>
        <p data-testid="child">Test Child</p>
      </GridOverlay>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  test('horizontal lines have incremental heights', () => {
    render(<GridOverlay />);
    const horizontalLines = document.querySelectorAll('.horizontalLine');
    horizontalLines.forEach((line, index) => {
      expect(line).toHaveStyle(`height: ${20 * (index + 1)}px`);
    });
  });

  test('vertical lines have incremental widths', () => {
    render(<GridOverlay />);
    const verticalLines = document.querySelectorAll('.verticalLine');
    verticalLines.forEach((line, index) => {
      expect(line).toHaveStyle(`width: ${20 * (index + 1)}px`);
    });
  });
});
