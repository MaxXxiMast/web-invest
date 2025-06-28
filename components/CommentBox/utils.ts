import { SelectModel } from '../user-kyc/utils/models';
import { isGCOrder } from '../../utils/gripConnect';

export const defaultOptions: SelectModel[] = [
  {
    value: 'poa',
    labelKey: 'KRA/Aadhaar/DigiLocker',
  },
  {
    value: 'liveness',
    labelKey: 'Liveness',
  },
  {
    value: 'signature',
    labelKey: 'Signature',
  },
  {
    value: 'bank',
    labelKey: 'Bank',
  },
  {
    value: 'demat',
    labelKey: 'Demat',
  },
  {
    value: 'other_details',
    labelKey: 'Other Details',
  },
  {
    value: 'nominee_details',
    labelKey: 'Nominee Details',
  },
  {
    value: 'aof',
    labelKey: 'eSign Onboarding Form',
  },
];

export const stepSortingArr = [
  {
    name: 'address',
  },
  {
    name: 'bank',
  },
  {
    name: 'other',
  },
  {
    name: 'nominee',
  },
  {
    name: 'liveness',
  },
  {
    name: 'signature',
  },
  {
    name: 'depository',
  },
  {
    name: 'aof',
  },
];

export const sortingEntryBannerArr = (arr) => {
  return arr.sort((a, b) => {
    return (
      stepSortingArr.findIndex((p) => p?.name === a?.name) -
      stepSortingArr.findIndex((p) => p?.name === b?.name)
    );
  });
};

export const maxLengthComment = 500;

export const handleRedirection = (gcCallbackUrl: string) => {
  const excludePages = ['/demat-processing', 'GCpage', 'user-kyc'];
  const lastVisitedPage = sessionStorage.getItem('lastVisitedPage') as string;

  const urlArray = lastVisitedPage?.split('/') || [];
  const defaultRedirect = '/assets';
  const isGC = isGCOrder();

  if (isGC && urlArray?.includes('external-ui')) {
    return gcCallbackUrl || defaultRedirect;
  }

  // IF KYC Accessed directly
  if (excludePages.includes(lastVisitedPage)) {
    return defaultRedirect;
  }

  if (lastVisitedPage?.includes('kyc-processing')) {
    // this is happening in user-kyc when user is redirected from Digilocker callback "kyc-processing" page
    return isGC ? defaultRedirect : '/discover';
  }

  return lastVisitedPage || defaultRedirect;
};
