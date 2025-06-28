import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Timer from './index';

// Mock the handleExtraProps utility
jest.mock('../../../../../utils/string', () => ({
  handleExtraProps: jest.fn((className) => className),
}));

// Mock the CSS module
jest.mock('./Timer.module.css', () => ({
  timerContainer: 'timerContainer',
  timerText: 'timerText',
}));

describe('Timer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Timer />);
      
      expect(screen.getByText(/Fetching your details - 1:00 left/)).toBeInTheDocument();
    });

    it('should render with custom initial seconds', () => {
      render(<Timer initialSeconds={120} />);
      
      expect(screen.getByText(/Fetching your details - 2:00 left/)).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(<Timer className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('timerContainer', 'custom-class');
    });
  });

  describe('Timer Functionality', () => {
    it('should countdown every second when active', () => {
      render(<Timer initialSeconds={3} />);
      
      expect(screen.getByText(/Fetching your details - 0:03 left/)).toBeInTheDocument();
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText(/Fetching your details - 0:02 left/)).toBeInTheDocument();
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText(/Fetching your details - 0:01 left/)).toBeInTheDocument();
    });

    it('should call onComplete when timer reaches zero', () => {
      const onComplete = jest.fn();
      render(<Timer initialSeconds={2} onComplete={onComplete} />);
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not countdown when isActive is false', () => {
      render(<Timer initialSeconds={3} isActive={false} />);
      
      expect(screen.getByText(/Fetching your details - 0:03 left/)).toBeInTheDocument();
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      expect(screen.getByText(/Fetching your details - 0:03 left/)).toBeInTheDocument();
    });

    it('should not call onComplete when isActive is false', () => {
      const onComplete = jest.fn();
      render(<Timer initialSeconds={2} onComplete={onComplete} isActive={false} />);
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should handle zero initial seconds correctly', () => {
      const onComplete = jest.fn();
      render(<Timer initialSeconds={0} onComplete={onComplete} />);
      
      expect(screen.getByText(/Fetching your details - 0:00 left/)).toBeInTheDocument();
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should handle negative initial seconds', () => {
      const onComplete = jest.fn();
      render(<Timer initialSeconds={-5} onComplete={onComplete} />);
      
      expect(screen.getByText(/Fetching your details - -1:-5 left/)).toBeInTheDocument();
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Timer State Changes', () => {
    it('should start countdown when isActive changes from false to true', () => {
      const { rerender } = render(<Timer initialSeconds={3} isActive={false} />);
      
      expect(screen.getByText(/Fetching your details - 0:03 left/)).toBeInTheDocument();
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      expect(screen.getByText(/Fetching your details - 0:03 left/)).toBeInTheDocument();
      
      rerender(<Timer initialSeconds={3} isActive={true} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText(/Fetching your details - 0:02 left/)).toBeInTheDocument();
    });

    it('should stop countdown when isActive changes from true to false', () => {
      const { rerender } = render(<Timer initialSeconds={3} isActive={true} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText(/Fetching your details - 0:02 left/)).toBeInTheDocument();
      
      rerender(<Timer initialSeconds={3} isActive={false} />);
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      expect(screen.getByText(/Fetching your details - 0:02 left/)).toBeInTheDocument();
    });

    it('should not reset timer when initialSeconds prop changes', () => {
      const { rerender } = render(<Timer initialSeconds={3} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText(/Fetching your details - 0:02 left/)).toBeInTheDocument();
      
      rerender(<Timer initialSeconds={5} />);
      
      expect(screen.getByText(/Fetching your details - 0:02 left/)).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should clear interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const { unmount } = render(<Timer initialSeconds={3} />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('should clear previous interval when dependencies change', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const { rerender } = render(<Timer initialSeconds={3} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      rerender(<Timer initialSeconds={3} isActive={false} />);
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large initial seconds', () => {
      render(<Timer initialSeconds={3600} />);
      
      expect(screen.getByText(/Fetching your details - 60:00 left/)).toBeInTheDocument();
    });

    it('should handle decimal initial seconds', () => {
      render(<Timer initialSeconds={3.7} />);
      
      expect(screen.getByText(/Fetching your details - 0:3.7 left/)).toBeInTheDocument();
    });

    it('should handle onComplete being undefined', () => {
      expect(() => {
        render(<Timer initialSeconds={1} onComplete={undefined} />);
        
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });

    it('should handle multiple rapid isActive changes', () => {
      const { rerender } = render(<Timer initialSeconds={3} isActive={true} />);
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      rerender(<Timer initialSeconds={3} isActive={false} />);
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      rerender(<Timer initialSeconds={3} isActive={true} />);
      
      expect(screen.getByText(/Fetching your details - 0:03 left/)).toBeInTheDocument();
    });
  });
}); 