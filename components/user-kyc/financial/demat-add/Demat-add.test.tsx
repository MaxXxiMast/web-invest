import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { useAppSelector } from '../../../../redux/slices/hooks';
import DematAdd from './index';

const MockReactPlayer = () => <div>Mocked React Player</div>;
MockReactPlayer.displayName = 'MockReactPlayer';

jest.mock('react-player', () => MockReactPlayer);
jest.mock('crypto-js', () => ({}));
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
  }),
}));
jest.mock('next/dynamic', () => (comp) => comp);

// Mock MUI
jest.mock('@mui/material', () => ({
  CircularProgress: () => <div>Loading...</div>,
}));

// Mock Common Components
jest.mock('../../../common/inputFieldSet', () => {
  const InputFieldSet = () => <div>InputFieldSet</div>;
  InputFieldSet.displayName = 'InputFieldSet';
  return InputFieldSet;
});

jest.mock('../../common/StepTitle', () => {
  const StepTitle = () => <div>StepTitle</div>;
  StepTitle.displayName = 'StepTitle';
  return StepTitle;
});

jest.mock('../../common/ErrorCard', () => {
  const ErrorCard = () => <div>ErrorCard</div>;
  ErrorCard.displayName = 'ErrorCard';
  return ErrorCard;
});

jest.mock('../../common/DematIDExplanation', () => {
  const DematIDExplanation = () => <div>DematIDExplanation</div>;
  DematIDExplanation.displayName = 'DematIDExplanation';
  return DematIDExplanation;
});

jest.mock('../../common/DematModal', () => {
  const DematModal = () => <div>DematModal</div>;
  DematModal.displayName = 'DematModal';
  return DematModal;
});

jest.mock('../../../primitives/AnimatedArrow', () => {
  const AnimatedArrow = () => <div>AnimatedArrow</div>;
  AnimatedArrow.displayName = 'AnimatedArrow';
  return AnimatedArrow;
});

jest.mock('../../../primitives/Image', () => {
  const Image = () => <div>Image</div>;
  Image.displayName = 'Image';
  return Image;
});

jest.mock('../../footer', () => {
  const LayoutFooter = () => <div>LayoutFooter</div>;
  LayoutFooter.displayName = 'LayoutFooter';
  return LayoutFooter;
});

jest.mock('../../common/StepIndicator', () => {
  const StepIndicator = () => <div>StepIndicator</div>;
  StepIndicator.displayName = 'StepIndicator';
  return StepIndicator;
});

jest.mock('../../nominee/AOFEsign', () => {
  const AOFEsign = () => <div>AOFEsign</div>;
  AOFEsign.displayName = 'AOFEsign';
  return AOFEsign;
});

jest.mock('../../common/ErrorPopup', () => {
  const ErrorPopup = () => <div>ErrorPopup</div>;
  ErrorPopup.displayName = 'ErrorPopup';
  return ErrorPopup;
});

jest.mock('../../common/KYCComplete', () => {
  const KYCComplete = () => <div>KYCComplete</div>;
  KYCComplete.displayName = 'KYCComplete';
  return KYCComplete;
});

jest.mock('../../common/NeedHelpModal', () => {
  const NeedHelpModal = () => <div>NeedHelpModal</div>;
  NeedHelpModal.displayName = 'NeedHelpModal';
  return NeedHelpModal;
});

// Mock Custom Hooks
jest.mock('../../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: () => true,
}));
jest.mock('../../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(() => ({})),
}));

// Mock Contexts
jest.mock('../../../../contexts/kycContext', () => ({
  useKycContext: () => ({
    activeStep: 1,
    setActiveStep: jest.fn(),
    steps: [],
    setSteps: jest.fn(),
    completedKycSteps: [
      { name: 'bank', status: 'failed' },
      { name: 'depository', status: 'failed' },
    ],
  }),
}));

