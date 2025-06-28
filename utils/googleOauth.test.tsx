import React, { useEffect } from 'react';
import {
  GoogleLogin,
  GoogleOAuthProvider,
  googleLogout,
  useGoogleLogin,
  useGoogleOneTapLogin,
} from './googleOauth';
import { render, act, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('./googleOauth', () => {
  const original = jest.requireActual('./googleOauth');
  return {
    ...original,
    googleLogout: jest.fn(() => {
      (window as any).google?.accounts.id.disableAutoSelect();
    }),
  };
});

describe('GoogleOAuthProvider', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    (window as any).google = undefined;
  });

  it('loads script and renders children', async () => {
    const onLoad = jest.fn();
    const onError = jest.fn();

    await act(async () => {
      render(
        <GoogleOAuthProvider
          clientId="test-id"
          onScriptLoadSuccess={onLoad}
          onScriptLoadError={onError}
        >
          <div>Child</div>
        </GoogleOAuthProvider>
      );
    });

    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    expect(script).toBeInTheDocument();

    act(() => {
      (script as HTMLScriptElement).onload?.(new Event('load'));
    });

    expect(onLoad).toHaveBeenCalled();
  });

  it('triggers error callback on script error', async () => {
    const onError = jest.fn();

    await act(async () => {
      render(
        <GoogleOAuthProvider clientId="test-id" onScriptLoadError={onError}>
          <div>Test</div>
        </GoogleOAuthProvider>
      );
    });

    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    act(() => {
      (script as HTMLScriptElement).onerror?.(new Event('error'));
    });

    expect(onError).toHaveBeenCalled();
  });
});

describe('googleLogout', () => {
  it('calls google.accounts.id.disableAutoSelect()', () => {
    const disableAutoSelect = jest.fn();
    (window as any).google = { accounts: { id: { disableAutoSelect } } };

    googleLogout();

    expect(disableAutoSelect).toHaveBeenCalled();
  });
});

describe('GoogleLogin', () => {
  it('renders login button with expected height', () => {
    (window as any).google = {
      accounts: {
        id: {
          initialize: jest.fn(),
          renderButton: jest.fn(),
        },
      },
    };

    render(
      <GoogleOAuthProvider clientId="test-id">
        <div data-testid="wrapper">
          <GoogleLogin onSuccess={jest.fn()} size="medium" />
        </div>
      </GoogleOAuthProvider>
    );

    const containers = screen.getAllByTestId('wrapper');
    expect(containers[0].firstChild).toHaveStyle({ height: '32px' });
  });
});

