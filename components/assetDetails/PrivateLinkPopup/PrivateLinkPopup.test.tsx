import { render, screen, waitFor } from '@testing-library/react';
import PrivateLinkPopup from '.';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

jest.mock('../../primitives/Image', () => {
  return function MockImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img data-testid="mock-image" src={src} alt={alt} />;
  };
});

jest.mock('../../primitives/MaterialModalPopup', () => {
  return function MockModal({
    children,
    showModal,
  }: {
    children: React.ReactNode;
    showModal: boolean;
  }) {
    return showModal ? <div data-testid="modal">{children}</div> : null;
  };
});

describe('PrivateLinkPopup', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders nothing when open is false', () => {
    render(<PrivateLinkPopup open={false} onClose={() => {}} />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders correctly when open is true', () => {
    render(<PrivateLinkPopup open={true} onClose={() => {}} />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('mock-image')).toHaveAttribute(
      'src',
      `${GRIP_INVEST_BUCKET_URL}new-website/sdi/delete_modal.svg`
    );
    expect(screen.getByTestId('mock-image')).toHaveAttribute(
      'alt',
      'delete modal'
    );
    expect(
      screen.getByText(
        'This is a private link and cannot be accessed directly.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Redirecting you in 5...')).toBeInTheDocument();
  });

  it('counts down from 5 to 0 and calls onClose', async () => {
    const mockOnClose = jest.fn();
    render(<PrivateLinkPopup open={true} onClose={mockOnClose} />);

    // Initial state
    expect(screen.getByText('Redirecting you in 5...')).toBeInTheDocument();

    // Advance timers and check countdown
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText('Redirecting you in 4...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText('Redirecting you in 3...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText('Redirecting you in 2...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText('Redirecting you in 1...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('does not start timer when modal is not open', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    render(<PrivateLinkPopup open={false} onClose={() => {}} />);

    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = render(
      <PrivateLinkPopup open={true} onClose={() => {}} />
    );

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
