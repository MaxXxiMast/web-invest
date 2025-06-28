import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import CommentBoxForm from './index';

// Mocks
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/user-kyc',
    push: jest.fn(),
  }),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn((selectorFn: any) =>
    selectorFn({
      user: { userData: { userID: 'test-user-id' } },
      gcConfig: { gcData: { gcCallbackUrl: '/discover' } },
    })
  ),
}));

jest.mock('../../../api/user', () => ({
  addComment: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('../../../api/strapi', () => ({
  callErrorToast: jest.fn(),
  processError: jest.fn((err) => err),
}));

jest.mock('../utils', () => ({
  defaultOptions: [
    { value: 'issue1', label: 'Issue 1' },
    { value: 'issue2', label: 'Issue 2' },
  ],
  handleRedirection: (url: string) => url,
  maxLengthComment: 200,
}));

describe('CommentBoxForm Component', () => {
  const mockOnSuccessSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('disables submit button when form is empty', () => {
    render(<CommentBoxForm type="" onSuccessSubmit={mockOnSuccessSubmit} />);
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is filled', () => {
    render(
      <CommentBoxForm type="issue1" onSuccessSubmit={mockOnSuccessSubmit} />
    );
    const textarea = screen.getByLabelText('Type your issue here');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    const submitButton = screen.getByText('Submit') as HTMLButtonElement;
    expect(submitButton).not.toBeDisabled();
  });

  it('submits form successfully', async () => {
    render(
      <CommentBoxForm type="issue1" onSuccessSubmit={mockOnSuccessSubmit} />
    );

    const textarea = screen.getByLabelText('Type your issue here');
    fireEvent.change(textarea, { target: { value: 'Valid comment' } });

    const submitButton = screen.getByText('Submit');

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockOnSuccessSubmit).toHaveBeenCalledWith({
        type: 'issue1',
        comment: 'Valid comment',
      });
    });
  });

  it('calls trackEvent and redirects on skip', async () => {
    render(
      <CommentBoxForm type="issue1" onSuccessSubmit={mockOnSuccessSubmit} />
    );

    const skipButton = screen.getByText('Skip');

    await act(async () => {
      fireEvent.click(skipButton);
    });
    const { trackEvent } = require('../../../utils/gtm');
    expect(trackEvent).toHaveBeenCalledWith('Close_skip', expect.any(Object));
  });

  it('shows character limit message correctly', () => {
    render(
      <CommentBoxForm type="issue1" onSuccessSubmit={mockOnSuccessSubmit} />
    );
    const textarea = screen.getByLabelText('Type your issue here');
    fireEvent.change(textarea, { target: { value: 'A'.repeat(200) } });

    expect(screen.getByText('Character limit reached')).toBeInTheDocument();
  });

  it('does not allow typing beyond character limit', () => {
    render(
      <CommentBoxForm type="issue1" onSuccessSubmit={mockOnSuccessSubmit} />
    );
    const textarea = screen.getByLabelText('Type your issue here');

    fireEvent.change(textarea, { target: { value: 'A'.repeat(201) } });

    expect(textarea).toHaveValue('');
  });
  it('shows characters left when within the limit', () => {
    render(
      <CommentBoxForm type="issue1" onSuccessSubmit={mockOnSuccessSubmit} />
    );
    const textarea = screen.getByLabelText('Type your issue here');
    fireEvent.change(textarea, { target: { value: '12345' } });

    expect(screen.getByText(/character.*left/i)).toBeInTheDocument();
  });
});