describe('GoogleLogin (branches)', () => {
  beforeEach(() => {
    (window as any).google = {
      accounts: {
        id: {
          initialize: jest.fn(),
          renderButton: jest.fn(),
          prompt: jest.fn(),
          cancel: jest.fn(),
        },
      },
    };
  });

  it('calls onError if credentialResponse is missing fields', () => {
    const onError = jest.fn();
    const onSuccess = jest.fn();
    (window as any).google.accounts.id.initialize = jest.fn(({ callback }) => {
      callback({});
    });
    render(
      <GoogleOAuthProvider clientId="test-id">
        <GoogleLogin onSuccess={onSuccess} onError={onError} />
      </GoogleOAuthProvider>
    );
    // Simulate script loading
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    act(() => {
      (script as HTMLScriptElement).onload?.(new Event('load'));
    });
    expect(onError).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess if credentialResponse has required fields', () => {
    const onError = jest.fn();
    const onSuccess = jest.fn();
    (window as any).google.accounts.id.initialize = jest.fn(({ callback }) => {
      callback({ clientId: 'id', credential: 'cred' });
    });
    render(
      <GoogleOAuthProvider clientId="test-id">
        <GoogleLogin onSuccess={onSuccess} onError={onError} />
      </GoogleOAuthProvider>
    );
    // Simulate script loading
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    act(() => {
      (script as HTMLScriptElement).onload?.(new Event('load'));
    });
    expect(onSuccess).toHaveBeenCalledWith({
      clientId: 'id',
      credential: 'cred',
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls prompt and cancel if useOneTap is true', () => {
    const prompt = jest.fn();
    const cancel = jest.fn();
    (window as any).google.accounts.id.prompt = prompt;
    (window as any).google.accounts.id.cancel = cancel;
    const { unmount } = render(
      <GoogleOAuthProvider clientId="test-id">
        <GoogleLogin onSuccess={jest.fn()} useOneTap />
      </GoogleOAuthProvider>
    );
    // Simulate script loading
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    act(() => {
      (script as HTMLScriptElement).onload?.(new Event('load'));
    });
    expect(prompt).toHaveBeenCalled();
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});

describe('useGoogleLogin (branches)', () => {
  it('calls onError if response.error is present', async () => {
    const requestAccessToken = jest.fn();
    const initTokenClient = jest.fn().mockImplementation(({ callback }) => {
      callback({ error: 'fail' });
      return { requestAccessToken };
    });
    (window as any).google = {
      accounts: {
        oauth2: { initTokenClient },
      },
    };
    const onError = jest.fn();
    function TestComponent() {
      const loginFn = useGoogleLogin({
        flow: 'implicit',
        scope: 'email',
        onError,
      });
      useEffect(() => {
        loginFn({ prompt: 'consent' });
      }, [loginFn]);
      return <div>Test</div>;
    }
    await act(async () => {
      render(
        <GoogleOAuthProvider clientId="test-id">
          <TestComponent />
        </GoogleOAuthProvider>
      );
    });
    // Simulate script loading
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    act(() => {
      (script as HTMLScriptElement).onload?.(new Event('load'));
    });
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith({ error: 'fail' });
    });
  });
});

describe('useGoogleOneTapLogin', () => {
  it('initializes and prompts Google One Tap login', async () => {
    const initialize = jest.fn();
    const prompt = jest.fn();

    (window as any).google = {
      accounts: {
        id: { initialize, prompt, cancel: jest.fn() },
      },
    };

    function OneTapComponent() {
      useGoogleOneTapLogin({
        onSuccess: jest.fn(),
        promptMomentNotification: jest.fn(),
      });
      return <div>OneTap</div>;
    }

    await act(async () => {
      render(
        <GoogleOAuthProvider clientId="test-id">
          <OneTapComponent />
        </GoogleOAuthProvider>
      );
    });

    // Simulate script loading success
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    act(() => {
      (script as HTMLScriptElement).onload?.(new Event('load'));
    });

    // Wait for the initialize and prompt functions to be called
    await waitFor(() => {
      expect(initialize).toHaveBeenCalled();
      expect(prompt).toHaveBeenCalled();
    });
  });
});

describe('useGoogleOneTapLogin (branches)', () => {
  it('calls onError if credentialResponse is missing fields', async () => {
    const initialize = jest.fn(({ callback }) => {
      callback({});
    });
    (window as any).google = {
      accounts: {
        id: { initialize, prompt: jest.fn(), cancel: jest.fn() },
      },
    };
    const onError = jest.fn();
    function OneTapComponent() {
      useGoogleOneTapLogin({
        onSuccess: jest.fn(),
        onError,
      });
      return <div>OneTap</div>;
    }
    await act(async () => {
      render(
        <GoogleOAuthProvider clientId="test-id">
          <OneTapComponent />
        </GoogleOAuthProvider>
      );
    });
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    act(() => {
      (script as HTMLScriptElement).onload?.(new Event('load'));
    });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('calls onSuccess if credentialResponse has required fields', async () => {
    const initialize = jest.fn(({ callback }) => {
      callback({ clientId: 'id', credential: 'cred' });
    });
    (window as any).google = {
      accounts: {
        id: { initialize, prompt: jest.fn(), cancel: jest.fn() },
      },
    };
    const onSuccess = jest.fn();
    function OneTapComponent() {
      useGoogleOneTapLogin({
        onSuccess,
        onError: jest.fn(),
      });
      return <div>OneTap</div>;
    }
    await act(async () => {
      render(
        <GoogleOAuthProvider clientId="test-id">
          <OneTapComponent />
        </GoogleOAuthProvider>
      );
    });
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    act(() => {
      (script as HTMLScriptElement).onload?.(new Event('load'));
    });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        clientId: 'id',
        credential: 'cred',
      });
    });
  });
});

