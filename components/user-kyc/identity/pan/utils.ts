import { PanDataModal } from '../../utils/models';

export const modalsData = {
  pan: {
    title: 'Fetching PAN Details',
    subTitle: 'It will take just 10 seconds!',
    icon: 'homev2/under_verification.svg',
    lottieType: 'verifying',
  },
  panVerify: {
    title: 'Verifying PAN Details',
    lottieType: 'verifying',
  },
  pep: {
    title: 'We do not support PEP accounts as of now',
    icon: 'pepicon.svg',
    lottieType: 'warning',
  },
  kra: {
    title: 'Fetching address details from SEBI-authorised KRAs',
    subTitle: 'It will take just 20 seconds!',
    lottieType: 'verifying',
  },
  kraError: {
    title: 'Information not found with KYC Registration Agencies',
    icon: 'DangerTriangle.svg',
    lottiType: 'warning',
  },
  cheque: {
    title: 'Verifying Banking Information',
    subTitle: 'It will take just 10 seconds!',
    icon: 'homev2/under_verification.svg',
    lottieType: 'verifying',
  },
  depository: {
    title: 'Processing your DEMAT info',
    subTitle: 'It will take just 10 seconds!',
    icon: 'homev2/under_verification.svg',
    lottieType: 'verifying',
  },
  digilocker: {
    title: 'Redirecting you to DigiLocker',
    subTitle: 'It will take just 20 seconds!',
  },
  demat: {
    title: 'Checking details with Depository',
    subTitle: 'It will take just 10 seconds!',
  },
  dematVerified: {
    title: 'Demat details Verified',
    subTitle: 'Redirecting you to next step...',
    icon: 'check-circle.svg',
    lottieType: 'completed',
  },
  aadhaar: {
    title: 'Fetching your details',
    subTitle: 'It will take just 10 seconds!',
    lottieType: 'verifying',
  },
  aadhaarVerified: {
    title: 'Address Details Fetched',
    subTitle: 'Redirecting you to next step...',
    lottieType: 'completed',
  },
  eCAS: {
    title: 'Fetching your eCAS details',
    subTitle: 'It will take just 10 seconds!',
    lottieType: 'verifying',
  },
  panVerified: {
    title: 'PAN Verified',
    subtitle: `Redirecting to next step...`,
    icon: 'check-circle.svg',
    lottieType: 'completed',
  },
};

const panNumberRegex = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;

const isValidPanNumber = (panNumber: string) => {
  return panNumberRegex.test(panNumber);
};

type PanFormValidator<T> = Record<
  keyof Omit<PanDataModal, 'name' | 'date' | 'nominee'>,
  T
>;

export const formValidators: PanFormValidator<Function> = {
  panNo: isValidPanNumber,
};

export const formErrorMessages: PanFormValidator<string> = {
  panNo: 'Invalid pan number',
};

export const panUnderVerificationMessage = {
  heading: 'PAN Under Verification!',
  message: 'You will receive update from us in 2-3 working days',
};

export const contactDetailsMessages = {
  underVerification: {
    title: 'You can reach out to our team for assistance',
    email: 'invest@gripinvest.in',
  },
  NON_INDIVIDUAL_PAN_ERROR: {
    title: 'Want to Register as a Non-Individual Investor?',
    email: 'invest@gripinvest.in',
  },
  EXISTING_PAN_NOT_VALID_ERROR: {
    title: 'Need help regarding the error?',
    email: 'invest@gripinvest.in',
  },
};

export const InvalidPanErr = `Please check if your PAN is valid <a href="https://incometaxindia.gov.in/Pages/tax-services/online-pan-verification.aspx" target="_blank">here</a>`;

export const panUnderAgeError = {
  heading: 'Age Criteria Not Met',
  message:
    'The PAN number you entered indicates you are under 18 years of age. Access is available for individuals who are 18 years or older.',
};

export const panHintsData = [
  'You can email us your PAN no. if you don’t have the soft copy handy',
];
