import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DelayTextChange from '.';

// Mock styles
jest.mock('./DelayTextChange.module.css', () => ({
  text: 'mock-text-class',
}));

describe('DelayTextChange', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('renders null when dataArr is empty', () => {
    const { container } = render(<DelayTextChange dataArr={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders first item in dataArr initially', () => {
    render(<DelayTextChange dataArr={['First', 'Second', 'Third']} />);
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  test('applies the correct CSS class', () => {
    render(<DelayTextChange dataArr={['Test']} />);
    expect(screen.getByText('Test')).toHaveClass('mock-text-class');
  });

  test('cycles through items with default interval (5 seconds)', () => {
    render(<DelayTextChange dataArr={['First', 'Second', 'Third']} />);
    expect(screen.getByText('First')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Second')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Third')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  test('cycles through items with custom interval', () => {
    render(<DelayTextChange dataArr={['First', 'Second']} seconds={2} />);
    expect(screen.getByText('First')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Second')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  test('cleans up interval on unmount', () => {
    const { unmount } = render(<DelayTextChange dataArr={['Test']} />);

    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  test('handles single item array without errors', () => {
    render(<DelayTextChange dataArr={['Only Item']} />);
    expect(screen.getByText('Only Item')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Only Item')).toBeInTheDocument();
  });
});
