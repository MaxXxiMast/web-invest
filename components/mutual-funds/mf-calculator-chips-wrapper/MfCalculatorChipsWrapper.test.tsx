import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { setMfData } from '../redux/mf';
import MfCalculatorChipsWrapper from './MfCalculatorChipsWrapper';

// Mock MfCalculatorChips to isolate testing
jest.mock('../mf-calculator-chips/MfCalculatorChips', () => {
  const MockComponent = (props: any) => (
    <div data-testid="mf-chips">
      {props.chipArr.map((chip: number) => (
        <button
          key={chip}
          data-testid={`chip-${chip}`}
          onClick={() => props.handleChipClick(chip)}
        >
          {chip}
          {chip === props.selectedChip && ' (Selected)'}
        </button>
      ))}
    </div>
  );
  MockComponent.displayName = 'MfCalculatorChips';
  return MockComponent;
});

// Mock reducer
const mockReducer = (state = { inputValue: 0 }, action: any) => {
  switch (action.type) {
    case 'mf/setMfData':
      return { ...state, inputValue: action.payload.inputValue };
    default:
      return state;
  }
};

describe('MfCalculatorChipsWrapper', () => {
  const renderWithStore = (preloadedState: any) => {
    const store = configureStore({
      reducer: {
        mfConfig: mockReducer,
      },
      preloadedState: {
        mfConfig: preloadedState,
      },
    });

    // Spy on dispatch
    jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <MfCalculatorChipsWrapper />
      </Provider>
    );

    return store;
  };

  it('renders with correct selected chip', () => {
    renderWithStore({ inputValue: 150000 });

    expect(screen.getByTestId('mf-chips')).toBeInTheDocument();
    expect(screen.getByTestId('chip-150000')).toHaveTextContent(
      '150000 (Selected)'
    );
  });

  it('dispatches action on chip click', () => {
    const store = renderWithStore({ inputValue: 100000 });

    fireEvent.click(screen.getByTestId('chip-200000'));

    expect(store.dispatch).toHaveBeenCalledWith(
      setMfData({ inputValue: 200000 })
    );
  });
});
