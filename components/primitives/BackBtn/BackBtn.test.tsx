import { fireEvent, render, screen } from '@testing-library/react';
import BackBtn from './BackBtn';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../../utils/appHelpers';

jest.mock('../../../utils/appHelpers', () => ({
  isRenderedInWebview: jest.fn(),
  postMessageToNativeOrFallback: jest.fn(),
}));

describe('BackBtn', () => {
  // Test case - 1
  test('render default BackBtn', () => {
    render(<BackBtn />);

    expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
  });

  // Test case - 2
  test('render default handleBackEvent without errors', () => {
    (isRenderedInWebview as jest.Mock).mockReturnValue(false);

    render(<BackBtn />);
    fireEvent.click(screen.getByTestId('arrow-icon'));
  });

  // Test case - 3
  test('handleBackEvent on click', () => {
    const handleBackEventMock = jest.fn();

    render(<BackBtn handleBackEvent={handleBackEventMock} />);
    fireEvent.click(screen.getByTestId('arrow-icon'));
    expect(handleBackEventMock).toHaveBeenCalledTimes(1);
  });

  // Test case - 4
  test('render when isDirectLink is true and backUrl is provided', () => {
    render(<BackBtn isDirectLink={true} backUrl="/home" />);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/home');
  });

  // Test case - 5
  test('render when isDirectLink is true and backUrl is not provided', () => {
    render(<BackBtn isDirectLink={true} />);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '#');
  });

  // Test case - 6
  test('renders extraImage when provided', () => {
    render(<BackBtn extraImage="/test-image.svg" />);

    const img = screen.getByAltText('Udaan');
    expect(img).toHaveAttribute('alt', 'Udaan');
  });

  // Test case - 7
  test('sends postMessage when in webview and shouldHandleAppBack is true', () => {
    (isRenderedInWebview as jest.Mock).mockReturnValue(true);

    render(<BackBtn shouldHandleAppBack={true} />);
    fireEvent.click(screen.getByTestId('arrow-icon'));

    expect(postMessageToNativeOrFallback).toHaveBeenCalledWith('no_back', {});
  });
});
