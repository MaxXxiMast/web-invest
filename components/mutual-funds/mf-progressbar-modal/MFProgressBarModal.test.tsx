import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import mfReducer, { setOpenMFStepperLoader } from '../redux/mf';
import MFProgressBarModal from './MFProgressBarModal';

describe('MFProgressBarModal Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        mfConfig: mfReducer,
      },
      preloadedState: {
        mfConfig: {
          stepperLoader: {
            open: false,
            step: 0,
            error: false,
          },
        },
      },
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MFProgressBarModal />
      </Provider>
    );
  };

  test('should not display modal when stepperLoader.open is false', () => {
    renderComponent();
    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  test('should display modal when stepperLoader.open is true', () => {
    store.dispatch(
      setOpenMFStepperLoader({ open: true, step: 1, error: false })
    );
    renderComponent();
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  test('should display error state when stepperLoader.error is true', () => {
    store.dispatch(
      setOpenMFStepperLoader({ open: true, step: 1, error: true })
    );
    renderComponent();
    const errorElement = screen.getByText(/Failed/i);
    expect(errorElement).toBeInTheDocument();
  });
});
