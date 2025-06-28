interface PostMessageData {
  [key: string]: any;
}

export const postMessageToNativeOrFallback = (
  eventName: string,
  data: PostMessageData,
  callback?: () => void
): void => {
  const messageObject = { eventName, ...data };
  const messageString = JSON.stringify(messageObject);

  const trySendMessage = (postFunction: () => void, platform: string) => {
    try {
      postFunction();
    } catch (error) {
      console.error(`Failed to send post message to ${platform}:`, error);
    }
  };

  const reactNativeWebView = (window as any)?.ReactNativeWebView;
  if (reactNativeWebView) {
    return trySendMessage(
      () => reactNativeWebView.postMessage(messageString),
      'React Native'
    );
  }

  const flutterInAppWebView = (window as any)?.flutter_inappwebview;
  if (flutterInAppWebView) {
    return trySendMessage(
      () => flutterInAppWebView.callHandler('FlutterChannel', messageString),
      'Flutter'
    );
  }

  // THIS IS FALLBACK CONDITION FOR FLUTTER
  if ((window as any).FlutterChannel) {
    return trySendMessage(
      () => (window as any).FlutterChannel.postMessage(messageString),
      'Flutter'
    );
  }

  // Swift (WKWebView message handler)
  if ((window as any).webkit?.messageHandlers?.iOS) {
    return trySendMessage(
      () =>
        (window as any).webkit.messageHandlers.iOS.postMessage(messageString),
      'Swift'
    );
  }

  // Java/Kotlin (Android WebView)
  if ((window as any).Android) {
    return trySendMessage(
      () => (window as any).Android.handleEvent(messageString),
      'Java/Kotlin'
    );
  }

  if (callback) {
    callback();
  } else {
    console.warn('No supported environment found to send post message.');
  }
};

export const isRenderedInWebview = () => {
  const w = window as any;

  const isReactNative = !!w.ReactNativeWebView;

  const isFlutter =
    !!w.FlutterChannel ||
    !!w.flutter_inappwebview ||
    !!w.flutter_webview_present;

  const isSwiftWebView =
    !!w.webkit?.messageHandlers &&
    // Only return true if specific known handlers are injected
    Object.keys(w.webkit.messageHandlers).length > 0;

  const isAndroidWebView = !!w.Android;

  return isReactNative || isFlutter || isSwiftWebView || isAndroidWebView;
};

