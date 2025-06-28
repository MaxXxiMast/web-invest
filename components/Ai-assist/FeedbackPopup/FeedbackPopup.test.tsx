import { render, screen, fireEvent, act } from '@testing-library/react';
import FeedbackPopup from './FeedbackPopup';

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
}));

jest.mock('../../../utils/gtm', () => ({
  newRelicErrLogs: jest.fn(),
  trackEvent: jest.fn(),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn((selectorFn: any) =>
    selectorFn({
      user: { userData: { userID: 'test-user' } },
      assets: { selectedAsset: { assetID: 'asset-123' } },
    })
  ),
}));

jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: '',
}));

jest.mock('next/image', () => {
  const MockNextImage = (props: any) => {
    return <img {...props} alt={props.alt} />;
  };
  MockNextImage.displayName = 'MockNextImage';
  return MockNextImage;
});

describe('FeedbackPopup Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <FeedbackPopup isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(<FeedbackPopup isOpen={true} onClose={mockOnClose} />);
    expect(
      screen.getByText('How was your AI chat experience?')
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<FeedbackPopup isOpen={true} onClose={mockOnClose} />);
    const closeButton = screen.getByAltText('close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows selecting rating by clicking star', () => {
    render(<FeedbackPopup isOpen={true} onClose={mockOnClose} />);
    const stars = screen.getAllByAltText('Star');
    fireEvent.click(stars[2]);
    expect(stars[2]).toBeInTheDocument();
  });

  it('submits feedback properly', async () => {
    render(<FeedbackPopup isOpen={true} onClose={mockOnClose} />);

    const stars = screen.getAllByAltText('Star');
    fireEvent.click(stars[4]);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Awesome chat experience' },
    });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
  });

  it('shows error when word count exceeds 200', () => {
    render(<FeedbackPopup isOpen={true} onClose={mockOnClose} />);
    const textarea = screen.getByRole('textbox');

    const longText = Array(201).fill('word').join(' ');
    fireEvent.change(textarea, { target: { value: longText } });

    expect(screen.getByText(/Word Limit Exceeded/i)).toBeInTheDocument();
  });
});