// Mock Utils
jest.mock('../../../../utils/googleOauth', () => ({
  useGoogleLogin: jest.fn(),
}));
jest.mock('../../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: '',
  isContainSpecialCharacters: jest.fn(),
  isOnlyNumbersRegex: jest.fn(),
}));
jest.mock('../../utils/financialUtils', () => ({
  dematUnderVerificationMessage: jest.fn(),
  getDPIDDetails: jest.fn(),
  populateDematCards: jest.fn(),
}));
jest.mock('../../utils/models', () => ({
  DematAddDataModal: {},
  DematProcessResponseModel: {},
  ErrorCardType: {},
  ErrorModel: {},
}));
jest.mock('../../utils/helper', () => ({
  checkActiveStep: jest.fn(),
  checkSkipActiveStep: jest.fn(),
  isCompletedStep: jest.fn(),
  popupBlockedError: jest.fn(),
  trackKYCCheckpointEvt: jest.fn(),
  trackKYCErrorEvt: jest.fn(),
  trackKYCSuccessEvt: jest.fn(),
}));
jest.mock('../../identity/pan/utils', () => ({
  modalsData: [],
}));
jest.mock('../demat/utils', () => ({
  dematFormErrors: {},
}));
jest.mock('../../utils/NomineeUtils', () => ({
  AOF_GENERATING_MODAL_TIMER: 2000,
  isSkipManualVerification: jest.fn(),
  NomineeStatus: {
    success: {
      status: 'success',
      title: 'Your KYC is complete',
      subtitle:
        "Begin your investment journey with Grip's unique, regulated, rated offerings.",
      btnText: 'Explore Investment Opportunities',
      icon: 'check-circle.svg',
      lottieType: 'completed',
    },
    progress: {
      status: 'processing',
      title: 'Verifying your eSign',
      subtitle: 'It’ll take up to 10 seconds',
      btnText: '',
      icon: 'scan.svg',
      lottieType: 'verifying',
    },
    technicalError: {
      status: 'failureRedirection',
      title: 'There is some technical issue',
      subtitle: 'Please retry again',
      btnText: 'Try Later',
      icon: 'pepicon.svg',
      lottieType: 'warning',
    },
    verifyError: {
      status: 'failureRedirection',
      title: 'You cannot proceed as <Doc Name> is under manual verification',
      subtitle: 'We’ll notify you once the document is verified',
      btnText: 'Got it',
      icon: 'DangerTriangle.svg',
      lottieType: 'warning',
    },
    signMismatch: {
      status: 'failureMismatch',
      title: "Aadhaar used for eSign doesn't match with your details",
      subtitle:
        'Please retry with correct Aadhaar. Still facing issue? Reach out to us at invest@gripinvest.in',
      btnText: 'Re-initiate eSign',
      icon: 'DangerTriangle.svg',
      lottieType: 'warning',
    },
    underVerificationCompleteKYC: {
      status: 'success',
      title: 'Finalizing Your Account Setup!',
      subtitle:
        "Your account will be ready to go in just a couple of hours. We're putting the finishing touches on your verification.",
      btnText: 'Explore The Platform',
      icon: 'check-circle.svg',
      lottieType: 'completed',
    },
    generatingAOF: {
      status: 'generatingAOF',
      title: 'Final Step: You’re almost there!',
      subtitle: 'Preparing document for your eSign',
      icon: 'signature.svg',
    },
    addressBankUnderVF: {
      title: 'Thanks for submitting your details',
      subtitle: 'We will notify you as soon as your KYC is approved',
      btnText: 'Explore Assets',
    },
  },
}));
jest.mock('../../../../utils/timer', () => ({
  delay: jest.fn(),
}));
jest.mock('../../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
  trackEventPostMessageToNativeOrFallback: jest.fn(),
}));
jest.mock('../../../../utils/gripConnect', () => ({
  isGCOrder: jest.fn(),
}));
jest.mock('../../../../utils/constants', () => ({
  GripLogo: '',
}));
jest.mock('./utils', () => ({
  handleGcRedirect: jest.fn(),
  InvestmentDescription: {},
  isGmail: jest.fn(),
}));
jest.mock('../../common/DematModal/utils', () => ({
  DematCard: {},
  initDematcardData: {},
}));
jest.mock('../../../../utils/appHelpers', () => ({
  isRenderedInWebview: jest.fn(),
  postMessageToNativeOrFallback: jest.fn(),
}));
jest.mock('../../../../utils/userAgent', () => ({
  getOS: jest.fn(),
}));
jest.mock('../../../CommentBox/utils', () => ({
  handleRedirection: jest.fn(),
}));

