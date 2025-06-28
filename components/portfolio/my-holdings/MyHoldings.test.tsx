import fetchMock from 'jest-fetch-mock';
import { render, screen, waitFor } from '@testing-library/react';
import MyHoldings from '.';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { useAppDispatch } from '../../../redux/slices/hooks';

// Mock the useMediaQuery hook
jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

// Mock API calls to resolve immediately
jest.mock('../../../api/portfolio', () => ({
  getUserHoldingsCount: jest.fn().mockResolvedValue({ Bonds: 10 }),
  getUserHoldings: jest.fn().mockResolvedValue({ data: [] }),
}));
jest.mock('../../../redux/slices/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

fetchMock.enableMocks();

// Create a dummy reducer and store with thunk middleware
const dummyReducer = (
  state = { user: { portfolio: { investmentCount: {} } } }
) => state;
const store = createStore(dummyReducer, applyMiddleware(thunk));

describe('My Holdings', () => {
  beforeEach(() => {
    let mockDispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  test('Desktop View', async () => {
    // Mock the return value of useMediaQuery to be false (indicating desktop view)
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(
      <Provider store={store}>
        <MyHoldings />
      </Provider>
    );

    // Wait for async updates to finish
    await waitFor(() =>
      expect(screen.getByTestId('MyHoldingsDesktop')).toBeInTheDocument()
    );
  });

  test('Mobile View', async () => {
    // Set useMediaQuery to simulate mobile view
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(
      <Provider store={store}>
        <MyHoldings />
      </Provider>
    );

    // Wait for async updates to finish
    await waitFor(() =>
      expect(screen.getByTestId('MyHoldingsMobile')).toBeInTheDocument()
    );
  });
});
