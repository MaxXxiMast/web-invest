import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Bank from '../bank/index';

jest.mock('../../../../api/strapi', () => ({
  __esModule: true,
  callSuccessToast: jest.fn(),
  callErrorToast: jest.fn(),
}));

jest.mock('../../../../api/rfqKyc', () => ({
  __esModule: true,
  getRetryCounts: jest.fn(),
  handleVerifyDocument: jest.fn(),
}));

jest.mock('../../../../contexts/kycContext', () => ({
  __esModule: true,
  useKycContext: jest.fn(),
}));

jest.mock('../../../../utils/kyc', () => ({
  __esModule: true,
  bankAccNumberRegex: /^\d{9,18}$/,
  ifscCodeRegex: /^[A-Z]{4}0[A-Z0-9]{6}$/,
}));

jest.mock('../../../../utils/gtm', () => ({
  __esModule: true,
  trackEvent: jest.fn(),
}));

jest.mock('../../../../utils/number', () => ({
  __esModule: true,
  bytesToSize: jest.fn(() => '1MB'),
}));

jest.mock('../../../../utils/appHelpers', () => ({
  __esModule: true,
  postMessageToNativeOrFallback: jest.fn(),
}));

jest.mock('../../../common/GripSelect', () => ({
  __esModule: true,
  default: ({ value, onChange, options, placeholder, id, disabled }) => (
    <select
      data-testid="grip-select"
      value={value}
      onChange={onChange}
      disabled={disabled}
      id={id}
    >
      <option value="">{placeholder}</option>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock('../../../common/inputFieldSet', () => ({
  __esModule: true,
  default: ({ placeHolder, inputId, onChange, value, disabled, error, type }) => (
    <div>
      <input
        data-testid={`input-${inputId}`}
        placeholder={placeHolder}
        id={inputId}
        onChange={onChange}
        value={value || ''}
        disabled={disabled}
        type={type}
        className={error ? 'error' : ''}
      />
    </div>
  ),
}));

jest.mock('../../common/StepTitle', () => ({
  __esModule: true,
  default: ({ text }) => <h2 data-testid="step-title">{text}</h2>,
}));

jest.mock('../../common/ErrorCard', () => ({
  __esModule: true,
  default: ({ data, buttonText, onClickButton }) => (
    <div data-testid="error-card">
      <h3>{data.title}</h3>
      <p>{data.message}</p>
      <button onClick={onClickButton}>{buttonText}</button>
    </div>
  ),
}));

jest.mock('../../common/Note', () => ({
  __esModule: true,
  default: ({ text, className }) => (
    <div data-testid="note" className={className}>
      {text}
    </div>
  ),
}));

jest.mock('./DocUploadForm', () => ({
  __esModule: true,
  default: ({ handleUploadCB }) => (
    <div data-testid="doc-upload-form">
      <button onClick={() => handleUploadCB('success', {}, new File([''], 'test.pdf'))}>
        Upload Success
      </button>
      <button onClick={() => handleUploadCB('error', { heading: 'Error', message: 'Upload failed' })}>
        Upload Error
      </button>
    </div>
  ),
}));

jest.mock('../../footer', () => ({
  __esModule: true,
  default: ({ footerLinkText, isLoading, isFooterBtnDisabled, handleBtnClick }) => (
    <button
      data-testid="footer-button"
      onClick={handleBtnClick}
      disabled={isFooterBtnDisabled}
    >
      {isLoading ? 'Loading...' : footerLinkText}
    </button>
  ),
}));

jest.mock('../../common/GenericModal', () => ({
  __esModule: true,
  default: ({ showModal, title, subtitle, children, customIcon }) => 
    showModal ? (
      <div data-testid="generic-modal">
        {customIcon && customIcon()}
        <h3>{title}</h3>
        <p>{subtitle}</p>
        {children}
      </div>
    ) : null,
}));

jest.mock('../../../../redux/slices/rfq', () => ({
  __esModule: true,
  setOverallKYCStatus: jest.fn(),
}));

jest.mock('../../utils/helper', () => ({
  __esModule: true,
  existingUserMessage: {
    bank: 'This is existing user message for bank',
  },
  trackKYCCheckpointEvt: jest.fn(),
  trackKYCErrorEvt: jest.fn(),
}));

jest.mock('../../utils/financialUtils', () => ({
  __esModule: true,
  accPrefixNote: 'Account prefix note',
  fieldOptions: [
    { value: 'savings', label: 'Savings Account' },
    { value: 'current', label: 'Current Account' },
  ],
  savingsBankAccountType: { value: 'savings', label: 'Savings Account' },
  handleNoteTxt: jest.fn(() => 'Handle note text'),
  bankSuccessNote: {
    title: 'Bank Account Verified Successfully',
    subtitle: 'Your bank account has been verified',
  },
  successAccountDetails: [
    { id: 'accountNo', label: 'Account Number' },
    { id: 'ifscCode', label: 'IFSC Code' },
    { id: 'accountType', label: 'Account Type' },
  ],
}));

import { callSuccessToast, callErrorToast } from '../../../../api/strapi';
import { getRetryCounts, handleVerifyDocument } from '../../../../api/rfqKyc';
import { useKycContext } from '../../../../contexts/kycContext';
import { trackEvent } from '../../../../utils/gtm';
import { trackKYCCheckpointEvt, trackKYCErrorEvt } from '../../utils/helper';
import { setOverallKYCStatus } from '../../../../redux/slices/rfq';
import { bytesToSize } from '../../../../utils/number';
import { postMessageToNativeOrFallback } from '../../../../utils/appHelpers';

const createMockStore = () => {
  return configureStore({
    reducer: {
      rfq: (state = {}, action) => state,
    },
  });
};

const mockKycContext = {
  updateCompletedKycSteps: jest.fn(),
  kycValues: {
    bank: {
      accountType: 'savings',
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      branchName: 'Test Branch',
      branchCity: 'Test City',
    },
  },
  completedKycSteps: [
    { name: 'bank', status: 0, isExistingData: false },
  ],
  ifscConfig: {
    ifscMatchArr: ['SBIN'],
    ifscNote: 'This is IFSC note',
  },
};

describe('Bank Component', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
    (useKycContext as jest.Mock).mockReturnValue(mockKycContext);
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <Bank />
      </Provider>
    );
  };

  test('should render component and track checkpoint event on mount', async() => {
    renderComponent();

    await waitFor(() => {
        expect(trackKYCCheckpointEvt).toHaveBeenCalledWith('bank');
        expect(postMessageToNativeOrFallback).toHaveBeenCalledWith('kycEvent', {
            kycStep: 'bank',
        });
        expect(screen.getByTestId('step-title')).toBeInTheDocument();
    })
  });

  test('should update account type when select changes', async () => {
    renderComponent();

    const selectElement = screen.getByTestId('grip-select');
    fireEvent.change(selectElement, { target: { value: 'current' } });

    await waitFor(() => {
      expect(selectElement).toHaveValue('current');
    });
  });

  test('should convert IFSC code to uppercase and show note for SBI', async () => {
    renderComponent();

    const ifscInput = screen.getByTestId('input-ifscCode');
    fireEvent.change(ifscInput, { target: { id: 'ifscCode', value: 'sbin0001234' } });

    await waitFor(() => {
      expect(ifscInput).toHaveValue('SBIN0001234');
      expect(screen.getByText('This is IFSC note')).toBeInTheDocument();
    });
  });

  test('should hide IFSC note for non-SBI banks', async () => {
    renderComponent();

    const ifscInput = screen.getByTestId('input-ifscCode');
    fireEvent.change(ifscInput, { target: { id: 'ifscCode', value: 'HDFC0001234' } });

    await waitFor(() => {
      expect(screen.queryByText('This is IFSC note')).not.toBeInTheDocument();
    });
  });

  test('should show validation errors for invalid inputs', async () => {
    (useKycContext as jest.Mock).mockReturnValue({
      ...mockKycContext,
      kycValues: { bank: {} },
    });

    renderComponent();

    const accountNoInput = screen.getByTestId('input-accountNo');
    const ifscInput = screen.getByTestId('input-ifscCode');

    fireEvent.change(accountNoInput, { target: { id: 'accountNo', value: '12345' } });
    fireEvent.change(ifscInput, { target: { id: 'ifscCode', value: 'INVALID' } });

    const footerButton = screen.getByTestId('footer-button');
    fireEvent.click(footerButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter valid account number')).toBeInTheDocument();
      expect(screen.getByText('Please enter valid IFSC code')).toBeInTheDocument();
    });
  });

  test('should verify bank account without SBI padding for non-SBI bank', async () => {
    const mockResponse = {
      branchName: 'HDFC Branch',
      accountName: 'Test Account',
    };

    (handleVerifyDocument as jest.Mock).mockResolvedValue(mockResponse);
    (useKycContext as jest.Mock).mockReturnValue({
      ...mockKycContext,
      kycValues: {
        bank: {
          accountType: 'savings',
          accountNumber: '1234567890123456',
          ifscCode: 'HDFC0001234',
        },
      },
    });

    renderComponent();

    const footerButton = screen.getByTestId('footer-button');
    fireEvent.click(footerButton);

    await waitFor(() => {
      expect(handleVerifyDocument).toHaveBeenCalledWith({
        docType: 'kyc',
        docSubType: 'cheque',
        docData: {
          ifscCode: 'HDFC0001234',
          accountNo: '1234567890123456',
          accountType: 'savings',
        },
      });
    });

    expect(screen.queryByText('Account prefix note')).not.toBeInTheDocument();
  });

  test('should handle empty response from handleVerifyDocument', async () => {
    (handleVerifyDocument as jest.Mock).mockResolvedValue({});

    renderComponent();

    const footerButton = screen.getByTestId('footer-button');
    fireEvent.click(footerButton);

    await waitFor(() => {
      expect(handleVerifyDocument).toHaveBeenCalled();
      expect(screen.queryByTestId('generic-modal')).not.toBeInTheDocument();
    });
  });

  test('should handle ZOOP_ERROR type', async () => {
    const mockError = { 
      heading: 'Zoop Error', 
      message: 'Zoop service failed', 
      type: 'ZOOP_ERROR' 
    };
    (handleVerifyDocument as jest.Mock).mockRejectedValue(mockError);
    (getRetryCounts as jest.Mock).mockResolvedValue({ kycChequeVerify: 1 });

    renderComponent();

    const footerButton = screen.getByTestId('footer-button');
    fireEvent.click(footerButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-card')).toBeInTheDocument();
      expect(screen.getByText('Zoop Error')).toBeInTheDocument();
    });
  });

  test('should handle document upload error with response data', async () => {
    const mockError = { heading: 'Error', message: 'Verification failed', type: 'retry' };
    (handleVerifyDocument as jest.Mock).mockRejectedValue(mockError);
    (getRetryCounts as jest.Mock).mockResolvedValue({ kycChequeVerify: 3 });

    renderComponent();

    const footerButton = screen.getByTestId('footer-button');
    fireEvent.click(footerButton);

    await waitFor(() => {
      expect(screen.getByTestId('doc-upload-form')).toBeInTheDocument();
    });

    const uploadErrorButton = screen.getByText('Upload Error');
    fireEvent.click(uploadErrorButton);

    await waitFor(() => {
      expect(trackKYCErrorEvt).toHaveBeenCalledWith({
        module: 'bank',
        error_heading: 'Error',
        error_type: 'retry',
        error_payload: expect.objectContaining({
          heading: 'Error',
          message: 'Upload failed',
        }),
      });
    });
  });

  test('should dispatch setOverallKYCStatus for existing users on successful verification', async () => {
    const mockResponse = {
      branchName: 'Test Branch',
      accountName: 'Test Account',
    };

    (handleVerifyDocument as jest.Mock).mockResolvedValue(mockResponse);
    (useKycContext as jest.Mock).mockReturnValue({
      ...mockKycContext,
      completedKycSteps: [
        { name: 'bank', status: 0, isExistingData: true },
      ],
    });

    const dispatchSpy = jest.fn();
    store.dispatch = dispatchSpy;

    renderComponent();

    const footerButton = screen.getByTestId('footer-button');
    fireEvent.click(footerButton);

    await waitFor(() => {
      expect(handleVerifyDocument).toHaveBeenCalled();
    }, { timeout: 4000 });

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(setOverallKYCStatus('bank'));
    }, { timeout: 4000 });
  });

  test('should handle re-enter button click', async () => {
    const mockError = { 
      heading: 'Error', 
      message: 'Verification failed', 
      type: 'BANK_VERIFY_ERROR' 
    };
    (handleVerifyDocument as jest.Mock).mockRejectedValue(mockError);
    (getRetryCounts as jest.Mock).mockResolvedValue({ kycChequeVerify: 1 });

    renderComponent();

    const footerButton = screen.getByTestId('footer-button');
    fireEvent.click(footerButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-card')).toBeInTheDocument();
    });

    const reEnterButton = screen.getByText('Re-enter Bank Account');
    fireEvent.click(reEnterButton);

    await waitFor(() => {
      expect(screen.queryByTestId('error-card')).not.toBeInTheDocument();
    });
  });

  test('should handle null kycValues', () => {
    (useKycContext as jest.Mock).mockReturnValue({
      ...mockKycContext,
      kycValues: null,
    });

    renderComponent();

    expect(screen.getByTestId('grip-select')).toHaveValue('savings');
    expect(screen.getByTestId('input-ifscCode')).toHaveValue('');
  });

  test('should handle null branch name and city', () => {
    (useKycContext as jest.Mock).mockReturnValue({
      ...mockKycContext,
      kycValues: {
        bank: {
          branchName: null,
          branchCity: null,
        },
      },
    });

    renderComponent();

    expect(screen.queryByText(/null/)).not.toBeInTheDocument();
  });

  test('should handle INVALID_DOCUMENT error type', async () => {
    const mockError = { 
      heading: 'Invalid Document', 
      message: 'Document is invalid', 
      type: 'INVALID_DOCUMENT' 
    };
    (handleVerifyDocument as jest.Mock).mockRejectedValue(mockError);
    (getRetryCounts as jest.Mock).mockResolvedValue({ kycChequeVerify: 1 });

    renderComponent();

    const footerButton = screen.getByTestId('footer-button');
    fireEvent.click(footerButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-card')).toBeInTheDocument();
      expect(screen.getByText('Re-upload document')).toBeInTheDocument();
    });
  });
});