// Mock Primitives
jest.mock('../../../primitives/TooltipCompoent/TooltipCompoent', () => {
  const TooltipComponent = () => <div>TooltipComponent</div>;
  TooltipComponent.displayName = 'TooltipComponent';
  return TooltipComponent;
});

jest.mock('../../../primitives/ParsingDocumentPopup/utils', () => ({
  gmailStepsArr: [],
}));
jest.mock('../../../primitives/Button', () => {
  const Button = ({ children }) => <button>{children}</button>;
  Button.ButtonType = {};
  return Button;
});

// Mock APIs
jest.mock('../../../../api/rfqKyc', () => ({
  aofVerify: jest.fn(),
  eSignAOF: jest.fn(),
  getECASFromGmail: jest.fn(),
  getRetryCounts: jest.fn(),
  handleKycStatus: jest.fn(),
  handleVerifyDemat: jest.fn(),
}));
jest.mock('../../../../api/strapi', () => ({
  callErrorToast: jest.fn(),
  fetchAPI: jest.fn(),
}));

// Mock CSS Modules
jest.mock('./DematAdd.module.css', () => ({}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));
jest.mock('pubsub-js', () => ({
  publish: jest.fn(),
}));
jest.mock('../../../../utils/gtm', () => ({
  trackKYCSuccessEvt: jest.fn(),
  trackKYCErrorEvt: jest.fn(),
  trackEvent: jest.fn(),
}));

jest.mock('../../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn().mockReturnValue([]),
}));

