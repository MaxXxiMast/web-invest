import { mediaQueries } from '../components/utils/designSystem';
import { getObjectClassNames } from '../components/utils/designUtils';
import { accountTypes } from '../utils/kyc';

const classes: any = getObjectClassNames({
  bankAccountType: {
    marginBottom: 32,
  },
  bankAccountDetails: {
    [mediaQueries.nonPhone]: {
      gap: 'unset',
    },
  },
  uploadCheque: {
    marginTop: 20,
  },
  accountTypeContainer: {
    marginBottom: 20,
  },
  ChequeUploadBonds: {
    marginBottom: 20,
    [mediaQueries.desktop]: {
      '& > div': {
        width: '100% !important',
        maxWidth: 360,
      },
    },
  },
});

export const postUploadDataForm = {
  formData: [
    {
      fieldLayoutClass: classes.bankAccountType,
      id: 'bankAccountType',
      title: 'Bank Details',
      fields: [
        {
          id: 'accountType',
          type: 'Select',
          title: 'Bank Account Type',
          options: accountTypes,
          isSmallHeight: true,
        },
      ],
    },
    {
      fieldLayoutClass: classes.bankAccountDetails,
      id: 'bankAccountDetails',
      title: 'Account Details',
      fields: [
        {
          id: 'accountNo',
          type: 'Input',
          title: 'Account Number',
          validation: 'number',
        },
        {
          id: 'ifsc',
          type: 'Input',
          title: 'IFSC Code',
          validation: 'number',
          loader: 'showIFSCLoader',
          large: true,
        },
      ],
    },
    {
      fieldLayoutClass: classes.uploadCheque,
      fields: [
        {
          id: 'manualUploadCheque',
          type: 'text',
          title: 'Upload Cheque',
          clickable: true,
          hideWhenTrue: ['accredited', 'accountVerified'],
        },
      ],
    },
  ],
};

export const uploadFormData = {
  id: 'bank',
  title: 'Bank Details',
  formData: [
    {
      fieldLayoutClass: classes.accountTypeContainer,
      title: 'Bank Details',
      fields: [
        {
          id: 'accountType',
          type: 'Select',
          title: 'Bank Account Type',
          options: accountTypes,
          isSmallHeight: true,
        },
      ],
    },
    {
      fieldLayoutClass: classes.accountDetails,
      title: 'Account Details',
      fields: [
        {
          id: 'cheque',
          type: 'Upload',
          title: 'Upload Cancelled Cheque',
        },
      ],
    },
    {
      fieldLayoutClass: classes.uploadCheque,
      fields: [
        {
          id: 'manualUpdateBank',
          type: 'text',
          title: 'Enter Details Manually',
          clickable: true,
          hideWhenTrue: ['accredited', 'accountVerified', 'disableManualInput'],
        },
      ],
    },
  ],
};

export const uploadWithPanPendingFormData = {
  id: 'bank',
  title: 'Bank Details',
  formData: [
    {
      fieldLayoutClass: classes.accountTypeContainer,
      title: 'Bank Details',
      fields: [
        {
          id: 'accountType',
          type: 'Select',
          title: 'Bank Account Type',
          options: accountTypes,
          isSmallHeight: true,
        },
      ],
    },
    {
      fieldLayoutClass: classes.accountDetails,
      title: 'Account Details',
      fields: [
        {
          id: 'cheque',
          type: 'Upload',
          title: 'Upload Cancelled Cheque',
        },
      ],
    },
  ],
};
