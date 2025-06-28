import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useMemo,
  useContext,
  useCallback,
  ReactNode,
} from 'react';

// Custom hook to load GSI script
function useLoadGsiScript(options: UseLoadGsiScriptOptions = {}) {
  const { onScriptLoadSuccess, onScriptLoadError } = options;
  const [scriptLoadedSuccessfully, setScriptLoadedSuccessfully] =
    useState(false);
  const onScriptLoadSuccessRef = useRef(onScriptLoadSuccess);
  onScriptLoadSuccessRef.current = onScriptLoadSuccess;
  const onScriptLoadErrorRef = useRef(onScriptLoadError);
  onScriptLoadErrorRef.current = onScriptLoadError;

  useEffect(() => {
    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://accounts.google.com/gsi/client';
    scriptTag.async = true;
    scriptTag.defer = true;

    scriptTag.onload = () => {
      setScriptLoadedSuccessfully(true);
      onScriptLoadSuccessRef.current?.();
    };

    scriptTag.onerror = () => {
      setScriptLoadedSuccessfully(false);
      onScriptLoadErrorRef.current?.();
    };

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  return scriptLoadedSuccessfully;
}

// Google OAuth Context
const GoogleOAuthContext = createContext<GoogleOAuthContextType | null>(null);

// Google OAuth Provider component
function GoogleOAuthProvider({
  clientId,
  onScriptLoadSuccess,
  onScriptLoadError,
  children,
}: GoogleOAuthProviderProps) {
  const scriptLoadedSuccessfully = useLoadGsiScript({
    onScriptLoadSuccess,
    onScriptLoadError,
  });

  const contextValue = useMemo(
    () => ({
      clientId,
      scriptLoadedSuccessfully,
    }),
    [clientId, scriptLoadedSuccessfully]
  );

  return (
    <GoogleOAuthContext.Provider value={contextValue}>
      {children}
    </GoogleOAuthContext.Provider>
  );
}

// Hook to use Google OAuth
function useGoogleOAuth() {
  const context = useContext(GoogleOAuthContext);
  if (!context) {
    throw new Error(
      'Google OAuth components must be used within GoogleOAuthProvider'
    );
  }
  return context;
}

// Google Login component
const containerHeightMap = { large: 40, medium: 32, small: 20 };

function GoogleLogin({
  onSuccess,
  onError,
  useOneTap,
  promptMomentNotification,
  type = 'standard',
  theme = 'outline',
  size = 'large',
  text,
  shape,
  logo_alignment,
  width,
  locale,
  ...props
}: GoogleLoginProps) {
  const btnContainerRef = useRef<HTMLDivElement | null>(null);
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const promptMomentNotificationRef = useRef(promptMomentNotification);

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  promptMomentNotificationRef.current = promptMomentNotification;

  useEffect(() => {
    if (!scriptLoadedSuccessfully) return;

    (window as any).google?.accounts.id.initialize({
      client_id: clientId,
      callback: (credentialResponse) => {
        if (!credentialResponse.clientId || !credentialResponse.credential) {
          onErrorRef.current?.();
          return;
        }
        onSuccessRef.current(credentialResponse);
      },
      ...props,
    });

    (window as any).google?.accounts.id.renderButton(btnContainerRef.current, {
      type,
      theme,
      size,
      text,
      shape,
      logo_alignment,
      width,
      locale,
    });

    if (useOneTap) {
      (window as any).google?.accounts.id.prompt(
        promptMomentNotificationRef.current
      );
    }

    return () => {
      if (useOneTap) {
        (window as any).google?.accounts.id.cancel();
      }
    };
  }, [
    clientId,
    scriptLoadedSuccessfully,
    useOneTap,
    type,
    theme,
    size,
    text,
    shape,
    logo_alignment,
    width,
    locale,
  ]);

  return (
    <div ref={btnContainerRef} style={{ height: containerHeightMap[size] }} />
  );
}

// Google Logout function
function googleLogout() {
  (window as any).google?.accounts.id.disableAutoSelect();
}

// Google Login Hooks
function useGoogleLogin({
  flow = 'implicit',
  scope,
  onSuccess,
  onError,
  ...props
}: UseGoogleLoginOptions) {
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const clientRef = useRef<any>();
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    if (!scriptLoadedSuccessfully) return;

    const clientMethod =
      flow === 'implicit' ? 'initTokenClient' : 'initCodeClient';
    const client = (window as any).google?.accounts.oauth2[clientMethod]({
      client_id: clientId,
      scope,
      callback: (response) => {
        if (response.error) {
          onErrorRef.current?.(response);
          return;
        }
        onSuccessRef.current(response);
      },
      ...props,
    });

    clientRef.current = client;
  }, [clientId, scriptLoadedSuccessfully, flow, scope]);

  const loginImplicitFlow = useCallback(
    (overrideConfig?: OverridableTokenClientConfig) => {
      clientRef.current?.requestAccessToken(overrideConfig);
    },
    []
  );

  const loginAuthCodeFlow = useCallback(() => {
    clientRef.current?.requestCode();
  }, []);

  return flow === 'implicit' ? loginImplicitFlow : loginAuthCodeFlow;
}

