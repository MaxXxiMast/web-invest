import dayjs from 'dayjs';
import { skipManualVerificationForAOF } from './helper';
import { KycStepType, SelectModel } from './models';

export type NomineeData = {
  nomineeName?: string;
  nomineeRelation?: string;
  nomineeEmail?: string;
  nomineeDob?: string;
  nomineeAddress?: string;
};

export const nomineeKycSteps: KycStepType[] = [
  'aof',
  'nominee',
  'liveness',
  'signature',
  'depository',
];

export const UserNomineeRelation: SelectModel[] = [
  {
    value: 'Spouse',
    labelKey: 'Spouse',
  },
  {
    value: 'Son',
    labelKey: 'Son',
  },
  {
    value: 'Daughter',
    labelKey: 'Daughter',
  },
  {
    value: 'Father',
    labelKey: 'Father',
  },
  {
    value: 'Mother',
    labelKey: 'Mother',
  },
  {
    value: 'Brother',
    labelKey: 'Brother',
  },
  {
    value: 'Sister',
    labelKey: 'Sister',
  },
  {
    value: 'Grand Son',
    labelKey: 'Grand Son',
  },
  {
    value: 'Grand Daughter',
    labelKey: 'Grand Daughter',
  },
  {
    value: 'Grand Father',
    labelKey: 'Grand Father',
  },
  {
    value: 'Grand Mother',
    labelKey: 'Grand Mother',
  },
  {
    value: 'Not Provided',
    labelKey: 'Not Provided',
  },
  {
    value: 'Others',
    labelKey: 'Others',
  },
];

export const NomineeStatus = {
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
};

export const EsignInfo = {
  title: 'Final Step: You’re almost there!',
  description:
    'Simply finish filling out our pre-filled customer onboarding form to initiate your journey with us',
};

export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const nomineeNameRegex = /^[a-zA-Z\s]+$/;

export const findAge = (date: Date) => {
  const dob = new Date(date);
  const currentDate = new Date();
  const birthDay = dob.getDate();
  const currentDay = currentDate.getDate();
  const birthMonth = dob.getMonth();
  const currentMonth = currentDate.getMonth();

  let age = currentDate.getFullYear() - dob.getFullYear();

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    // The birthday hasn't occurred this year, so subtract 1 from the age
    age--;
  }
  return age;
};

export const nomineeDelayArr = [
  'Signing this document is just a step in the process and carries no obligations for you.',
  'Your choice and freedom to invest remain entirely in your hands!',
];

// AOF Generationg modal timer should be 200 miliseconds
export const AOF_GENERATING_MODAL_TIMER = 200;

// SKIP FOR Digilocker Manual Verification https://gripinvest.atlassian.net/browse/PT-15746
// SKIP FOR Demat Manual Verification - https://gripinvest.atlassian.net/browse/PT-15854
// Status API do not have manual verificaiton key resolved for address so checking status
export const isSkipManualVerification = (doc: any) => {
  return (
    (doc?.name === 'address' && doc.fields?.status === 2) ||
    (doc?.isKYCPendingVerification &&
      skipManualVerificationForAOF.includes(doc?.name))
  );
};

export const calculateAge = (birthdate: string) => {
  const birthDateObj = dayjs(birthdate, 'DD/MM/YYYY');
  const currentDate = dayjs();
  return currentDate.diff(birthDateObj, 'year');
};