const mockData = {
  kycDetails: {
    loadingBank: true,
    aadhaar: {},
    pan: {},
    bank: {},
    ocrResponse: {},
    ckycLoading: false,
    bankWrongAttempts: 0,
    depository: {},
    depositoryData: {},
  },
  portfolio: {},
  portfolioLoading: true,
  repaymentLoading: false,
  hasAssetTaxSlabConsent: false,
  notifications: [],
  preferences: {},
  isDevAuthorized: false,
  pendingResignations: [],
  aifDocuments: [],
  kycConsent: [],
  depositoryDetails: {
    brokerName: '',
    dpName: '',
    isUpdate: false,
  },
  showAssetKycPopup: false,
  kycConfigStatus: {
    default: {
      isFilteredKYCComplete: false,
      configID: 1,
      kycTypes: [
        {
          isKYCComplete: true,
          name: 'pan',
          remarks: [],
          fields: {
            panNumber: 'AOMPU8701Q',
            dob: '28/08/2003',
            panHolderName: 'MOKSH UPADHYAY',
            status: 1,
            verified: 1,
            nomineeName: 'MAHESH UPADHYAY',
            flag: '2025-04-11T10:36:28.000Z',
            itdName: 'MOKSH UPADHYAY',
          },
          optionalFields: {
            filePath: null,
            fileName: null,
            substatus: null,
            seedingStatus: 1,
          },
          isKYCPendingVerification: false,
        },
        {
          isKYCComplete: false,
          name: 'bank',
          remarks: [
            'No value exist for bankName or is false',
            'No value exist for ifscCode or is false',
            'No value exist for accountName or is false',
            'No value exist for accountNumber or is false',
            'No value exist for branchName or is false',
            'No value exist for branchCity or is false',
            'No value exist for accountType or is false',
            'No value exist for status or is false',
            'No value exist for verified or is false',
            'No value exist for flag or is false',
          ],
          fields: {
            bankName: null,
            ifscCode: null,
            accountName: null,
            accountNumber: null,
            branchName: null,
            branchCity: null,
            accountType: null,
            status: null,
            verified: null,
            flag: null,
          },
          optionalFields: {
            substatus: null,
          },
          isKYCPendingVerification: false,
        },
        {
          isKYCComplete: false,
          name: 'depository',
          remarks: [
            'No value exist for dpName or is false',
            'No value exist for brokerName or is false',
            'No value exist for clientID or is false',
            'No value exist for dpID or is false',
            'No value exist for status or is false',
            'No value exist for verified or is false',
            'No value exist for flag or is false',
          ],
          fields: {
            dpName: null,
            brokerName: null,
            clientID: null,
            dpID: null,
            status: null,
            verified: null,
            flag: null,
          },
          optionalFields: {
            substatus: null,
          },
          isKYCPendingVerification: false,
        },
        {
          isKYCComplete: false,
          name: 'liveness',
          remarks: [
            'No value exist for status or is false',
            'No value exist for conf or is false',
            'No value exist for matchScore or is false',
            'No value exist for verified or is false',
          ],
          fields: {
            status: null,
            conf: null,
            matchScore: null,
            verified: null,
          },
          optionalFields: {
            substatus: null,
          },
          isKYCPendingVerification: false,
        },
        {
          isKYCComplete: false,
          name: 'aof',
          remarks: ['No value exist for status or is false'],
          fields: {
            status: null,
          },
          optionalFields: {},
          isKYCPendingVerification: false,
        },
        {
          isKYCComplete: true,
          name: 'address',
          remarks: [],
          fields: {
            permanentAddress: 'H N0-E-420 GALI N0-16 KHAJOORI KHAS',
            status: 1,
            permanentState: 'Delhi',
            permanentPincode: '110094',
            permanentAddressProofRef: 'XXXXXXXX0887',
            currentAddress: 'H N0-E-420 GALI N0-16 KHAJOORI KHAS',
            currentCity: 'KARAWAL NAGAR',
            currentState: 'Delhi',
            currentPincode: '110094',
            currentAddressProofRef: 'XXXXXXXX0887',
            userName: 'Moksh Upadhyay',
            kraStatus: 'approved',
            moduleType: 'aadhaar_xml',
            permanentCity: 'KARAWAL NAGAR',
            verified: 1,
          },
          optionalFields: {
            currentAddress2: 'Dayalpur,  , North East',
            currentAddress3: null,
            permanentAddress3: 'Dayalpur,  , North East',
            permanentAddress2: null,
            substatus: null,
            xmlStatus: 1,
          },
          isKYCPendingVerification: false,
        },
        {
          isKYCComplete: false,
          name: 'signature',
          remarks: ['No value exist for status or is false'],
          fields: {
            status: null,
          },
          optionalFields: {},
          isKYCPendingVerification: false,
        },
        {
          isKYCComplete: true,
          name: 'other',
          remarks: [],
          fields: {
            gender: 'M',
            income: 'BELOW 1 LAC',
            maritalStatus: 'unmarried',
            motherMaidenName: 'Dhana Devi',
            nationality: 'Indian',
            occupation: -1,
          },
          optionalFields: {
            qualification: 'Under Graduate',
          },
          isKYCPendingVerification: false,
        },
        {
          isKYCComplete: false,
          name: 'nominee',
          remarks: [
            'No value exist for nomineeName or is false',
            'No value exist for nomineeRelation or is false',
            'No value exist for nomineeDob or is false',
            'No value exist for nomineeEmail or is false',
          ],
          fields: {
            nomineeName: null,
            nomineeRelation: null,
            nomineeDob: null,
            nomineeEmail: null,
          },
          optionalFields: {},
          isKYCPendingVerification: false,
        },
      ],
      kycStatusLoaded: true,
    },
  },
  uccStatus: {},
  faceMatchRetryAttempt: 1,
  showTwoFAModal: false,
  isDOBVerifiedTwoFAModal: false,
  showLogginOutModal: false,
  isTimeLessThanThirtyMins: false,
  openPasswordPopup: false,
  userData: {
    userID: 743019,
    emailID: 'mokshupadhyay4@gmail.com',
    mobileNo: '9311806965',
    firstName: 'Moksh',
    lastName: 'Upadhyay',
    documents: [],
    dematNo: null,
    kycPanStatus: 1,
    kycAadhaarStatus: 0,
    kycBankStatus: 0,
    nomineeName: null,
    cheque: {
      status: '',
      subStatus: '',
    },
    residentialStatus: 'resident_indian',
    nomineeDob: null,
    photo: null,
    nomineeEmail: null,
    placeOfBirth: null,
    countryOfBirth: null,
    kycDone: 0,
    partnerType: 1,
    userCKyc: {
      ckycStatus: '',
    },
    aadhaar_back: '',
    aadhaar_front: '',
    nomineeAddress: null,
    userVan: '',
    userInvestedAssets: {
      LFDeals: false,
      IFDeals: false,
    },
    userType: 0,
    createdAt: '2025-03-26T05:17:45.000Z',
    ckycDisabled: false,
    walletAmount: 0,
    bill: null,
    driving_licence: null,
    other: null,
    ckycType: '',
    occupation: -1,
    nationality: 'india',
    din: null,
    tin: null,
    politicallyExposedPerson: 'no',
    mobileCode: 91,
    totalOrdersDuringDiwaliJackpot: 0,
    investmentData: {
      isUserFDInvested: false,
      isUserOBPPInvested: false,
      isInvested: false,
      totalInvestments: 0,
    },
    referralCode: 'MU00000C',
    dob: null,
    type: 1,
    status: 1,
    panName: null,
    nomineeRelation: null,
    esign: null,
    kycEsignStatus: 0,
    kycSkip: 0,
    enhancedKycEmailSent: 0,
    reporting: null,
    lastLoggedIn: null,
    zohoID: '163853000080283511',
    leadOwner: 412,
    referredBy: null,
    lastUpdateAt: '2025-04-11T10:36:28.000Z',
    deletedAt: null,
    created_at: '2025-03-26T05:17:45.000Z',
    last_update_at: '2025-04-11T10:36:28.000Z',
    deleted_at: null,
  },
  portfolioDiscoverData: {
    id: 0,
    xirr: 0,
    financeProductTypeOrCombined: '',
    totalInvestmentAmount: 0,
    totalReturnsReceived: 0,
    totalExpectedReturns: 0,
  },
  isUserFetching: true,
  notificationsLoading: true,
};

