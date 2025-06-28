import { setAccessDetails } from '../access';
import store from '../..';
import Cookies from 'js-cookie';
import { setSessionExpiry } from '../sessionExpiry';
import { newRelicErrLogs } from '../../../utils/gtm';

export class TokenManager {
  // The token manager should be a singleton, so the constructor should be private
  private constructor() {
    this.token = null;
    this.isRefreshRequested = false;
    this.refreshTokenError = false;
    this.logMessages();
  }

  private logMessages() {
    setTimeout(() => {
      console.log(
        '%cSTOP!',
        'color: red; font-size: x-large; font-weight: bold;'
      );
      console.log(
        '%cThis browser feature is intended only for developers. If someone has asked you to paste some code here, they most likely are trying to steal your money or financial data.',
        'color: darkorange; font-size: x-large; font-weight: bold;'
      );
    }, 2000);
  }

  // Use a private static field to store the single instance of the TokenManager class
  private static instance: TokenManager;

  // Store the JWT token
  private token: string | null;

  // Implement a public static method to get the single instance of the TokenManager class
  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private getTokenFromLocalStorage(): string {
    if (!this.token) {
      const accessToken = store.getState()?.access?.accessToken;

      this.setToken(accessToken);
    }

    return this.token;
  }

  private setTokenToLocalstorage(token: string) {
    store.dispatch(setAccessDetails({ accessToken: token }));
    this.setToken(token);
  }

  // A private boolean flag to track whether a token refresh is in progress
  private isRefreshRequested: boolean;

  // A private boolean flag to check if there is an an error while fetching refresh token
  private refreshTokenError: boolean;

  // A method to set the JWT token
  private setToken(token: string) {
    this.token = token;
  }

  // A method to get the JWT token
  public async getToken(): Promise<string> {
    this.refreshTokenError = false;
    // If a token refresh is already in progress, wait until it's finished
    while (this.isRefreshRequested) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // If the token is not expired, return it immediately
    if (this.tokenIsNotExpired() || this.refreshTokenError) {
      return this.token;
    }

    // Set the flag to indicate that a token refresh is in progress
    this.isRefreshRequested = true;

    // Make an API call to get a new token
    const response = await fetch('/api/v3/users/refresh', {
      method: 'GET',
    });
    if (![200, 201].includes(response?.status)) {
      newRelicErrLogs('Refresh_token_api_failed', 'error', {
        responseStatus: response?.status,
      });
      Cookies.set('receivedAPIWith401', 'true');
      this.isRefreshRequested = false;
      this.refreshTokenError = true;
      store.dispatch(setSessionExpiry(true));
      return this.token;
    } else {
      // Store the new token, reset the flag, and return the new token
      const { accessToken } = await response.json();
      this.setTokenToLocalstorage(accessToken);
      this.isRefreshRequested = false;
      return accessToken;
    }
  }

  private getJWTExpiryTime() {
    try {
      const token = this.getTokenFromLocalStorage() as unknown as string;
      return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } catch (e) {
      return null;
    }
  }

  // A private method to check if the token is expired
  private tokenIsNotExpired(): boolean {
    const jwtExpiryTime = this.getJWTExpiryTime()?.exp * 1000;
    const currentTime = Date.now();
    if (jwtExpiryTime - currentTime <= 10000) {
      return false;
    }
    return true;
  }
}
