export type SidebarEntity = {
  name: string;
  id: SectionType;
  gcId: string;
  icon?: any;
  showInMobile?: boolean;
};

export type SectionType =
  | 'accountdetails'
  | 'mydocuments'
  | 'wealthmanager'
  | 'support'
  | 'preferences'
  | 'termsandconditions'
  | 'signOut'
  | 'mytransactions';

export const sidebarArr: SidebarEntity[] = [
  {
    name: 'Account Details',
    id: 'accountdetails',
    icon: 'icons/user-frame.svg',
    gcId: 'accountDetails',
  },
  {
    name: 'My Transactions',
    id: 'mytransactions',
    icon: 'commons/TransactionIcon.svg',
    gcId: 'myTransactions',
  },
  {
    name: 'My Documents',
    id: 'mydocuments',
    icon: 'icons/document.svg',
    gcId: 'myDocuments',
  },
  {
    name: 'Support',
    id: 'support',
    icon: 'icons/support.svg',
    gcId: 'support',
  },
  {
    name: 'Preferences',
    id: 'preferences',
    icon: 'icons/bell.svg',
    showInMobile: true,
    gcId: 'preferences',
  },
  {
    name: 'Terms and Privacy Policies',
    id: 'termsandconditions',
    icon: 'icons/book-open-text.svg',
    gcId: 'tnc',
  },
  {
    name: 'Log Out',
    id: 'signOut',
    showInMobile: true,
    icon: 'icons/log-out.svg',
    gcId: 'signOut',
  },
];

export const namingOfDocuments = {
  aadhaar: 'Aadhaar',
  aof: 'Account Opening Form',
  depository: 'CMR/CML',
  photo: 'Photo',
  pan: 'PAN',
  signature: 'Signature',
  cheque: 'Cancelled Cheque',
  liveness: 'Photo',
  driving_licence: 'Driving Licence',
  aadhaar_back: 'Aadhaar Back',
  aadhaar_front: 'Aadhaar Front',
  vault: 'Vault Statement',
};