describe('hasGrantedAllScopesGoogle', () => {
  const { hasGrantedAllScopesGoogle } = require('./googleOauth');

  afterEach(() => {
    delete (window as any).google;
  });

  it('returns true if google.accounts.oauth2.hasGrantedAllScopes returns true', () => {
    const mockFn = jest.fn().mockReturnValue(true);
    (window as any).google = {
      accounts: {
        oauth2: { hasGrantedAllScopes: mockFn },
      },
    };
    const tokenResponse = {
      access_token: 'abc',
      expires_in: 1,
      scope: 'email',
    };
    expect(hasGrantedAllScopesGoogle(tokenResponse, 'email')).toBe(true);
    expect(mockFn).toHaveBeenCalledWith(tokenResponse, 'email');
  });

  it('returns false if google.accounts.oauth2.hasGrantedAllScopes returns false', () => {
    const mockFn = jest.fn().mockReturnValue(false);
    (window as any).google = {
      accounts: {
        oauth2: { hasGrantedAllScopes: mockFn },
      },
    };
    const tokenResponse = {
      access_token: 'abc',
      expires_in: 1,
      scope: 'email',
    };
    expect(hasGrantedAllScopesGoogle(tokenResponse, 'email')).toBe(false);
    expect(mockFn).toHaveBeenCalledWith(tokenResponse, 'email');
  });

  it('returns false if google is undefined', () => {
    (window as any).google = undefined;
    const tokenResponse = {
      access_token: 'abc',
      expires_in: 1,
      scope: 'email',
    };
    expect(hasGrantedAllScopesGoogle(tokenResponse, 'email')).toBe(false);
  });
});

describe('hasGrantedAnyScopeGoogle', () => {
  const { hasGrantedAnyScopeGoogle } = require('./googleOauth');

  afterEach(() => {
    delete (window as any).google;
  });

  it('returns true if google.accounts.oauth2.hasGrantedAnyScope returns true', () => {
    const mockFn = jest.fn().mockReturnValue(true);
    (window as any).google = {
      accounts: {
        oauth2: { hasGrantedAnyScope: mockFn },
      },
    };
    const tokenResponse = {
      access_token: 'abc',
      expires_in: 1,
      scope: 'email',
    };
    expect(hasGrantedAnyScopeGoogle(tokenResponse, 'email')).toBe(true);
    expect(mockFn).toHaveBeenCalledWith(tokenResponse, 'email');
  });

  it('returns false if google.accounts.oauth2.hasGrantedAnyScope returns false', () => {
    const mockFn = jest.fn().mockReturnValue(false);
    (window as any).google = {
      accounts: {
        oauth2: { hasGrantedAnyScope: mockFn },
      },
    };
    const tokenResponse = {
      access_token: 'abc',
      expires_in: 1,
      scope: 'email',
    };
    expect(hasGrantedAnyScopeGoogle(tokenResponse, 'email')).toBe(false);
    expect(mockFn).toHaveBeenCalledWith(tokenResponse, 'email');
  });

  it('returns false if google is undefined', () => {
    (window as any).google = undefined;
    const tokenResponse = {
      access_token: 'abc',
      expires_in: 1,
      scope: 'email',
    };
    expect(hasGrantedAnyScopeGoogle(tokenResponse, 'email')).toBe(false);
  });
});
