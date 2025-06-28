import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FdEligibiltyVerificationModal from './index';

jest.mock('../../../utils/gtm');

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
  }));

const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      assets: () => ({
        selectedAsset: {
          assetID: '1',
          name: 'Test Asset',
          productSubcategory: 'Fixed Deposit',
        },
      }),
      fdConfig: () => ({
        resetInterestModal: {
          isWomen: false,
          isSrCitizen: false,
          showLoader: true,
          ...preloadedState,
        },
      }),
    },
  });

  const defaultProps = {
    selectedValues: {
      srCitizen: false,
      women: false,
    },
    extraInterestRate: {
      seniorCitizen: {
        defaultChecked: false,
        enabled: true,
        render: true,
      },
      women: {
        defaultChecked: false,
        enabled: true,
        render: true,
      },
    },
  };
  
describe('FdEligibiltyVerificationModal', () => {
  
  test('TC 1: renders modal with heading and eligibility text', () => {
    const mockStore = createTestStore({
      isWomen: true,
      isSrCitizen: true,
      showLoader: true,
    });
  
    render(
      <Provider store={mockStore}>
        <FdEligibiltyVerificationModal {...defaultProps} />
      </Provider>
    );
    expect(
      screen.getByRole('heading', { name: /resetting rates as per your kyc/i })
    ).toBeInTheDocument();
  
    expect(screen.getByText(/Redirecting to Overview/i)).toBeInTheDocument();
  });
  
  test('TC 2: should render the image in the modal', () => {
    const mockStore = createTestStore({
      isWomen: true,
      isSrCitizen: true,
      showLoader: true,
    });
  
    render(
      <Provider store={mockStore}>
        <FdEligibiltyVerificationModal {...defaultProps} />
      </Provider>
    );
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });
  
  test('TC 3: should not render when showLoader is false', () => {
    const store = createTestStore({
      showLoader: false,
    });
    render(
      <Provider store={store}>
        <FdEligibiltyVerificationModal {...defaultProps} />
      </Provider>
    );
    expect(screen.queryByText(/Resetting rates as per your KYC/i)).toBeNull();
  });

  test('TC 4: renders "Applicable" if eligibility is true', () => {
    const store = createTestStore({
      isWomen: true,
      isSrCitizen: true,
    });
  
    render(
      <Provider store={store}>
        <FdEligibiltyVerificationModal
          {...defaultProps}
        />
      </Provider>
    );
    expect(screen.getAllByText('Applicable').length).toBe(2);
  });

  it('TC 5: Should render eligibility information correctly based on selectedValues and extraInterestRate', () => {
    const store = createTestStore({
      fdConfig: {
        resetInterestModal: {
          showLoader: true,
          isWomen: false,
          isSrCitizen: true,
        },
      },
      assets: {
        selectedAsset: {
          name: 'FD Asset 1',
          productSubcategory: 'Product Type A',
          assetID: '12345',
        },
      },
    });

    render(
      <Provider store={store}>
        <FdEligibiltyVerificationModal
          selectedValues={{ srCitizen: true, women: false }}
          extraInterestRate={defaultProps.extraInterestRate} 
        />
      </Provider>
    );
    expect(screen.getByText(/Senior Citizen/i)).toHaveTextContent(/Applicable/i);
    expect(screen.getByText(/Women/i)).toHaveTextContent(/Not Applicable/i);
  
  });

  test('TC 6: Applicable/Not Applicable items should have correct classes', () => {
    const mockStore = createTestStore({
      isWomen: true,
      isSrCitizen: false,
      showLoader: true,
    });
  
    render(
      <Provider store={mockStore}>
        <FdEligibiltyVerificationModal
          selectedValues={{ women: true, srCitizen: false }}
          {...defaultProps}
        />
      </Provider>
    );
  
    const applicableItems = screen.getAllByText('Applicable');
    applicableItems.forEach((item) => {
      expect(item).toHaveClass('applicable');
    });
  
    const notApplicableItems = screen.getAllByText('Not Applicable');
    notApplicableItems.forEach((item) => {
      expect(item).toHaveClass('notApplicable');
    });
  });

  test('TC 7: Modal should contain the line "Redirecting to Overview" with animated dots', () => {
    const mockStore = createTestStore({
      isWomen: true,
      isSrCitizen: true,
      showLoader: true,
    });

    render(
      <Provider store={mockStore}>
        <FdEligibiltyVerificationModal {...defaultProps} />
      </Provider>
    );
    const redirectText = screen.getByText(/Redirecting to Overview/i);
    expect(redirectText).toBeInTheDocument();

    const dots = redirectText.querySelectorAll('.dot');
    expect(dots.length).toBe(3);
  });

});
  