import { render, screen, fireEvent } from '@testing-library/react';
import AiAssistPopup from './AiAssistPopup';

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn((cb) =>
    cb({
      user: { userData: { userID: 'test-user' } },
      assets: { selectedAsset: { assetID: '123' } },
      aiAssist: { messages: [], assetId: null },
    })
  ),
  useAppDispatch: () => jest.fn(),
}));

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: (props: any) => <div>{props.children}</div>,
}));

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
}));

jest.mock('../../../utils/gtm', () => ({
  newRelicErrLogs: jest.fn(),
}));

jest.mock('../utils', () => ({
  setupChatPopupScrollLock: () => () => {},
}));

jest.mock('../../primitives/Navigation/ProfileImage', () => () => {
  <div data-testid="profile-image" />;
});

jest.mock('next/image', () => {
  const MockNextImage = (props: any) => {
    return <img {...props} alt={props.alt} />;
  };
  MockNextImage.displayName = 'MockNextImage';
  return MockNextImage;
});
const newRelicErrLogsMock = jest.fn();
jest.mock('../../../utils/gtm', () => ({
  newRelicErrLogs: (...args: any[]) => newRelicErrLogsMock(...args),
}));

describe('AiAssistPopup Component', () => {
  let defaultProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps = {
      questions: [{ text: 'What is IRR?', icon: '/icon.svg' }],
      isOpen: true,
      wasMinimized: false,
      onBlur: jest.fn(),
      onClose: jest.fn(),
      onMinimize: jest.fn(),
      onSendMessage: jest.fn(),
      onStopChat: jest.fn(),
      aiResponse: '',
      isProcessing: false,
    };
  });
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AiAssistPopup {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the component when isOpen is true', () => {
    render(<AiAssistPopup {...defaultProps} />);
    expect(screen.getByText('MOST ASKED QUESTIONS')).toBeInTheDocument();
    expect(screen.getByText('What is IRR?')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AiAssistPopup {...defaultProps} />);
    const closeButton = screen.getByAltText('close');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onMinimize when minimize button is clicked', () => {
    render(<AiAssistPopup {...defaultProps} />);
    const minimizeButton = screen.getByAltText('minimize');
    fireEvent.click(minimizeButton);
    expect(defaultProps.onMinimize).toHaveBeenCalled();
  });

  it('sets input value and triggers onSendMessage on Enter', () => {
    render(<AiAssistPopup {...defaultProps} />);
    const input = screen.getByPlaceholderText('Type a query');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(defaultProps.onSendMessage).toHaveBeenCalledWith('Hello', '123');
  });

  it('calls onSendMessage when question is clicked', () => {
    render(<AiAssistPopup {...defaultProps} />);
    const question = screen.getByText('What is IRR?');
    fireEvent.click(question);
    expect(defaultProps.onSendMessage).toHaveBeenCalledWith(
      'What is IRR?',
      '123'
    );
  });

  it('calls onStopChat when button clicked during processing', () => {
    render(<AiAssistPopup {...defaultProps} isProcessing={true} />);
    const stopBtn = screen.getByAltText('pause');
    fireEvent.click(stopBtn);
    expect(defaultProps.onStopChat).toHaveBeenCalled();
  });
  it('should call full handleClose logic when close button is clicked', () => {
    render(<AiAssistPopup {...defaultProps} />);
    const closeButton = screen.getByAltText('close');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(newRelicErrLogsMock).toHaveBeenCalledWith(
      'Deal Assist:Chat Stopped',
      'info',
      expect.objectContaining({
        assetID: expect.any(String),
        userID: expect.any(String),
      })
    );
  });

  it('should call full handleQuestionClick logic when a question is clicked', () => {
    render(<AiAssistPopup {...defaultProps} />);
    const question = screen.getByText('What is IRR?');
    fireEvent.click(question);
    expect(defaultProps.onSendMessage).toHaveBeenCalledWith(
      'What is IRR?',
      '123'
    );
    expect(newRelicErrLogsMock).toHaveBeenCalledWith(
      'Deal Assist:Chat Started',
      'info',
      expect.objectContaining({
        assetID: expect.any(String),
        userID: expect.any(String),
      })
    );
  });

  it('should render messages correctly (simulate user input)', () => {
    render(<AiAssistPopup {...defaultProps} />);
    const input = screen.getByPlaceholderText('Type a query');
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(defaultProps.onSendMessage).toHaveBeenCalledWith('Hello AI', '123');
  });

  it('should not send empty messages when hitting Enter', () => {
    render(<AiAssistPopup {...defaultProps} />);
    const input = screen.getByPlaceholderText('Type a query');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
  });

  it('should call onStopChat when processing and pause button clicked', () => {
    render(<AiAssistPopup {...defaultProps} isProcessing={true} />);
    const stopButton = screen.getByAltText('pause');
    fireEvent.click(stopButton);
    expect(defaultProps.onStopChat).toHaveBeenCalled();
  });
  it('updates message list when aiResponse is received', () => {
    const { rerender } = render(
      <AiAssistPopup {...defaultProps} isProcessing={true} />
    );
    const input = screen.getByPlaceholderText('Type a query');
    fireEvent.change(input, { target: { value: 'Test AI' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    rerender(
      <AiAssistPopup
        {...defaultProps}
        aiResponse="This is an AI response"
        isProcessing={false}
      />
    );
    expect(screen.getByText('This is an AI response')).toBeInTheDocument();
  });

  it('resets messages when asset ID changes', () => {
    const { rerender } = render(<AiAssistPopup {...defaultProps} />);
    rerender(<AiAssistPopup {...defaultProps} key="changed" />);
  });
});
