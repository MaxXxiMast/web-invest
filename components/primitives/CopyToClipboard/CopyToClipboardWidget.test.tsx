import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CopyToClipboardWidget from './index';
import { callSuccessToast } from '../../../api/strapi';

// Mocking Image component and callSuccessToast
jest.mock('../Image', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} />
    </>
  ),
}));

jest.mock('../../../api/strapi', () => ({
  callSuccessToast: jest.fn(),
}));

// Mocking navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(''),
  },
});

describe('CopyToClipboardWidget Component', () => {
  const defaultProps = {
    text: 'Test text to copy',
    iconUrl: 'https://example.com/icon.png',
    widgetLabel: 'Copy Text',
    iconWidth: 14,
    iconHeight: 14,
    iconSize: 14,
    showToast: true,
    className: 'custom-class',
    handleCopyFun: jest.fn(),
    iconAfterText: false,
    enabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ 1. Renders correctly with default props
  it('renders correctly with default props', () => {
    render(<CopyToClipboardWidget {...defaultProps} />);
    expect(screen.getByText('Copy Text')).toBeInTheDocument();
    expect(screen.getByAltText('CopyIcon')).toHaveAttribute(
      'src',
      'https://example.com/icon.png'
    );
  });

  // ✅ 2. Copies text to clipboard when clicked
  it('copies text to clipboard when clicked', async () => {
    render(<CopyToClipboardWidget {...defaultProps} />);
    const copyWidget = screen.getByText('Copy Text');

    fireEvent.click(copyWidget);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Test text to copy'
      );
      expect(callSuccessToast).toHaveBeenCalledWith(
        'Copied to clipboard successfully!'
      );
      expect(defaultProps.handleCopyFun).toHaveBeenCalledWith(
        'Test text to copy'
      );
    });
  });

  // ✅ 3. Does not copy text when disabled
  it('does not copy text when disabled', () => {
    render(<CopyToClipboardWidget {...defaultProps} enabled={false} />);
    const copyWidget = screen.getByText('Copy Text');

    fireEvent.click(copyWidget);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(callSuccessToast).not.toHaveBeenCalled();
  });

  // ✅ 4. Renders default icon when no iconUrl is provided
  it('renders default copy icon when iconUrl is not provided', () => {
    render(<CopyToClipboardWidget {...defaultProps} iconUrl="" />);
    expect(screen.getByText('Copy Text')).toBeInTheDocument();
    expect(
      screen.getByText('Copy Text').querySelector('.icon-copy')
    ).toBeTruthy();
  });

  // ✅ 5. Does not show toast when showToast is false
  it('does not show toast when showToast is false', async () => {
    render(<CopyToClipboardWidget {...defaultProps} showToast={false} />);
    const copyWidget = screen.getByText('Copy Text');

    fireEvent.click(copyWidget);

    await waitFor(() => {
      expect(callSuccessToast).not.toHaveBeenCalled();
      expect(defaultProps.handleCopyFun).toHaveBeenCalledWith(
        'Test text to copy'
      );
    });
  });

  // ✅ 6. Logs error when clipboard is not supported
  it('logs error when clipboard is not supported', () => {
    const originalClipboard = navigator.clipboard;
    // @ts-ignore
    navigator.clipboard = undefined;
    // delete navigator.clipboard;

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    try {
      render(<CopyToClipboardWidget {...defaultProps} />);
      const copyWidget = screen.getByText('Copy Text');

      fireEvent.click(copyWidget);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Clipboard not supported');
    } finally {
      consoleWarnSpy.mockRestore();
      Object.assign(navigator, { clipboard: originalClipboard });
    }
  });

  // ✅ 7. Handles copy error correctly
  it('handles copy error correctly', async () => {
    const originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = jest
      .fn()
      .mockRejectedValue(new Error('Copy failed'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    try {
      render(<CopyToClipboardWidget {...defaultProps} />);
      const copyWidget = screen.getByText('Copy Text');

      fireEvent.click(copyWidget);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Async: Could not copy text: ',
        expect.any(Error)
      );
    } finally {
      consoleErrorSpy.mockRestore();
      navigator.clipboard.writeText = originalWriteText;
    }
  });

  // ✅ 8. Does nothing when text is empty
  it('does not copy when text is empty', () => {
    render(<CopyToClipboardWidget {...defaultProps} text="" />);
    const copyWidget = screen.getByText('Copy Text');

    fireEvent.click(copyWidget);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(callSuccessToast).not.toHaveBeenCalled();
  });
});
