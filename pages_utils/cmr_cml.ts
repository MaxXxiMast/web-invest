import { getObjectClassNames } from '../components/utils/designUtils';
import { accountTypes } from '../utils/kyc';
import backIcon from '../icons/Arrow-Right.svg';
import hint from '../icons/Hint.svg';
import { mediaQueries } from '../components/utils/designSystem';

export const CMRHintData = `Client Master Report (CMR) or Client Master List (CML) is a document containing the client details such as Client ID and DP ID, customer name, address, bank account. It is used to verify the details provided. `;

export const cmrheader = {
  title: 'Upload CMR/CML',
  icon: backIcon,
  hints: {
    title: 'Hints',
    icon: hint,
  },
};

const classes: any = getObjectClassNames({
  fieldContainer: {
    marginBottom: 24,
    [mediaQueries.desktop]: {
      gap: 30,
    },
  },
  titleClass: {
    fontSize: 14,
    lineHeight: '24px',
    fontWeight: 600,
  },
  FieldNote: {
    marginTop: 0,
  },
});

export const depositoryOptions = [
  {
    value: 'NSDL',
    label: 'NSDL',
  },
  {
    value: 'CDSL',
    label: 'CDSL',
  },
];

export const failCardData = (errorType = '', data: any = '') => {
  let errorData: any = {
    title: 'CMR/CML',
    id: 'cmrCml',
    isErrorData: true,
  };
  if (errorType === 'PAN') {
    errorData.fields = [
      {
        id: 'cmr',
        type: 'Upload',
        failed: true,
        title: 'PAN is not matching',
        subTitle: `Please upload CMR/CML with PAN number: <strong>${data}</strong>`,
        btnArr: [
          {
            type: 'kyc',
            btnTxt: 'Update your KYC',
          },
          {
            type: 'cmr',
            btnTxt: 'Reupload CMR/CML',
          },
        ],
      },
    ];
  }
  if (errorType === 'BANK') {
    errorData.fields = [
      {
        id: 'cmr',
        type: 'Upload',
        failed: true,
        title: 'Bank account is not matching',
        subTitle: `Please upload CMR/CML with A/C number: <strong>${data}</strong>`,
        btnArr: [
          {
            type: 'cheque',
            btnTxt: 'Reupload Cheque',
          },
          {
            type: 'cmr',
            btnTxt: 'Reupload CMR/CML',
          },
        ],
      },
    ];
  }
  if (errorType === 'INVESTED') {
    errorData.fields = [
      {
        id: 'cmr',
        type: 'Upload',
        failed: true,
        title: 'PAN is not matching',
        subTitle: `Please upload CMR/CML with PAN number: <strong>${data}</strong>`,
        btnArr: [
          {
            type: 'cmr',
            btnTxt: 'Reupload CMR/CML',
          },
        ],
      },
    ];
  }

  return errorData;
};

export const accreditedPostUploadDataForm = {
  id: 'cmrCml',
  title: 'CMR/CML',
  isPreData: true,
  formData: [
    {
      title: 'CMR/CML',
      formDataHint: {
        hintLinkTitle: 'What’s CMR/CML?',
        hintModalContent:
          'Client Master Report (CMR) or Client Master List (CML) is a document containing the client details such as Client ID and DP ID, customer name, address, bank account. It is used to verify the details provided. ',
      },
      fields: [
        {
          id: 'cmr',
          type: 'Upload',
          title: 'Upload your CMR/CML',
          uploadNote: 'Please upload document which is not password protected',
          noteClass: classes.FieldNote,
        },
      ],
    },
  ],
};

