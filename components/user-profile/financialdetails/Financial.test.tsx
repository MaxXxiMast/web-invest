import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Financial from './index';

// Mock useAppSelector hook
jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));
import { useAppSelector } from '../../../redux/slices/hooks';

import { GlobalContext } from '../../../pages/_app';
import * as hooks from '../../../redux/slices/hooks';

// Mock useContext
const mockGlobalContext = {
  bank_form_url: 'https://bankform.example.com',
  demat_form_url: 'https://dematform.example.com',
};

// Mock Swiper components
const MockSwiper = ({ children }) => <div>{children}</div>;
MockSwiper.displayName = 'MockSwiper';

const MockSwiperSlide = ({ children }) => <div>{children}</div>;
MockSwiperSlide.displayName = 'MockSwiperSlide';

jest.mock('swiper/react', () => ({
  Swiper: MockSwiper,
  SwiperSlide: MockSwiperSlide,
}));

// Mock FormTitle
const MockFormTitle = ({ title, handleEditModal }) => (
  <button onClick={handleEditModal}>{title}</button>
);
MockFormTitle.displayName = 'MockFormTitle';

jest.mock('../../../components/user-profile/section-title', () => ({
  FormTitle: MockFormTitle,
}));

// Mock ValueFields
const MockValueField = ({ label, value }: any) => (
  <div data-testid="value-field">
    <strong>{label}:</strong> {value}
  </div>
);
MockValueField.displayName = 'MockValueField';

jest.mock('../value-fields', () => ({
  __esModule: true,
  default: ({ label, value }) => (
    <div>
      {label}: {value}
    </div>
  ),
}));

jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useContext: jest.fn(),
  };
});
import { useContext } from 'react';

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),

}));
// Mock subcomponents to simplify testing and focus on Financial logic
jest.mock('../section-title', () => ({
  FormTitle: ({ title, handleEditModal, showEditBtn, editData }: any) => (
    <div>
      <span>{title}</span>
      {showEditBtn && (
        <button
          onClick={handleEditModal}
          data-testid={`edit-btn-${editData.editTitle} details`}
        >
          Edit {title}
        </button>
      )}
    </div>
  ),
}));

// Add a display name to fix the ESLint error
const ValueFieldMock = ({ label, value }: any) => (
  <div data-testid="value-field">
    <strong>{label}:</strong> {value}
  </div>
);
ValueFieldMock.displayName = 'ValueFieldMock';

jest.mock('../value-fields', () => {
  const ValueFieldsComponent = ({ label, value }: any) => (
    <div data-testid="value-field">
      <strong>{label}:</strong> {value}
    </div>
  );
  ValueFieldsComponent.displayName = 'ValueFieldsComponent';
  return ValueFieldsComponent;
});

jest.mock('../../../redux/slices/hooks');

