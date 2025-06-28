(globalThis as any).global = globalThis;

import {
  postMessageToNativeOrFallback,
  isRenderedInWebview,
} from './appHelpers';

describe('postMessageToNativeOrFallback', () => {
  const eventName = 'TEST_EVENT';
  const data = { key: 'value' };
  const message = JSON.stringify({ eventName, ...data });

  afterEach(() => {
    jest.resetAllMocks();
    delete (window as any).ReactNativeWebView;
    delete (window as any).flutter_inappwebview;
    delete (window as any).FlutterChannel;
    delete (window as any).webkit;
    delete (window as any).Android;
  });

  test('sends message to flutter_inappwebview', () => {
    const callHandlerMock = jest.fn();
    (window as any).flutter_inappwebview = { callHandler: callHandlerMock };

    postMessageToNativeOrFallback(eventName, data);
    expect(callHandlerMock).toHaveBeenCalledWith('FlutterChannel', message);
  });

  test('sends message to FlutterChannel fallback', () => {
    const postMessageMock = jest.fn();
    (window as any).FlutterChannel = { postMessage: postMessageMock };

    postMessageToNativeOrFallback(eventName, data);
    expect(postMessageMock).toHaveBeenCalledWith(message);
  });

  test('sends message to Swift WKWebView', () => {
    const postMessageMock = jest.fn();
    (window as any).webkit = {
      messageHandlers: {
        iOS: { postMessage: postMessageMock },
      },
    };

    postMessageToNativeOrFallback(eventName, data);
    expect(postMessageMock).toHaveBeenCalledWith(message);
  });

  test('sends message to Android WebView', () => {
    const handleEventMock = jest.fn();
    (window as any).Android = { handleEvent: handleEventMock };

    postMessageToNativeOrFallback(eventName, data);
    expect(handleEventMock).toHaveBeenCalledWith(message);
  });

  test('calls fallback callback when no platform is detected', () => {
    const callback = jest.fn();

    postMessageToNativeOrFallback(eventName, data, callback);
    expect(callback).toHaveBeenCalled();
  });

  test('logs warning if no platform and no callback', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    postMessageToNativeOrFallback(eventName, data);
    expect(warnSpy).toHaveBeenCalledWith(
      'No supported environment found to send post message.'
    );
  });

  test('logs error when postMessage fails', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (window as any).ReactNativeWebView = {
      postMessage: () => {
        throw new Error('Mock failure');
      },
    };

    postMessageToNativeOrFallback(eventName, data);
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to send post message to React Native:',
      expect.any(Error)
    );
  });
});

describe('isRenderedInWebview', () => {
  afterEach(() => {
    delete (window as any).ReactNativeWebView;
    delete (window as any).FlutterChannel;
    delete (window as any).flutter_inappwebview;
    delete (window as any).flutter_webview_present;
    delete (window as any).Android;
    delete (window as any).webkit;
  });

  test('returns true if flutter_inappwebview exists', () => {
    (window as any).flutter_inappwebview = {};
    expect(isRenderedInWebview()).toBe(true);
  });

  test('returns true if webkit.messageHandlers has keys', () => {
    (window as any).webkit = { messageHandlers: { iOS: {} } };
    expect(isRenderedInWebview()).toBe(true);
  });

  test('returns false if no platform-specific objects exist', () => {
    expect(isRenderedInWebview()).toBe(false);
  });
});
