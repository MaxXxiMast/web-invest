export type DematErrorType = 'pan_mismatch' | '';

export const dematErrorMessages = {
  pan_mismatch: {
    title: 'PAN is not matching',
    message:
      'Please upload the CMR/CML Document which mentions the same PAN you provided earlier',
  },
};

export const cmrNote = {
  title: 'What is CMR/CML',
  subTitle: `Client Master Report (CMR) or Client Master List (CML) is a document provided by your stock broker containing details of your demat account such as Client ID, DP ID, customer name, address and bank account.`,
};

export const dematEraseDetail = {
  title: 'Editing these details would erase existing Demat details',
  subTitle: `You’ll have to upload CMR/CML again`,
};

//Client ID has 8 characters numeric only, No apace / special character allowed
export const clientIDRegex = Object.freeze(/^[0-9]{8}$/);

//DP ID has 8 characters Alphanumeric, Alphabets Allowed I for India and N for Nagpur
export const dpIDRegex = Object.freeze(/^[IN0-9]{8}$/);

// DP ID Regex for first 9 characters
export const newDpIDRegex = Object.freeze(/^[a-zA-Z0-9]{2}[0-9]{6}$/);

export const dematFormErrors = {
  clientErrorMsg:
    'Last 8 characters of your BO Id or Full Demat Account Number',
  dpIDErrorMsg: 'First 8 characters of your BO Id or Full Demat Account Number',
  dematIDError: 'Only first 2 characters can be alphabets',
  specialChar: 'Special characters are not allowed',
  DP_ID_MISMATCH_ERROR: {
    type: 'underVerification',
    heading: 'Incorrect Demat Details',
    message:
      'Please provide correct DP ID. Ensure Demat ID is entered correctly with DP ID followed by Client ID',
  },
  CLIENT_ID_MISMATCH_ERROR: {
    type: 'underVerification',
    heading: 'Incorrect Demat Details',
    message:
      'Please provide correct Client ID. Ensure Demat ID is entered correctly with DP ID followed by Client ID',
  },
  DEMAT_DETAILS_MISMATCH_ERROR: {
    type: 'underVerification',
    heading: 'Invalid Demat details. Please check and provide correct details',
    message:
      'Please ensure your PAN is linked to the Demat account information you are adding here',
  },
  ACCOUNT_SUSPENDED_ERROR: {
    type: 'error',
    heading: 'Demat account is suspended.',
    message:
      'Please connect with your broker/DP and try again or try with another Demat account',
  },
  ACCOUNT_CLOSED_ERROR: {
    type: 'error',
    heading: 'Demat account is closed.',
    message: 'Please provide details of active demat account',
  },
  TIMEOUT_ERROR: {
    type: 'underVerification',
    heading: 'We faced error while fetching your details',
    message: 'This happens rarely, please try again',
  },
};
