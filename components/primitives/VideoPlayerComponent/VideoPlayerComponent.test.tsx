import { render, screen, fireEvent } from '@testing-library/react';
import VideoPlayerComponent from './VideoPlayerComponent';
import ReactPlayer from 'react-player';

jest.mock('react-player', () => {
  const MockReactPlayer = jest.fn((props) => (
    <div>
      Mock React Player
      <button onClick={props.onPlay}>Play</button>
    </div>
  ));
  Object.defineProperty(MockReactPlayer, 'displayName', {
    value: 'MockReactPlayer',
  });
  return MockReactPlayer;
});

describe('VideoPlayerComponent', () => {
  const mockVideoLink = 'https://www.youtube.com/watch?v=abc123';

  it('renders VideoPlayerComponent with default props', () => {
    render(<VideoPlayerComponent videoLink={mockVideoLink} />);
    expect(screen.getByText('Mock React Player')).toBeInTheDocument();

    expect(ReactPlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        height: 200,
      }),
      {}
    );
  });

  it('does not render when videoLink is empty', () => {
    const { container } = render(<VideoPlayerComponent videoLink="" />);
    expect(container.firstChild).toBeNull();
  });
  it('check visibilty of play button', () => {
    render(<VideoPlayerComponent videoLink={mockVideoLink} autoPlay={true} />);
    const playButton = screen.getByText('Play');
    fireEvent.click(playButton);

    expect(playButton).toBeInTheDocument();
  });

  it('adjusts the height based on the provided height prop', () => {
    render(<VideoPlayerComponent videoLink={mockVideoLink} height={300} />);
    expect(ReactPlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        height: 300,
      }),
      {}
    );
  });

  it('does not render if videoLink contains only whitespace', () => {
    const { container } = render(<VideoPlayerComponent videoLink="   " />);
    expect(container.firstChild).toBeNull();
  });
});
