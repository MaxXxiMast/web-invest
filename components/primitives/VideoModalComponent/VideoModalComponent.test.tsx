import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VideoModalComponent from './VideoModalComponent';
import { isMobile } from '../../../utils/resolution';

jest.mock('../../../utils/resolution', () => ({
  isMobile: jest.fn(),
}));

jest.mock('../VideoPlayerComponent/VideoPlayerComponent', () => {
  const MockVideoPlayer = () => <div>Mock Video Player</div>;
  MockVideoPlayer.displayName = 'MockVideoPlayerComponent';
  return MockVideoPlayer;
});

describe('VideoModalComponent', () => {
  const mockVideoLink = 'https://www.youtube.com/watch?v=12345';
  const mockHandleModalClose = jest.fn();

  it('renders VideoModalComponent with Dialog by default', () => {
    render(<VideoModalComponent videoLink={mockVideoLink} showModal={true} />);

    expect(screen.getByText(/Mock Video Player/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders as Drawer on mobile view', () => {
    (isMobile as jest.Mock).mockReturnValue(true);
    render(
      <VideoModalComponent
        videoLink={mockVideoLink}
        showModal={true}
        showasDrawerMobile={true}
      />
    );

    expect(screen.getByText('Mock Video Player')).toBeInTheDocument();
    expect(screen.queryByRole('presentation')).toBeInTheDocument();
  });

  it('does not render if videoLink is empty', () => {
    const { container } = render(
      <VideoModalComponent videoLink="" showModal={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('handles closing via backdrop click and escape key when closeOnOutsideClick is true', async () => {
    render(
      <VideoModalComponent
        videoLink={mockVideoLink}
        showModal={true}
        handleModalClose={mockHandleModalClose}
        closeOnOutsideClick={true}
      />
    );
    const backdrop = document.querySelector('.MuiBackdrop-root');
    fireEvent.click(backdrop);
    await waitFor(() => expect(mockHandleModalClose).toHaveBeenCalledTimes(1));
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(mockHandleModalClose).toHaveBeenCalledTimes(1));
  });

  it('passes autoPlayOnOpen to VideoPlayerComponent correctly', () => {
    render(
      <VideoModalComponent
        videoLink={mockVideoLink}
        showModal={true}
        autoPlayOnOpen={true}
      />
    );

    expect(screen.getByText('Mock Video Player')).toBeInTheDocument();
  });
  it('should close modal when close button is clicked', async () => {
    render(
      <VideoModalComponent
        videoLink={mockVideoLink}
        showModal={true}
        handleModalClose={mockHandleModalClose}
      />
    );

    const closeButton = screen.getByAltText('close-icon');
    fireEvent.click(closeButton);

    await waitFor(() => expect(mockHandleModalClose).toHaveBeenCalled());
  });
  it('renders video in Dialog component for desktop view', () => {
    (isMobile as jest.Mock).mockReturnValue(false);
    render(<VideoModalComponent videoLink={mockVideoLink} showModal={true} />);

    expect(screen.getByText('Mock Video Player')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not throw error if handleModalClose is undefined', () => {
    render(<VideoModalComponent videoLink={mockVideoLink} showModal={true} />);
    fireEvent.click(document.querySelector('.MuiBackdrop-root'));
    expect(screen.getByText('Mock Video Player')).toBeInTheDocument();
  });
});