(useAppSelector as jest.Mock).mockImplementation((selectorFn) =>
  selectorFn({
    user: mockData,
    gcConfig: {
      gcUserId: '',
      gcData: {},
    },
  })
);

jest.mock('../../../../api/rfqKyc', () => ({
  aofVerify: jest.fn(() => Promise.resolve({})),
}));

const mockStore = configureStore({
  reducer: {
    // userKyc: (state = {}) => state,
    user: (state = {}) => state,
    gcConfig: (state = {}) => state,
  },
  preloadedState: {
    user: mockData,
    config: {
      showTwoFAModal: true,
    },
  },
});

describe('DematAdd Component', () => {
  // let mockPush;
  // let mockQuery;

  // const store = mockStore({
  //     userKyc: {
  //         completedKycSteps: [],
  //     },
  //     user: {
  //         userData: {
  //             firstName: 'Test',
  //         },
  //     },
  // });
  let mockPush;
  let mockQuery;

  const store = mockStore;

  beforeEach(() => {
    mockPush = jest.fn();
    mockQuery = { digio_doc_id: '123', status: 'success' };

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      query: mockQuery,
    });

    (Cookies.get as jest.Mock).mockReturnValue('123');
  });

  it('should render loader while waiting for demat screen decision', async () => {
    const { container } = render(
      <Provider store={store}>
        <DematAdd />
      </Provider>
    );

    // Initially, there should be a loader visible
    expect(container.querySelector('.flex-column')).toBeTruthy();
  });

  // it('should handle success modal and redirection', async () => {
  //     const { getByText } = render(<DematAdd />);

  //     // Simulate success status
  //     mockQuery.status = 'success';
  //     const successBtn = getByText('Okay'); // Assuming there's a button with text "Okay"
  //     fireEvent.click(successBtn);

  //     // After clicking 'Okay', check if the router pushes to '/discover'
  //     await waitFor(() => {
  //         expect(mockPush).toHaveBeenCalledWith('/discover');
  //     });
  // });

  // it('should handle eSign cancel event correctly', async () => {
  //     const { getByText } = render(<DematAdd />);

  //     // Simulate 'cancel' button of e-signature modal being clicked
  //     const cancelBtn = getByText('Cancel'); // Replace with actual text if different
  //     fireEvent.click(cancelBtn);

  //     await waitFor(() => {
  //         expect(track.trackKYCErrorEvt).toHaveBeenCalledWith({
  //             module: 'aof',
  //             error_heading: 'eSign Cancelled',
  //             error_type: 'aof_digio_error',
  //             error_payload: expect.anything(),
  //         });
  //     });
  // });

  // it('should handle popup error', async () => {
  //     const { getByText } = render(<DematAdd />);

  //     // Trigger popup error handling by invoking the error handler
  //     fireEvent.click(getByText('Trigger Popup Error')); // Replace with actual element to trigger error

  //     await waitFor(() => {
  //         expect(track.trackKYCErrorEvt).toHaveBeenCalledWith(
  //             expect.objectContaining({
  //                 module: 'aof',
  //                 error_type: 'popup_blocked_error',
  //             })
  //         );
  //     });
  // });

  // it('should handle API call failures with error tracking', async () => {
  //     const mockHandleKycStatus = jest.fn().mockRejectedValue(new Error('API failure'));
  //     const { getByText } = render(<DematAdd />);

  //     // Simulate a failure in the API call
  //     fireEvent.click(getByText('Trigger API Failure'));

  //     await waitFor(() => {
  //         expect(track.trackKYCErrorEvt).toHaveBeenCalledWith(
  //             expect.objectContaining({
  //                 error_heading: 'Technical Error',
  //                 error_type: 'aof_init_error',
  //             })
  //         );
  //     });
  // });

  // it('should correctly handle submitting multiple demat details', async () => {
  //     const mockHandleVerifyDemat = jest.fn().mockResolvedValue(true);
  //     const { getByText } = render(<DematAdd />);

  //     // Simulate submitting multiple demat details
  //     fireEvent.click(getByText('Submit Multiple Demat')); // Adjust with the actual text

  //     await waitFor(() => {
  //         expect(mockHandleVerifyDemat).toHaveBeenCalled();
  //     });
  // });

  // it('should render the AOF signature modal and handle its response', async () => {
  //     const { getByText } = render(<DematAdd />);

  //     // Trigger openDigioSignature function (which would show modal)
  //     fireEvent.click(getByText('Sign with Digio')); // Adjust this text according to actual button

  //     await waitFor(() => {
  //         expect(PubSub.publish).toHaveBeenCalledWith('openDigio', expect.any(Object));
  //     });
  // });

  // it('should handle multiple demat modal actions', async () => {
  //     const { getByText } = render(<DematAdd />);

  //     // Simulate closing multiple demat modal
  //     fireEvent.click(getByText('Close Multiple Demat Modal'));

  //     await waitFor(() => {
  //         expect(mockPush).toHaveBeenCalledWith('/discover');
  //     });
  // });

  // it('should display error popup when popupBlockedError is triggered', async () => {
  //     const { getByText } = render(<DematAdd />);

  //     // Simulate triggering popup error
  //     fireEvent.click(getByText('Trigger Error'));

  //     await waitFor(() => {
  //         expect(getByText('Add Nominee')).toBeTruthy(); // Check if the popup error modal is displayed
  //     });
  // });
});
