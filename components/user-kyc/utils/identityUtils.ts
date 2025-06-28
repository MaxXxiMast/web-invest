import { ButtonType } from '../../primitives/Button';
import { AddressProofDTO, AddressStatusDTO, KycStepType } from './models';

export const identityKycSteps: KycStepType[] = ['pan', 'address'];

const addressFormat = [
  'address1',
  'address2',
  'address3',
  'city',
  'state',
  'pincode',
];

export const convertAddressUpdate = (data: Partial<AddressProofDTO>) => {
  const finalData = [];
  addressFormat.forEach((key) => {
    const value = data[key];
    if (value) {
      const finalValue = key === 'pincode' ? `- ${value}` : value;

      finalData.push(finalValue);
    }
  });
  return finalData.join(', ');
};

export const convertAddressFromStatus = (data: Partial<AddressStatusDTO>) => {
  return {
    permanent: {
      address1: data?.permanentAddress,
      address2: data?.permanentAddress2,
      address3: data?.permanentAddress3,
      city: data?.permanentCity,
      state: data?.permanentState,
      pincode: data?.permanentPincode,
      addressProofRef: data?.permanentAddressProofRef,
    },
    current: {
      address1: data?.currentAddress,
      address2: data?.currentAddress2,
      address3: data?.currentAddress3,
      city: data?.currentCity,
      state: data?.currentState,
      pincode: data?.currentPincode,
      addressProofRef: data?.currentAddressProofRef,
    },
  };
};

export type ConvertAddressFromStatusType = ReturnType<
  typeof convertAddressFromStatus
>;

const isValidAddress = (address: AddressProofDTO) => {
  return (
    address?.address1 && address?.city && address?.pincode && address?.state
  );
};

export const getAddressParamKey = (
  addressDetails: ConvertAddressFromStatusType
) => {
  if (isValidAddress(addressDetails.permanent)) {
    return 'permanent';
  } else if (isValidAddress(addressDetails.current)) {
    return 'current';
  } else {
    return 'digilocker';
  }
};

export const getAddressDetails = (data: any, isStatus = false) => {
  const finalData = isStatus ? convertAddressFromStatus(data) : data;
  const key = getAddressParamKey(finalData);

  if (key === 'digilocker') {
    return key;
  } else {
    return finalData[key];
  }
};

export const livenessInitError = {
  docFetchError: {
    title: 'We are unable to fetch your documents',
    message:
      'We are unable to fetch documents required to verify selfie at the moment. Please retry after sometime.',
  },
  initError: {
    title: 'There was an technical issue',
    message:
      'There was a problem with SDK initialization. We apologies for the inconvenience. Please try again',
  },
  btnText: 'Try Again',
};

export const livenessErrorStates = {
  locationDenied: {
    title: 'Capture Selfie',
    subtitle: 'Location permission has been denied',
    description1: 'Please make sure to ',
    description2: '',
    instructions: [
      'Allow location permission when requested',
      'If you are not getting the request, reset the permissions',
    ],
    tooltipInfo: 'Please note this is a SEBI requirement',
    styledLink: {
      title: 'Show me how to fix this',
      link: 'https://www.gripinvest.in/blog/how-do-i-enable-my-location-during-kyc-liveness-verification',
    },
    continueLater: 'I’ve turned my location on',
    nriOptions: '',
    variant: ButtonType.Primary,
  },
  locationDataError: {
    title: 'Capture Selfie',
    subtitle:
      'Your device or browser appears to have location turned off or lacks access',
    description1: 'Please make sure to ',
    description2: '',
    instructions: [
      'Turn ON the location service on your device.',
      'If the location is ON, allow your browser to access your location.',
    ],
    tooltipInfo: 'Please note this is a SEBI requirement',
    styledLink: {
      title: 'Show me how to fix this',
      link: 'https://www.gripinvest.in/blog/how-do-i-enable-my-location-during-kyc-liveness-verification',
    },
    continueLater: 'I’ve turned my location on',
    nriOptions: '',
    variant: ButtonType.Primary,
  },
  outOfIndia: {
    title: 'Capture Selfie',
    subtitle: 'Looks like you are located out of India',
    description1:
      'Norms don’t allow us to accept KYC from people residing outside India.',
    description2:
      'If you’re on a vacation or work trip, please complete KYC whenever you are back in India. ',
    instructions: [],
    tooltipInfo: '',
    styledLink: null,
    continueLater: 'Complete KYC when I’m back in India',
    nriOptions: '',
    variant: ButtonType.Primary,
  },
};

export const panErrorStates = {
  FETCH_ERROR: {
    heading: 'We couldn’t fetch your details from the KRA',
    message:
      'We are not able to verify your address information. We recommend you proceed with DigiLocker to complete this step.',
  },
  DOC_ERROR: {
    heading: 'Unsupported file format',
    message: 'Please check and re-upload document in the correct format.',
  },
};
