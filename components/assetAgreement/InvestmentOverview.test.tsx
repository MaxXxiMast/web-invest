import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InvestmentOverview from './InvestmentOverview';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('./InvestmentDetails', () => {
  const Component = () => <div data-testid="InvestmentDetails">InvestmentDetails</div>;
  Component.displayName = 'MockInvestmentDetails';
  return Component;
});

jest.mock('./EsignStatus', () => {
  const Component = () => <div>EsignStatus</div>;
  Component.displayName = 'MockEsignStatus';
  return Component;
});

jest.mock('./PartnerAndInvestmentAmount', () => {
  const Component = () => <div>PartnerAndInvestmentAmount</div>;
  Component.displayName = 'MockPartnerAndInvestmentAmount';
  return Component;
});

const mockPush = jest.fn();
const mockUseMediaQuery = require('../../utils/customHooks/useMediaQuery').useMediaQuery;
const createTestStore = (kycConfig = [], preloadedState = {}) =>
  configureStore({
    reducer: {
      user: () => ({
        kycConfigStatus: {
          default: {
            kycTypes: kycConfig,
          },
        },
        userData: {
          userID: 123,
          documents: [
            { docSubType: 1, docType: 'order' },
            { docSubType: 1, docType: 'order' },
          ],
        },
        aifDocuments: [
          {
            displayName: 'eSign Investment Agreement',
          },
        ],
        portfolio: {
          list: [
            {
              assetID: 1,
              isEsigned: true,
            },
          ],
        },
      }),
      assets: () => ({
        selectedAsset: {
          assetID: 1,
          spvID: 10,
          hasLlp: 1,
          financeProductType: 'startupEquity',
          spvAgreements: [],
        },
        oneTimeAgreements: [
          {
            agreementPdfs: {
              id: 5,
              displayName: 'Investment Agreement',
            },
          },
        ],
      }),
      fdConfig: () => ({
        ...preloadedState,
      }),
    },
  });

describe('InvestmentOverview Component', () => {
  const defaultProps = {
    placeDeal: jest.fn(),
    calculatedReturns: 10000,
    taxPercentage: 30,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      query: { amount: '1000' },
      push: mockPush,
    });
  });

 it('should render correctly in desktop view', async() => {
  mockUseMediaQuery.mockReturnValue(false);
  const store = createTestStore();

  await waitFor(() => {
    render(
      <Provider store={store}>
        <InvestmentOverview {...defaultProps} />
      </Provider>
    );
    });

  expect(screen.getByText('EsignStatus')).toBeInTheDocument();
  expect(screen.getByText('PartnerAndInvestmentAmount')).toBeInTheDocument();

  const elements = screen.getAllByTestId('InvestmentDetails');
  expect(elements.length).toBeGreaterThan(0);
  expect(screen.getByText('Proceed')).toBeInTheDocument();
});


  it('should render correctly in mobile view', async() => {
    mockUseMediaQuery.mockReturnValue(true);
    const store = createTestStore();

    await waitFor(() => {
    render(
      <Provider store={store}>
        <InvestmentOverview {...defaultProps} />
      </Provider>
    );
  });

    expect(screen.getByText('EsignStatus')).toBeInTheDocument();
    expect(screen.getByText('PartnerAndInvestmentAmount')).toBeInTheDocument();
    expect(screen.getByTestId('InvestmentDetails')).toBeInTheDocument();
    expect(screen.getAllByText('Proceed').length).toBeGreaterThan(0);
  });

  it('should call placeDeal on Proceed button click', async() => {
    mockUseMediaQuery.mockReturnValue(true);
    const store = createTestStore();

    await waitFor(() => {
    render(
      <Provider store={store}>
        <InvestmentOverview {...defaultProps} />
      </Provider>
    );
  });

    const button = screen.getAllByText('Proceed')[0];
    fireEvent.click(button);

    expect(defaultProps.placeDeal).toHaveBeenCalledWith(true, expect.any(Number));
  });

  it('should render correctly in mobile view', async() => {
  mockUseMediaQuery.mockReturnValue(true);
  const store = createTestStore();

  await waitFor(() => {
    render(
      <Provider store={store}>
        <InvestmentOverview {...defaultProps} />
      </Provider>
    );
  });

  expect(screen.getByText('Proceed')).toBeInTheDocument();
});

it('should return false when no aifDocuments and hasLlp is 0', async () => {
  mockUseMediaQuery.mockReturnValue(false);
  const store = createTestStore([], {
    userData: {
      userID: 123,
      documents: [],
    },
    aifDocuments: [],
    portfolio: {
      list: [],
    },
  });

  store.getState().assets.selectedAsset.hasLlp = 0;
await waitFor(() => {
  render(
    <Provider store={store}>
      <InvestmentOverview {...defaultProps} />
    </Provider>
  );
})

expect(screen.getByText((content) => content.includes('By clicking Proceed'))).toBeInTheDocument();

});


});
