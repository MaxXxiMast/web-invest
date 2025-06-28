import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import MfCalculatorInputField from './MfCalculatorInputField';
import { Provider } from 'react-redux';
import MfInputFieldWrapper from '../mf-input-field-wrapper/MfInputFieldWrapper';
import { setMfData } from '../redux/mf';

// Mock the numberToCurrency function but use the original implementation
jest.mock('../../../utils/number', () => ({
  ...jest.requireActual('../../../utils/number'), // Use the original module
  numberToCurrency: jest.fn((value, toIntlFormat) => {
    // Use the original function's logic
    return jest
      .requireActual('../../../utils/number')
      .numberToCurrency(value, toIntlFormat);
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

describe('MfCalculatorInputField Component', () => {
  const store = configureStore({
    reducer: {
      mfConfig: () => ({
        inputValue: 50000,
        allowedMinInputValue: 10000,
        allowedMaxInputValue: 100000,
        multiplier: 50000,
      }),
    },
  });

  it('should render the component with the initial input value', () => {
    render(
      <Provider store={store}>
        <MfInputFieldWrapper />
      </Provider>
    );

    // Check if the input field has the initial value
    const inputElement = screen.getByTestId('input-amount') as HTMLInputElement;
    expect(inputElement.value).toBe('50,000');
  });

  it('should dispatch setMfData when the input value changes', () => {
    const dispatch = jest.fn();
    jest.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(dispatch);

    render(
      <Provider store={store}>
        <MfInputFieldWrapper />
      </Provider>
    );

    // Get the input element
    const inputElement = screen.getByTestId('input-amount');

    // Simulate a change event with a new value
    fireEvent.change(inputElement, { target: { value: '75000' } });

    // Verify that the setMfData action was dispatched with the correct value
    expect(dispatch).toHaveBeenCalledWith(setMfData({ inputValue: 75000 }));
  });

  it('renders with default props', () => {
    const { getByLabelText, getByDisplayValue } = render(
      <MfCalculatorInputField inputValue={1000} />
    );
    const prefixLabel = screen.getByTestId('prefix-value');
    expect(prefixLabel).toHaveTextContent('₹');
    // Check if the label is rendered with the default text
    expect(getByLabelText('Enter Amount')).toBeInTheDocument();

    // Check if the input value is formatted as currency with the default prefix
    expect(getByDisplayValue('1,000')).toBeInTheDocument();
  });

  it('renders with custom label and prefix', () => {
    const { getByLabelText, getByDisplayValue } = render(
      <MfCalculatorInputField
        inputValue={2000}
        labelText="Custom Label"
        fieldPrefix="$"
      />
    );
    const prefixLabel = screen.getByTestId('prefix-value');
    expect(prefixLabel).toHaveTextContent('$');

    // Check if the custom label is rendered
    expect(getByLabelText('Custom Label')).toBeInTheDocument();

    // Check if the custom prefix is rendered
    expect(getByDisplayValue('2,000')).toBeInTheDocument();
  });

  it('renders without currency formatting', () => {
    const { getByDisplayValue } = render(
      <MfCalculatorInputField
        inputValue={3000}
        shouldShowValueAsCurrency={false}
      />
    );

    // Check if the input value is not formatted as currency
    expect(getByDisplayValue('3000')).toBeInTheDocument();
  });

  it('renders with string input value', () => {
    const { getByDisplayValue } = render(
      <MfCalculatorInputField inputValue="7000" />
    );

    // Check if the input value is formatted as currency
    expect(getByDisplayValue('7,000')).toBeInTheDocument();
  });

  it('renders with invalid input value', () => {
    const { getByDisplayValue } = render(
      <MfCalculatorInputField inputValue="invalid" />
    );

    // Check if the input value is rendered as is (no formatting)
    expect(getByDisplayValue('')).toBeInTheDocument();
  });

  it('renders with empty input value', () => {
    const { getByDisplayValue } = render(
      <MfCalculatorInputField inputValue="" />
    );

    // Check if the input value is rendered as empty
    expect(getByDisplayValue('')).toBeInTheDocument();
  });

  it('renders with zero input value', () => {
    const { getByDisplayValue } = render(
      <MfCalculatorInputField inputValue={0} />
    );

    // Check if the input value is formatted as currency
    expect(getByDisplayValue('0')).toBeInTheDocument();
  });
});
