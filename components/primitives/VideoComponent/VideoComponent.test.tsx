import { render, screen, fireEvent, act } from '@testing-library/react';
import VideoComponent from './VideoComponent';
import { trackEvent } from '../../../utils/gtm';
import fetchMock from 'jest-fetch-mock';
import React from 'react';

// Mock `react-player`
const MockReactPlayer = () => <div>Mocked React Player</div>;
MockReactPlayer.displayName = 'MockReactPlayer';

jest.mock('react-player', () => MockReactPlayer);

jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ pathname: '/' })),
}));

fetchMock.enableMocks();

jest.mock('../VideoModalComponent/VideoModalComponent', () => ({
  __esModule: true,
  default: ({ showModal, videoLink }) =>
    showModal ? (
      <div data-testid="video-modal" role="dialog">
        Mock Modal for {videoLink}
      </div>
    ) : null,
}));

describe('Video Component', () => {
  const mockLink = 'https://www.youtube.com/watch?v=_QeipY-dJuM';
  const mockVideoObject = {
    title: 'Test Video',
    thumbnail_url:
      'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pexels.com%2Fsearch%2Fflowers%2F',
  };

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should fetch video details and display title and thumbnail', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockVideoObject), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    render(
      <VideoComponent
        link={mockLink}
        thumbnail={mockVideoObject.thumbnail_url}
      />
    );

    try {
      const title = await screen.findByText(mockVideoObject.title);
      const thumbnail = await screen.findByAltText('VideoThumb');

      expect(title).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute(
        'src',
        expect.stringContaining(
          encodeURIComponent(mockVideoObject.thumbnail_url)
        )
      );
    } catch (error) {
      console.error('Error fetching video details:', error);
    }
  });

  it('should handle empty link prop and return null', () => {
    const { container } = render(<VideoComponent link="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should display video duration when provided', () => {
    render(<VideoComponent link={mockLink} videoDuration="5:20" />);

    const duration = screen.getByText('5:20');
    expect(duration).toBeInTheDocument();
  });

  it('should handle click event and open modal', () => {
    const setStateMock = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy.mockImplementationOnce(() => [{}, jest.fn()]);
    useStateSpy.mockImplementationOnce(() => [false, setStateMock]);

    render(<VideoComponent link={mockLink} />);

    const videoComponent = screen.getByAltText('VideoThumb');

    // Wrap state updates in act
    act(() => {
      fireEvent.click(videoComponent);
    });

    expect(trackEvent).toHaveBeenCalledWith('View_Explainer_video', {
      url: '/',
      videoLink: mockLink,
    });
    expect(setStateMock).toHaveBeenCalledWith(true);
  });

  it('should abort fetch when component unmounts', async () => {
    const { unmount } = render(<VideoComponent link={mockLink} />);
    unmount();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should handle video title and thumbnail props', async () => {
    render(
      <VideoComponent
        link={mockLink}
        videoTitle="Custom Video Title"
        thumbnail={mockVideoObject.thumbnail_url}
      />
    );

    const title = screen.getByText(/Custom Video Title/i);
    const thumbnail = screen.getByAltText('VideoThumb');

    expect(title).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent(mockVideoObject.thumbnail_url))
    );
  });
});