const mockUseAppSelector = (selectorFn) => {
  return selectorFn({
    user: {
      kycConfigStatus: {
        default: {
          kycTypes: [
            {
              name: 'pan',
              fields: { panHolderName: 'john doe', panNumber: 'ABCDE1234F' },
            },
            {
              name: 'bank',
              fields: {
                accountNumber: '1234567890',
                ifscCode: 'IFSC0001',
                accountType: 'Savings',
                status: 1,
              },
            },
            {
              name: 'depository',
              fields: {
                dpID: 'DP123',
                clientID: 'CL456',
                brokerName: 'BrokerX',
                status: 1,
              },
            },
          ],
        },
      },
      userData: {
        firstName: 'John',
        lastName: 'Doe',
        userID: 42,
        emailID: 'john@example.com',
        mobileCode: '+91',
        mobileNo: '9876543210',
      },
      uccStatus: { NSE: { ucc: 'UCC789' } },
    },
  });
};
describe('Financial Component', () => {
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    userID: 123,
    emailID: 'john@example.com',
    mobileCode: '+91',
    mobileNo: '9876543210',
  };
  const uccStatus = {
    NSE: { ucc: 'UCC123' },
  };
  const panData = {
    itdName: 'john doe',
    panNumber: 'ABCDE1234F',
  };
  const bankData = {
    accountNumber: '1234567890',
    ifscCode: 'IFSC0001',
    accountType: 'Savings',
    status: 1,
  };
  const depositoryData = {
    dpID: 'DP001',
    clientID: 'CL123',
    brokerName: 'BrokerX',
    status: 1,
  };

  beforeEach(() => {
    (useAppSelector as jest.Mock).mockImplementation((selectorFn) => {
      if (typeof selectorFn === 'function') {
        // Simulate state shape for user slice
        return selectorFn({
          user: {
            kycConfigStatus: {
              default: {
                kycTypes: [
                  { name: 'pan', fields: panData },
                  { name: 'bank', fields: bankData },
                  { name: 'depository', fields: depositoryData },
                ],
              },
            },
            userData,
            uccStatus,
          },
        });
      }
      return undefined;
    });

    (useContext as jest.Mock).mockReturnValue(mockGlobalContext);

    // Mock window.open
    jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders bank section if visibleFields includes "bank"', () => {
    render(<Financial visibleFields={['bank']} />);
    expect(screen.getByText('Bank Details')).toBeInTheDocument();
    expect(screen.getAllByTestId('value-field').length).toBe(3); // Account Number, IFSC Code, Account Type
  });

  test('renders depository section if visibleFields includes "depository"', () => {
    render(<Financial visibleFields={['depository']} />);
    expect(screen.getByText('Demat Details')).toBeInTheDocument();
    expect(screen.getAllByTestId('value-field').length).toBe(3); // DP ID, Client ID, Broker Name
  });

  test('renders both bank and depository if visibleFields includes both', () => {
    render(<Financial visibleFields={['bank', 'depository']} />);
    expect(screen.getByText('Bank Details')).toBeInTheDocument();
    expect(screen.getByText('Demat Details')).toBeInTheDocument();
  });

  test('does not render bank section if bank fields are missing or empty', () => {
    // Override bankData with empty fields
    (useAppSelector as jest.Mock).mockImplementationOnce((selectorFn) =>
      selectorFn({
        user: {
          kycConfigStatus: {
            default: {
              kycTypes: [
                { name: 'pan', fields: panData },
                { name: 'bank', fields: {} },
                { name: 'depository', fields: depositoryData },
              ],
            },
          },
          userData,
          uccStatus,
        },
      })
    );
    render(<Financial visibleFields={['bank']} />);
    expect(screen.queryByText('Bank Details')).not.toBeInTheDocument();
  });

  test('does not render depository section if depository fields are missing or empty', () => {
    // Override depositoryData with empty fields
    (useAppSelector as jest.Mock).mockImplementationOnce((selectorFn) =>
      selectorFn({
        user: {
          kycConfigStatus: {
            default: {
              kycTypes: [
                { name: 'pan', fields: panData },
                { name: 'bank', fields: bankData },
                { name: 'depository', fields: {} },
              ],
            },
          },
          userData,
          uccStatus,
        },
      })
    );
    render(<Financial visibleFields={['depository']} />);
    expect(screen.queryByText('Demat Details')).not.toBeInTheDocument();
  });

  test('clicking bank edit button opens the correct URL', () => {
    render(<Financial visibleFields={['bank']} />);
    const btn = screen.getByTestId('edit-btn-bank details');
    fireEvent.click(btn);

    const expectedParams = new URLSearchParams({
      user_name: 'John Doe',
      phn: '+919876543210',
      eml: 'john@example.com',
      pan_num: 'ABCDE1234F',
      ucc: 'UCC123',
      current_bank_account_num: bankData.accountNumber,
      current_bank_ifsc_num: bankData.ifscCode,
    }).toString();

    expect(window.open).toHaveBeenCalledWith(
      `${mockGlobalContext.bank_form_url}?${expectedParams}`,
      '_blank'
    );
  });

  test('clicking demat edit button opens the correct URL', () => {
    render(<Financial visibleFields={['depository']} />);
    const btn = screen.getByTestId('edit-btn-demat details');
    fireEvent.click(btn);

    const expectedParams = new URLSearchParams({
      user_name: 'John Doe',
      phn: '+919876543210',
      eml: 'john@example.com',
      pan_num: 'ABCDE1234F',
      ucc: 'UCC123',
      dp_id: depositoryData.dpID,
      client_id: depositoryData.clientID,
    }).toString();

    expect(window.open).toHaveBeenCalledWith(
      `${mockGlobalContext.demat_form_url}?${expectedParams}`,
      '_blank'
    );
  });

});