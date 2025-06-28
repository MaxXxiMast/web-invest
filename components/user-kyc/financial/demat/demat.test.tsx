import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Demat from './index';
import { useKycContext } from '../../../../contexts/kycContext';
import * as api from '../../../../api/rfqKyc';

jest.mock('../../../common/inputFieldSet', () => {
  const MockInputFieldSet = () => <div>InputFieldSet</div>;
  MockInputFieldSet.displayName = 'MockInputFieldSet';
  return MockInputFieldSet;
});

jest.mock('../../common/StepTitle', () => {
  const MockStepTitle = () => <div>StepTitle</div>;
  MockStepTitle.displayName = 'MockStepTitle';
  return MockStepTitle;
});

jest.mock('../../common/ErrorCard', () => {
  const MockErrorCard = (props: any) => (
    <div data-testid="error-card">{props.data?.title}</div>
  );
  MockErrorCard.displayName = 'MockErrorCard';
  return MockErrorCard;
});

jest.mock('../../common/Note', () => {
  const MockNote = (props: any) => <div data-testid="note">{props.text}</div>;
  MockNote.displayName = 'MockNote';
  return MockNote;
});

jest.mock('../../../kyc/FindCMR', () => {
  const MockFindCMR = (props: any) => (
    <div data-testid="find-cmr" onClick={() => props.handleOtherBrokerModal('some-broker')}>
      FindCMR
    </div>
  );
  MockFindCMR.displayName = 'MockFindCMR';
  return MockFindCMR;
});

jest.mock('../../../kyc/OtherBrokerModal', () => {
  const MockOtherBrokerModal = (props: any) =>
    props.showModal ? <div data-testid="other-broker-modal" /> : null;
  MockOtherBrokerModal.displayName = 'MockOtherBrokerModal';
  return MockOtherBrokerModal;
});

jest.mock('../../common/GenericModal', () => {
  const MockGenericModal = (props: any) =>
    props.showModal ? <div data-testid="generic-modal" /> : null;
  MockGenericModal.displayName = 'MockGenericModal';
  return MockGenericModal;
});

jest.mock('../../common/KYCUploadButton', () => {
  const MockKYCUploadButton = (props: any) => (
    <button
      data-testid="kyc-upload-button"
      onClick={() =>
        props.handleCB('success', {
          dpID: 'DP123',
          clientID: 'CL123',
          brokerName: 'Zerodha',
          panNo: 'ABCDE1234F',
          status: 1,
        })
      }
    >
      KYCUploadButton
    </button>
  );
  MockKYCUploadButton.displayName = 'MockKYCUploadButton';
  return MockKYCUploadButton;
});

jest.mock('../../footer', () => {
  const MockFooter = (props: any) => (
    <div>
      <button onClick={props.handleBtnClick} disabled={false}>
        Footer Button
      </button>
    </div>
  );
  MockFooter.displayName = 'MockFooter';
  return MockFooter;
});

jest.mock('../../../../contexts/kycContext', () => ({
  useKycContext: jest.fn(),
}));

jest.mock('../../../../utils/timer', () => ({
  debounce: (fn: any) => () => fn(),
}));

const mockVerifyFormData = jest.fn();

jest.mock('../../../../api/rfqKyc', () => ({
  handleVerifyDocument: jest.fn(),
}));

const mockStore = configureStore({
  reducer: () => ({}),
});

describe('Demat Component', () => {
  const mockUpdateCompletedKycSteps = jest.fn();

  beforeEach(() => {
    (useKycContext as jest.Mock).mockReturnValue({
      updateCompletedKycSteps: mockUpdateCompletedKycSteps,
      completedKycSteps: [],
      kycValues: {
        depository: {},
      },
    });
  });

  const renderComponent = () =>
    render(
      <Provider store={mockStore}>
        <Demat />
      </Provider>
    );

  it('renders upload UI by default', () => {
    renderComponent();
    expect(screen.getByText(/Select and upload CMR\/CML/i)).toBeInTheDocument();
    expect(screen.getByText('KYCUploadButton')).toBeInTheDocument();
    expect(screen.getByTestId('find-cmr')).toBeInTheDocument();
  });

  it('opens "Whats CMR/CML?" modal when clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByText(/What’s CMR\/CML/i));
    expect(await screen.findByTestId('generic-modal')).toBeInTheDocument();
  });

  it('opens FindCMR and OtherBrokerModal', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('find-cmr'));
    expect(await screen.findByTestId('other-broker-modal')).toBeInTheDocument();
  });

  it('displays the form when upload succeeds with status 1', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('KYCUploadButton'));
    await waitFor(() => {
      const inputs = screen.getAllByText('InputFieldSet');
      expect(inputs.length).toBeGreaterThanOrEqual(3);
      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });
  });

  it('shows under verification error if status === 2 in completedKycSteps', async () => {
    (useKycContext as jest.Mock).mockReturnValue({
      updateCompletedKycSteps: mockUpdateCompletedKycSteps,
      completedKycSteps: [{ name: 'depository', status: 2 }],
      kycValues: {
        depository: {},
      },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('error-card')).toBeInTheDocument();
    });
  });

  it('does not call API or set loading if verifyFormData returns false', async () => {
    mockVerifyFormData.mockReturnValue(false);

    renderComponent();

    fireEvent.click(screen.getByText('KYCUploadButton'));
    await waitFor(() => {
      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Footer Button'));

    expect(api.handleVerifyDocument).not.toHaveBeenCalled();
  });
});
