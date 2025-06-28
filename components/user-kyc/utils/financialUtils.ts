import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { KycStepType } from './models';

export const financialKycSteps: KycStepType[] = ['bank'];

const currentBankAccountType = {
  labelKey: 'Current account',
  value: 'current account',
};
export const savingsBankAccountType = {
  labelKey: 'Savings account',
  value: 'savings account',
};
const otherBankAccountType = { labelKey: 'Other', value: 'other' };

export const fieldOptions = [
  currentBankAccountType,
  savingsBankAccountType,
  otherBankAccountType,
];

export const UploadBtnData = {
  bank_statement: {
    btnTxt: 'Upload Bank Statement',
    note: 'Make sure the file is not password protected',
  },
  cheque: {
    btnTxt: 'Upload Cancelled Cheque',
    note: '',
  },
  net_banking_screenshot: {
    btnTxt: 'Upload Net Banking Screenshot',
    note: 'Net Banking screenshot must include Account # and IFSC Code',
  },
  demat: {
    btnTxt: 'Upload CMR/CML',
    note: 'Make sure the file is not password protected',
  },
};

export const handleNoteTxt = () => {
  return `Please note, this must be the account you use to make future investments on Grip`;
};

export const dematUnderVerificationMessage = {
  heading: 'Demat Under Verification!',
  message:
    'You will receive an email when Demat gets verified by the internal team',
};

export const getOCRPanNumber = (ocrResponse: any) => {
  return ocrResponse?.firstHolderPan?.value;
};

export const accPrefixNote = `As you have a State Bank of India account, we have pre-fixed zeros to the account number to make it compliant with our 17 digit reporting format. This will not impact the processing of your returns.`;

export const bankSuccessNote = {
  status: 'success',
  title: 'Banking Details Verified',
  subtitle: `Redirecting to next step...`,
};

export const successAccountDetails = [
  { id: 'accountName', label: 'Account Name' },
  { id: 'accountNo', label: 'Account Number' },
  { id: 'accountType', label: 'Account type' },
  { id: 'ifscCode', label: 'IFSC' },
  { id: 'branchName', label: 'Branch' },
];

// DP ID matchers according to company
const dpIDMatchers = {
  zerodha: {
    matchers: [
      '12081601',
      '12081600',
      '21081600',
      '12345678',
      '27412830',
      'IN304287',
    ],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/Zerodha.png`,
  },
  grow: {
    matchers: ['12088700', '12088702', '12088701', '12058700', '12068700'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/Groww.png`,
  },
  upstock: {
    matchers: ['12081800', '12081801'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/Upstocks.png`,
  },
  angelOne: {
    matchers: ['12033200', '12033203', '12033201', '12033202'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/angelOne.png`,
  },
  hdfc: {
    matchers: [
      'IN300126',
      'IN300476',
      'IN300601',
      'IN301151',
      'IN301436',
      'IN301549',
      'IN304279',
      '13012400',
      '12086700',
      '12095000',
      '13020700',
      '12000003',
      '12000200',
    ],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/hfdc.png`,
  },
  kotak: {
    matchers: [
      'IN300610',
      'IN301410',
      'IN302814',
      'IN303173',
      'IN300214',
      'lN300214',
      '53187361',
      '12025100',
      '12041100',
      '12025100',
    ],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/kotak.png`,
  },
  oswal: {
    matchers: [
      'IN301838',
      'IN301740',
      'IN303001',
      'IN302978',
      'IN301862',
      'IN301565',
      '12053000',
      '12010910',
      '12010904',
      '12010909',
      '12010919',
      '12010924',
      '12000114',
      '12010900',
      '12010907',
      '12010926',
    ],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/oswal.png`,
  },
  paisa: {
    matchers: ['12082500'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/paisa.png`,
  },
  dhan: {
    matchers: ['12029900', 'IN302236', '12083400'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/dhan.png`,
  },
  iifl: {
    matchers: ['12044700', '13014400', 'IN302269', 'IN300394'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/iifl.png`,
  },
  icici: {
    matchers: [
      '16014301',
      'IN303028',
      'IN302902',
      'IN301348',
      'IN302679',
      'IN300183',
      '12300183',
    ],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/icic.png`,
  },
  indmoney: {
    matchers: ['12095500'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/indMoney.png`,
  },
  sharekhan: {
    matchers: ['12036000'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/shareKhan.png`,
  },
  axis: {
    matchers: ['IN300484', 'IN300685', 'IN304295', '12027500', '12049200'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/axis.png`,
  },
  mirae: {
    matchers: ['12092900'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/mirae.png`,
  },
  sbi: {
    matchers: [
      'IN303786',
      'IN302531',
      'IN301397',
      'IN300351',
      'IN300765',
      'IN301047',
      'IN301119',
      'IN301217',
      'IN301284',
      'IN301305',
      'IN301444',
      'IN302759',
      'IN303124',
      'IN306114',
      '12063100',
      '12019300',
      '12047200',
    ],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/sbi.png`,
  },
  finvasia: {
    matchers: ['12084300'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/finvasia.png`,
  },
  edelweiss: {
    matchers: ['12032300'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/edelweiss.png`,
  },
  njIndia: {
    matchers: ['12064200', 'IN304262'],
    icon: `${GRIP_INVEST_BUCKET_URL}brokers/njIndia.png`,
  },
};

/**
 * GET clientID and dpID from the demat number
 * @param dematID DematID of the user
 * @returns returns the clientID and dpID
 */
const getDPAndClientID = (dematID: string) => ({
  clientID: dematID?.slice(8),
  dpID: dematID?.slice(0, 8),
});

/**
 *
 * @param dematID DematID of the user
 * @returns returns the logo of broker
 */
export const getDPIDDetails = (dematID: string) => {
  const { dpID } = getDPAndClientID(dematID);
  if (!dpID) return '';

  for (const { matchers, icon } of Object.values(dpIDMatchers)) {
    if (matchers.includes(dpID)) return icon;
  }
};

export const populateDematDetails = {
  brokerDetails: {
    heading: '*',
    description: '*',
    populate: {
      headerImage: {
        populate: '*',
      },
      descriptionImage: {
        populate: '*',
      },
      link: {
        populate: '*',
      },
    },
  },
};

export const populateDematCards = {
  DematCards: {
    populate: {
      icon: '*',
      subHeaderImg: '*',
      modalContent: {
        populate: {
          headerImage: {
            populate: '*',
          },
          descriptionImage: {
            populate: '*',
          },
          link: {
            populate: '*',
          },
        },
      },
    },
  },
};

export const noDematAccountData = [
  {
    heading: `I don't have a Demat account, how do I proceed?`,
    subHeading:
      "No worries, it's easy and in-expensive to open one. 12+ cr Indian's now have Demat accounts and it allows them to invest in a variety of products. You can open a Demat account with brokers like Zerodha or Groww. Alternatively write to us at <a href='mailto:invest@gripinvest.in' target='_blank' rel='noreferrer'> support@gripinvest.in</a> and open a Demat account with our preferred partner.",
  },
];

export const otherBrokersDetail = [
  'You can find your Demat/BO ID in the profile section of your Broker’s online portal',
  'You can also check for Demat details on the Account Statement shared by your broker or NSDL or CDSL over your email registered with the broker',
  'Alretnatively, reach out to your broker’s customer support requesting the Demat account details or CMR/CML',
];
