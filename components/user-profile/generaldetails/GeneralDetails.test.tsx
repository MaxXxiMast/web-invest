import { render, screen, fireEvent } from '@testing-library/react';
import General from '.';
import { useAppSelector } from '../../../redux/slices/hooks';
import { useRouter } from 'next/router';
import {
  nationalityValueToOptions,
  occupationEnum,
} from '../../user-kyc/utils/otherInfoUtils';
import { trackEvent } from '../../../utils/gtm';
import { getOverallDefaultKycStatus } from '../../../utils/discovery';

// Mock hooks and sub-components
jest.mock('../../../redux/slices/hooks');
jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../section-title', () => ({
  FormTitle: ({ title, handleEditModal, showEditBtn, editText }: any) => (
    <div onClick={handleEditModal} data-testid="form-title">
      {title}
      {editText && <span>{editText}</span>}
      {showEditBtn && <button>Edit</button>}
    </div>
  ),
}));
jest.mock('../value-fields', () => ({
  __esModule: true,
  default: ({ label, value }: any) => (
    <div>
      {label}: {value}
    </div>
  ),
}));
jest.mock('../identitydetails', () => ({
  __esModule: true,
  default: () => <div>IdentitySection</div>,
}));
jest.mock('../financialdetails', () => ({
  __esModule: true,
  default: () => <div>FinancialSection</div>,
}));
jest.mock('../nominee', () => ({
  __esModule: true,
  default: () => <div>NomineeSection</div>,
}));
jest.mock('../error-state-horizontal', () => ({
  __esModule: true,
  default: ({ showBtn }: any) =>
    showBtn ? <button>Let’s Do That</button> : null,
}));
// Mock utils
jest.mock('../../user-kyc/utils/otherInfoUtils', () => ({
  nationalityValueToOptions: jest.fn(),
  occupationEnum: {},
}));
jest.mock('../../../utils/gtm');
jest.mock('../../../utils/discovery');

describe('General component', () => {
  const mockRouterPush = jest.fn();
  beforeEach(() => {
    // router
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    // default user and kycConfigStatus
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: {
          userData: {
            firstName: 'A',
            lastName: 'B',
            emailID: 'a@b.com',
            mobileCode: '91',
            mobileNo: '12345',
            userID: 1,
          },
          kycConfigStatus: { default: { kycTypes: [] } },
        },
      };
      return selector(state);
    });
    // other utils
    (nationalityValueToOptions as jest.Mock).mockReturnValue('India');
    // reset and set occupationEnum mapping
    Object.keys(occupationEnum).forEach((key) => delete occupationEnum[key]);
    occupationEnum['dev'] = 'Developer';
    (getOverallDefaultKycStatus as jest.Mock).mockReturnValue('not_started');
    (trackEvent as jest.Mock).mockClear();
    mockRouterPush.mockClear();
  });

  it('renders contact details section', () => {
    render(<General />);
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText('Name: A B')).toBeInTheDocument();
    expect(screen.getByText('Email: a@b.com')).toBeInTheDocument();
    expect(screen.getByText('Phone: +91 12345')).toBeInTheDocument();
  });

  it('renders sub-sections in order', () => {
    render(<General />);
    const sections = screen.getAllByText(/Section/);
    expect(sections.map((s) => s.textContent)).toEqual([
      'IdentitySection',
      'FinancialSection',
      'IdentitySection',
      'NomineeSection',
    ]);
  });

  it('renders other details when fields present and handles edit', () => {
    // Provide one otherDetail with fields
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: {
          userData: {
            firstName: 'A',
            lastName: 'B',
            emailID: 'a@b.com',
            mobileCode: '91',
            mobileNo: '12345',
            userID: 2,
          },
          kycConfigStatus: {
            default: {
              kycTypes: [
                { name: 'pan', isKYCPendingVerification: false },
                {
                  name: 'other',
                  isKYCComplete: false,
                  fields: {
                    gender: 'M',
                    occupation: 'dev',
                    income: 100,
                    nationality: 'IN',
                    maritalStatus: 'Single',
                    motherMaidenName: 'X',
                  },
                },
              ],
            },
          },
        },
      };
      return selector(state);
    });
    render(<General />);
    expect(screen.getByText('Other Details')).toBeInTheDocument();
    expect(screen.getByText('Gender: Male')).toBeInTheDocument();
    expect(screen.getByText('Occupation: Developer')).toBeInTheDocument();
    expect(screen.getByText('Nationality: India')).toBeInTheDocument();

    // click Request Edit should track event and push
    const editButton = screen.getByText('Other Details');
    fireEvent.click(editButton);
    expect(trackEvent).toHaveBeenCalledWith('kyc_redirect', {
      page: 'profile',
      userID: 2,
      activeTab: 'otherEditAction',
    });
    expect(mockRouterPush).toHaveBeenCalledWith('/user-kyc');
  });

  it('toggles other edit modal when other complete', () => {
    // other details complete
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: {
          userData: {
            firstName: 'A',
            lastName: 'B',
            emailID: 'a@b.com',
            mobileCode: '91',
            mobileNo: '12345',
            userID: 3,
          },
          kycConfigStatus: {
            default: {
              kycTypes: [
                { name: 'pan', isKYCPendingVerification: false },
                { name: 'other', isKYCComplete: true, fields: { gender: 'F' } },
              ],
            },
          },
        },
      };
      return selector(state);
    });
    (getOverallDefaultKycStatus as jest.Mock).mockReturnValue('not_started');
    render(<General />);
    const title = screen.getByText('Other Details');
    fireEvent.click(title);
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
