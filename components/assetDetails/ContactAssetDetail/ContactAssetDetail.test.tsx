import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ContactAssetDetail from '.';
import * as calendlyUtils from '../../../utils/ThirdParty/calendly';
import * as gtmUtils from '../../../utils/gtm';
import * as stringUtils from '../../../utils/string';
import * as api from '../../../api/user';

interface CalendlyWindow extends Window {
  Calendly?: {
    initPopupWidget: (options: {
      url: string;
      prefill?: Record<string, any>;
    }) => void;
  };
}

const mockUserReducer = (state = { userData: null }, action: any) => state;

const createMockStore = (initialState: any) =>
  configureStore({
    reducer: {
      user: mockUserReducer,
    },
    preloadedState: initialState,
  });

jest.mock('../../../utils/ThirdParty/calendly', () => ({
  importCalendlyScript: jest.fn(),
  removeCalendlyScript: jest.fn(),
}));

jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://mock-bucket/',
  handleExtraProps: jest.fn((className) => className || ''),
}));

jest.mock('../../../api/user', () => ({
  fetchLeadOwnerDetails: jest.fn(),
}));

describe('ContactAssetDetail Component', () => {
  const defaultProps = {
    source: 'test-source',
    campaignName: 'test-campaign',
  };

  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    emailID: 'john.doe@example.com',
  };

  const mockCalendlyInitPopupWidget = jest.fn();
  const mockWindowCalendly = {
    initPopupWidget: mockCalendlyInitPopupWidget,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (api.fetchLeadOwnerDetails as jest.Mock).mockResolvedValue({
      calendlyLink: 'https://calendly.com/mock-link',
    });
    (calendlyUtils.importCalendlyScript as jest.Mock).mockResolvedValue(
      undefined
    );
    (calendlyUtils.removeCalendlyScript as jest.Mock).mockReturnValue(
      undefined
    );
    (stringUtils.handleExtraProps as jest.Mock).mockReturnValue('');
    Object.defineProperty(window as CalendlyWindow, 'Calendly', {
      value: mockWindowCalendly,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window as CalendlyWindow, 'Calendly', {
      value: undefined,
      writable: true,
    });
  });

  test('renders component with correct UI elements', async () => {
    const store = createMockStore({ user: { userData: mockUser } });
    render(
      <Provider store={store}>
        <ContactAssetDetail {...defaultProps} />
      </Provider>
    );

    const image = screen.getByAltText('ContactImage');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'ContactImage');
    expect(
      screen.getByText('Could not find what you were looking for?')
    ).toBeInTheDocument();
    expect(screen.getByText('Email Us')).toBeInTheDocument();
    expect(screen.getByText('Schedule a Call')).toBeInTheDocument();
  });

  test('fetches lead owner details and removes Calendly script', async () => {
    const store = createMockStore({ user: { userData: mockUser } });
    const { unmount } = render(
      <Provider store={store}>
        <ContactAssetDetail {...defaultProps} />
      </Provider>
    );

    await waitFor(() => {
      expect(api.fetchLeadOwnerDetails).toHaveBeenCalledWith('calendlyLink');
    });

    unmount();
    expect(calendlyUtils.removeCalendlyScript).toHaveBeenCalled();
  });

  test('opens email client and tracks event on Email button click', () => {
    const store = createMockStore({ user: { userData: mockUser } });
    const mockWindowOpen = jest.fn();
    jest.spyOn(window, 'open').mockImplementation(mockWindowOpen);

    render(
      <Provider store={store}>
        <ContactAssetDetail {...defaultProps} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Email Us'));

    expect(gtmUtils.trackEvent).toHaveBeenCalledWith('Reach Us', {
      type: 'Email',
    });
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'mailto:invest@gripinvest.in',
      '_blank',
      'noopener'
    );

    mockWindowOpen.mockRestore();
  });

  test('loads Calendly script and opens widget on Schedule Call click', async () => {
    const store = createMockStore({ user: { userData: mockUser } });
    render(
      <Provider store={store}>
        <ContactAssetDetail {...defaultProps} />
      </Provider>
    );

    await waitFor(() => {
      expect(api.fetchLeadOwnerDetails).toHaveBeenCalledWith('calendlyLink');
    });

    fireEvent.click(screen.getByText('Schedule a Call'));

    await waitFor(() => {
      expect(calendlyUtils.importCalendlyScript).toHaveBeenCalled();
      expect(gtmUtils.trackEvent).toHaveBeenCalledWith('Book a Meeting');
      expect(mockCalendlyInitPopupWidget).toHaveBeenCalledWith({
        url: 'https://calendly.com/mock-link?utm_campaign=test-campaign&utm_source=test-source',
        prefill: {
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      });
    });

    fireEvent.click(screen.getByText('Schedule a Call'));
    await waitFor(() => {
      expect(calendlyUtils.importCalendlyScript).toHaveBeenCalledTimes(1); // Not called again
      expect(mockCalendlyInitPopupWidget).toHaveBeenCalledTimes(2);
    });
  });

  test('handles API and Calendly script errors gracefully', async () => {
    (api.fetchLeadOwnerDetails as jest.Mock).mockRejectedValue(
      new Error('API failed')
    );
    (calendlyUtils.importCalendlyScript as jest.Mock).mockRejectedValue(
      new Error('Script load failed')
    );
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const store = createMockStore({ user: { userData: mockUser } });
    render(
      <Provider store={store}>
        <ContactAssetDetail {...defaultProps} />
      </Provider>
    );
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('error', expect.any(Error));
    });
    fireEvent.click(screen.getByText('Schedule a Call'));
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load Calendly script:',
        expect.any(Error)
      );
      expect(mockCalendlyInitPopupWidget).not.toHaveBeenCalled(); // Widget not opened on error
    });

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('handles missing user data and props for Calendly widget', async () => {
    const store = createMockStore({ user: { userData: {} } });
    render(
      <Provider store={store}>
        <ContactAssetDetail source="" campaignName="" />
      </Provider>
    );

    await waitFor(() => {
      expect(api.fetchLeadOwnerDetails).toHaveBeenCalledWith('calendlyLink');
    });

    fireEvent.click(screen.getByText('Schedule a Call'));

    await waitFor(() => {
      expect(calendlyUtils.importCalendlyScript).toHaveBeenCalled();
      expect(gtmUtils.trackEvent).toHaveBeenCalledWith('Book a Meeting');
      expect(mockCalendlyInitPopupWidget).toHaveBeenCalledWith({
        url: 'https://calendly.com/mock-link',
        prefill: {
          name: 'undefined undefined',
          firstName: undefined,
          lastName: undefined,
          email: undefined,
        },
      });
    });
  });
});
