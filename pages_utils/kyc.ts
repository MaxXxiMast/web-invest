import backIcon from '../icons/Arrow-Right.svg';
import hint from '../icons/Hint.svg';

export const kycStepDataArr: any[] = [
  {
    id: 'pan',
    title: 'PAN Card',
  },
  {
    id: 'address',
    title: 'Address Proof',
    showVerification: true,
    disclaimer: 'Aadhaar Front and Back side maybe placed in the same document',
  },
  {
    id: 'bank',
    title: 'Bank Details',
    showVerification: true,
  },
  {
    id: 'other',
    title: 'Other Details',
  },
  {
    id: 'cmrCml',
    title: 'CMR/CML',
  },
];

export const header = {
  title: 'Complete KYC',
  icon: backIcon,
  hints: {
    title: 'Hints',
    icon: hint,
  },
};

export const actionButtons = {
  title: 'Next',
};

export const panActions = {
  ...actionButtons,
  title: 'Verify & Next',
};

export const modalData = {
  title: 'Documents are being verified...',
  subTitle: 'It will take just 60 seconds!',
  icon: 'homev2/under_verification.svg',
};

export const hintsData = [
  'Please upload a non-password protected file only',
  'Max file size 15MB',
];

export const failCardData = {
  formData: [
    {
      fields: [
        {
          id: 'reupload',
          type: 'Upload',
          failed: true,
          title: 'Unable to fetch the details',
          buttonText: 'Reupload',
        },
      ],
    },
  ],
};