// Google One Tap Login Hook
function useGoogleOneTapLogin({
  onSuccess,
  onError,
  promptMomentNotification,
  cancel_on_tap_outside,
  hosted_domain,
}: UseGoogleOneTapLoginOptions) {
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const promptMomentNotificationRef = useRef(promptMomentNotification);

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  promptMomentNotificationRef.current = promptMomentNotification;

  useEffect(() => {
    if (!scriptLoadedSuccessfully) return;

    (window as any).google?.accounts.id.initialize({
      client_id: clientId,
      callback: (credentialResponse) => {
        if (!credentialResponse.clientId || !credentialResponse.credential) {
          onErrorRef.current?.();
          return;
        }
        onSuccessRef.current(credentialResponse);
      },
      hosted_domain,
      cancel_on_tap_outside,
    });

    (window as any).google?.accounts.id.prompt(
      promptMomentNotificationRef.current
    );

    return () => {
      (window as any).google?.accounts.id.cancel();
    };
  }, [
    clientId,
    scriptLoadedSuccessfully,
    cancel_on_tap_outside,
    hosted_domain,
  ]);
}

// Exporting necessary components, hooks, and utilities
export {
  GoogleLogin,
  GoogleOAuthProvider,
  googleLogout,
  hasGrantedAllScopesGoogle,
  hasGrantedAnyScopeGoogle,
  useGoogleLogin,
  useGoogleOneTapLogin,
};

// Types and interfaces
interface UseLoadGsiScriptOptions {
  onScriptLoadSuccess?: () => void;
  onScriptLoadError?: () => void;
}

interface GoogleOAuthContextType {
  clientId: string;
  scriptLoadedSuccessfully: boolean;
}

interface GoogleOAuthProviderProps extends UseLoadGsiScriptOptions {
  clientId: string;
  children: ReactNode;
}

interface GoogleLoginProps extends GsiButtonConfiguration {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: () => void;
  promptMomentNotification?: MomenListener;
  useOneTap?: boolean;
}

interface UseGoogleLoginOptionsImplicitFlow extends ImplicitFlowOptions {
  flow?: 'implicit';
}

interface AuthCodeFlowOptions {
  scope: string;
  callback?: (response: any) => void;
  prompt?: string;
  state?: string;
  redirect_uri?: string;
  code_challenge?: string;
  code_challenge_method?: string;
}

interface UseGoogleLoginOptionsAuthCodeFlow extends AuthCodeFlowOptions {
  flow?: 'auth-code';
}
type UseGoogleLoginOptions = (
  | UseGoogleLoginOptionsImplicitFlow
  | UseGoogleLoginOptionsAuthCodeFlow
) & {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  ux_mode?: 'popup' | 'redirect';
  scope: string;
};

interface UseGoogleOneTapLoginOptions {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: () => void;
  promptMomentNotification?: MomenListener;
  cancel_on_tap_outside?: boolean;
  hosted_domain?: string;
}

interface CredentialResponse {
  credential?: string;
  clientId?: string;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: string;
  shape?: 'rectangular' | 'pill';
  logo_alignment?: 'left' | 'center';
  width?: string;
  locale?: string;
}

interface ImplicitFlowOptions
  extends Omit<TokenClientConfig, 'client_id' | 'scope' | 'callback'> {
  scope: TokenClientConfig['scope'];
  onSuccess?: (
    tokenResponse: Omit<
      TokenResponse,
      'error' | 'error_description' | 'error_uri'
    >
  ) => void;
  onError?: (
    errorResponse: Pick<
      TokenResponse,
      'error' | 'error_description' | 'error_uri'
    >
  ) => void;
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback?: (response: TokenResponse) => void;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

interface CodeClientConfig {
  client_id: string;
  scope: string;
  callback?: (response: CodeResponse) => void;
}

interface CodeResponse {
  code: string;
  scope: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

type MomenListener = (
  promptMomentNotification: PromptMomentNotification
) => void;

interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
  getMomentType: () => string;
}

interface OverridableTokenClientConfig {
  prompt?: string;
  enable_serial_consent?: boolean;
  hint?: string;
  state?: string;
}

// Utility functions for Google OAuth
function hasGrantedAllScopesGoogle(
  tokenResponse: TokenResponse,
  firstScope: string,
  ...restScopes: string[]
): boolean {
  return (
    (window as any).google?.accounts.oauth2.hasGrantedAllScopes(
      tokenResponse,
      firstScope,
      ...restScopes
    ) ?? false
  );
}

function hasGrantedAnyScopeGoogle(
  tokenResponse: TokenResponse,
  firstScope: string,
  ...restScopes: string[]
): boolean {
  return (
    (window as any).google?.accounts.oauth2.hasGrantedAnyScope(
      tokenResponse,
      firstScope,
      ...restScopes
    ) ?? false
  );
}
