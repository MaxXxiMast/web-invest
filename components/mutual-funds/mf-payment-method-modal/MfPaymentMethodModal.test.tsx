import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MfPaymentMethodModal from './MfPaymentMethodModal';
import { setMfData } from '../redux/mf';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Mocking the TooltipCompoent and MaterialModalPopup components
jest.mock('../../primitives/TooltipCompoent/TooltipCompoent', () => {
  const TooltipCompoent = () => <div data-testid="tooltip" />;
  TooltipCompoent.displayName = 'TooltipCompoent'; // Set displayName
  return TooltipCompoent;
});

jest.mock('../../primitives/MaterialModalPopup', () => {
  const MaterialModalPopup = ({ children }) => (
    <div data-testid="modal-popup">{children}</div>
  );
  MaterialModalPopup.displayName = 'MaterialModalPopup'; // Set displayName
  return MaterialModalPopup;
});

// Define the initial state and store
const initialState = {
  mfConfig: {
    selectedPaymentMethod: 'upi',
    showPaymentMethodModal: true,
    availablePaymentMethods: [
      { value: 'upi', label: 'UPI' },
      { value: 'credit', label: 'Credit Card' },
    ],
    bankDetails: {
      bankName: 'Bank ABC',
      accountNo: '1234567890',
    },
  },
};

const store = configureStore({
  reducer: {
    // Your actual reducer
    mfConfig: (state = initialState.mfConfig, action) => state, // Mocked reducer
  },
});

describe('MfPaymentMethodModal', () => {
  it('renders modal with available payment methods and allows selection', async () => {
    render(
      <Provider store={store}>
        <MfPaymentMethodModal />
      </Provider>
    );

    // Verify modal header
    expect(screen.getByText(/Select Payment Method/i)).toBeInTheDocument();

    // Check that 'UPI' is checked by default
    expect(screen.getByLabelText(/UPI/i)).toBeChecked();

    // Simulate user selecting 'Credit Card'
    const creditCardRadio = screen.getByLabelText(/Credit Card/i);
    fireEvent.click(creditCardRadio);

    // Verify that 'Credit Card' is selected
    expect(creditCardRadio).toBeChecked();
    expect(screen.getByLabelText(/UPI/i)).not.toBeChecked();
  });

  it('handles confirm button click', async () => {
    const mockDispatch = jest.fn();
    const dispatchSpy = jest
      .spyOn(store, 'dispatch')
      .mockImplementation(mockDispatch);

    render(
      <Provider store={store}>
        <MfPaymentMethodModal />
      </Provider>
    );

    // Simulate clicking the 'Confirm' button
    fireEvent.click(screen.getByTestId('confirmPayment'));

    // Ensure the dispatch is called with the correct arguments
    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(
        setMfData({
          selectedPaymentMethod: 'upi', // 'upi' is selected by default
          showPaymentMethodModal: false,
        })
      )
    );
  });

  it('disables the confirm button when no payment methods are available', () => {
    const emptyStore = configureStore({
      reducer: {
        // Your actual reducer
        mfConfig: (
          state = {
            selectedPaymentMethod: '',
            showPaymentMethodModal: true,
            availablePaymentMethods: [],
            bankDetails: {},
          },
          action
        ) => state, // Mocked reducer
      },
    });

    render(
      <Provider store={emptyStore}>
        <MfPaymentMethodModal />
      </Provider>
    );

    // Ensure the 'Confirm' button is disabled if there are no available payment methods
    const confirmButton = screen.getByTestId('confirmPayment');
    expect(confirmButton).toBeDisabled();
  });

  it('does not render modal when showPaymentMethodModal is false', () => {
    // Create a mock store with showPaymentMethodModal set to false
    const mockStore = configureStore({
      reducer: {
        mfConfig: (
          state = {
            selectedPaymentMethod: 'upi',
            showPaymentMethodModal: false,
            availablePaymentMethods: [],
            bankDetails: {},
          },
          action
        ) => state,
      },
    });

    // Render the component with the mock store
    render(
      <Provider store={mockStore}>
        <MfPaymentMethodModal />
      </Provider>
    );

    // Check if modal is not rendered by querying for the modal's content using the 'payment-method-modal' test id
    const modalContent = screen.queryByTestId('payment-method-modal');

    // Ensure the modal is not rendered (it should be null)
    expect(modalContent).toBeNull();
  });

  it('disables the confirm button when selectedPaymentMethod is not set', () => {
    const noPaymentMethodStore = configureStore({
      reducer: {
        mfConfig: (
          state = {
            selectedPaymentMethod: '',
            showPaymentMethodModal: true,
            availablePaymentMethods: [{ value: 'upi', label: 'UPI' }],
            bankDetails: {},
          },
          action
        ) => state,
      },
    });

    render(
      <Provider store={noPaymentMethodStore}>
        <MfPaymentMethodModal />
      </Provider>
    );

    // Ensure confirm button is disabled when no payment method is selected
    const confirmButton = screen.getByTestId('confirmPayment');
    expect(confirmButton).toBeDisabled();
  });
});