export const postUploadDataForm = {
  id: 'cmrCml',
  title: 'CMR/CML',
  formData: [
    {
      fieldLayoutClass: classes.fieldContainer,
      title: 'CMR/CML',
      description: 'Please verify below data',
      fields: [],
    },
    {
      title: 'PAN Details',
      fieldLayoutClass: classes.fieldContainer,
      titleClass: classes.titleClass,
      fields: [
        {
          id: 'panNumber',
          type: 'Input',
          title: 'PAN Number',
          validation: 'panNumber',
        },
      ],
    },
    {
      title: 'Bank Details',
      id: 'bankAccountType',
      fieldLayoutClass: classes.fieldContainer,
      titleClass: classes.titleClass,
      fields: [
        {
          id: 'accountType',
          type: 'Select',
          title: 'Bank Account Type',
          options: accountTypes,
          isSmallHeight: true,
        },
        {
          id: 'accountNo',
          type: 'Input',
          title: 'Bank Account Number',
          validation: 'name',
        },
      ],
    },
    {
      fieldLayoutClass: classes.fieldContainer,
      titleClass: classes.titleClass,
      fields: [
        {
          id: 'micr',
          type: 'Input',
          title: 'MICR Code',
          validation: 'name',
        },
        {
          id: 'ifsc',
          type: 'Input',
          title: 'IFSC Code ',
          validation: 'name',
        },
      ],
    },
    {
      title: 'Demat Values',
      fieldLayoutClass: classes.fieldContainer,
      titleClass: classes.titleClass,
      fields: [
        {
          id: 'dpID',
          type: 'Input',
          title: 'DP ID',
          validation: 'name',
        },
        {
          id: 'clientID',
          type: 'Input',
          title: 'Client ID',
          validation: 'name',
        },
      ],
    },
  ],
};

export type AccordionItemType = {
  title: string;
  content: string;
  id?: string;
};

export const AccordionArr: AccordionItemType[] = [
  {
    title: 'Zerodha',
    content: `In Zerodha, login to Kite, Go to Console> Under Console >Go to Accounts>Under Accounts>Go to Documents. In the documents, Select Documents as ” Zerodha CMR Copy”. The CMR copy will be sent to your email id.`,
    id: 'zerodha',
  },
  {
    title: 'Upstox',
    content: `To obtain your CMR/CML copy, you need to raise a ticket with UPSTOX. Please use the following link to obtain your copy: <a href="https://help.upstox.com/support/tickets/new" target="_blank">Click here</a>`,
    id: 'upstox',
  },
  {
    title: 'Groww',
    content: `To obtain your CMR/CML copy, please login to your Groww account and go to the reports section to request a copy. Please follow this link for guidance:  <a href="https://groww.in/help/stocks/sx-reports/where-can-i-get-the-cmr-copy--90" target="_blank">Click here</a>`,
    id: 'groww',
  },
  {
    title: 'Angel One',
    content: `You can get your Client Master Report on your registered email ID directly using our mobile app/web. Follow these easy steps to download your report:
    <br/>
    <ul>
     <li>Visit the ‘Reports’ section </li>
     <li>Go to ‘Transactional Reports’ </li>
     <li>From the drop-down menu, select ‘Client Master (DP)’</li>
     <li>Click on ‘Email Report’</li>
     <li>You will get the report on your registered mail </li>
    </ul>
    `,
  },
  {
    title: 'ICICIdirect',
    content: `Login to ICICI Bank Internet Banking > Investments & Insurance > Demat > Click on Service Request > Click on Others > Request for Client Master List. You can request to receive the CML at your Communication address or registered email ID updated in the Demat account. <br/>
    Alternatively, you can call customer care on <a href="tel:18601231122">1860-123-1122</a> or write on <a href="mailto:helpdesk@icicidirect.com">helpdesk@icicidirect.com</a> for CML`,
  },
  {
    title: '5paisa',
    content: `Please reach out to <a href="mailto:support@5paisa.com" target="_blank">support@5paisa.com</a> to get your CMR copy`,
  },
  {
    title: 'Kotak Securities',
    content: `For obtaining Client Master Copy you can write to Kotak Securities at <a href="mailto:ks.demat@kotak.com" target="_blank">ks.demat@kotak.com</a>`,
  },
  {
    title: 'HDFC Securities',
    content: `To get your CMR/CML copy, you can simply call on 022-2834-6690 or you can email at <a href="mailto:services@hdfcsec.com" target="_blank">services@hdfcsec.com</a>`,
  },
];
