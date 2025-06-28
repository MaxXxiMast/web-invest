import dayjs from 'dayjs';
import { getMaturityDate, getMaturityMonths, isMldProduct } from './asset';
import { financeProductTypeConstants } from './financeProductTypes';
import { BONDS_TOOLTIPS } from './bonds';
import { numberToIndianCurrencyWithDecimals, roundOff } from './number';

// UPI regex
export const upiRegex = /^[\w.-]+@[\w.-]+$/;

// Suggested UPI names
export const upiTagList = ['@ibl', '@okicici', '@hdfc', '@paytm'];

// UPI status types
export type LoaderStatus = null | 'loading' | 'success' | 'error';

//Payment types
export type PaymentTypeVariant = 'UPI' | 'NEFT' | 'NetBanking';

// Type of exchanges
export type ExchangeType = undefined | 'BSE' | 'NSE';

export type PaymentTypeData = {
  paymentType: PaymentTypeVariant[];
  expiredPayments?: PaymentTypeVariant[];
  exchangeType: ExchangeType;
};
// Invesment overview tab props type
export type InvestmentTabProps = {
  className?: string;
  paymentType?: PaymentTypeVariant[];
  exchangeType?: ExchangeType;
  expiredPayments?: PaymentTypeVariant[];
  totalPayableAmount?: number | string;
};

export type PaymentApiResponse = {
  paymentType: PaymentTypeVariant[];
  expiredPayments?: PaymentTypeVariant[];
  exchangeType?: ExchangeType;
};

// Payment steps for NEFT
export const NeftSteps = [
  'You’ll have to add the above account as a beneficiary',
  'Please ensure that your bank allows the transfer of the amount payable to this beneficiary before placing the order',
  'Please make payment via this mode only on the day of settlement ',
];

// Bank details fields for NEFT payment
export const NeftBankDetails = [
  {
    label: 'Beneficiary Name',
    id: 'beneficiaryName',
  },
  {
    label: 'Account Number',
    id: 'accountNo',
  },
  {
    label: 'IFSC Code',
    id: 'ifscCode',
  },
  {
    label: 'Account Type',
    id: 'accountType',
  },
  {
    label: 'Bank Name',
    id: 'bankName',
  },
];

export type TabProps = {
  label?: string;
  logoName?: string;
  width?: number;
  height?: number;
  showLabel?: boolean;
  removeLogo?: string;
  id: PaymentTypeVariant;
};

export const paymentTabsArr: TabProps[] = [
  {
    label: 'UPI',
    logoName: 'upi-logo.svg',
    width: 47,
    height: 14,
    showLabel: false,
    id: 'UPI',
  },
  {
    label: 'Net Banking',
    logoName: 'monitor.svg',
    showLabel: true,
    removeLogo: 'paymentTab',
    id: 'NetBanking',
  },
  {
    label: 'IMPS/NEFT/RTGS',
    logoName: 'bank-blue.svg',
    showLabel: true,
    id: 'NEFT',
  },
];

export const bondsMldInvestedAmountBreakdown = [
  {
    label: 'Discounted Price',
    id: 'discountedPrice',
    tooltip: '',
    modalLinkLabel: "What's it?",
    modalTitle: 'What is Discounted Price?',
    modalContent: BONDS_TOOLTIPS?.MLD_DISCOUNTED_PRICE,
    strapiText: 'MLD_DISCOUNTED_PRICE',
    isHTML: true,
    decimals: 1,
  },
  {
    label: 'Stamp Duty',
    id: 'stampDuty',
    tooltip: '',
    modalLinkLabel: '',
    modalTitle: '',
    modalContent: '',
    decimals: 1,
  },
];

export const badgeLabelNames = [
  {
    label: 'Corporate Bond',
    id: financeProductTypeConstants.bonds,
  },
  {
    label: 'Basket',
    id: financeProductTypeConstants.Baskets,
  },
  {
    label: 'SDI',
    id: financeProductTypeConstants.sdi,
  },
  {
    label: 'Leasing',
    id: financeProductTypeConstants.leasing,
  },
  {
    label: 'Inventory',
    id: financeProductTypeConstants.inventory,
  },
  {
    label: 'Startup Equity',
    id: financeProductTypeConstants.startupEquity,
  },
  {
    label: 'Commercial Property',
    id: financeProductTypeConstants.realEstate,
  },
  {
    label: 'High Yield FD',
    id: financeProductTypeConstants.highyieldfd,
  },
];

export const getBadgeName = (financeProductType = '') => {
  return (
    badgeLabelNames.find((chipName) => chipName.id === financeProductType)
      ?.label || ''
  );
};

/**
 * Handles investment overview summary data
 * @param assetData Selected asset info
 * @returns
 */
export const getBondsSummaryDetails = (
  assetData: any,
  lotSize: number | string,
  calculationData: any,
  assetCalculationData: any
) => {
  let totalReturns = Number(
    (assetCalculationData?.principalAmount || 0) +
      (assetCalculationData?.totalInterest || 0)
  );

  let amountPayableSummary = [
    {
      title: 'Price/Unit',
      value: `${numberToIndianCurrencyWithDecimals(
        Number(assetCalculationData?.purchasePrice || 0) / Number(lotSize || 1)
      )}`,

      tooltipData: BONDS_TOOLTIPS.PRICE_PER_UNIT_BONDS,
      id: 'PRICE_PER_UNIT_BONDS',
    },
    {
      title: 'Brokerage Fees (0.50%)',
      id: 'brokerageFees',
      value: '₹0',
      isCampaignEnabled: true,
      cutoutValue: `${numberToIndianCurrencyWithDecimals(
        Number(assetCalculationData?.purchasePrice || 0) * 0.005
      )}`,
      tooltipData:
        'Brokerage is the fee Grip charges investors for facilitating Bond/ SDI investments. The brokerage amount is inclusive of 18% GST. The YTM displayed to investors is the net YTM after deducting these charges.',
    },
    {
      title: 'Units',
      value: lotSize,
      tooltipData: '',
    },
  ];

  let totalPaymentSummary = [
    {
      title: 'Principal Amount',
      value: `${numberToIndianCurrencyWithDecimals(
        (assetCalculationData?.principalAmount || 0) +
          (Math.round(assetCalculationData?.stampDuty) || 0)
      )}`,
      tooltipData: `Principal is the amount that the issuer has borrowed and will repay at the time of maturity. \n
      Principal amount= (Face value of the bond)*(Number of bonds)`,
      id: '',
    },
    {
      title: 'Total Interest',
      value: `${numberToIndianCurrencyWithDecimals(
        Number(assetCalculationData?.totalInterest || 0)
      )}`,
      tooltipData: '',
      id: '',
    },
  ];

  // MLD check
  if (isMldProduct(assetData)) {
    totalReturns = Number(calculationData?.redemptionPrice || 0);
    amountPayableSummary = [
      {
        title: 'Units',
        value: lotSize,
        tooltipData: '',
      },
    ];

    totalPaymentSummary = [
      {
        title: 'Redemption Price',
        value: `${numberToIndianCurrencyWithDecimals(
          Number(calculationData?.redemptionPrice || 0)
        )}`,
        tooltipData: BONDS_TOOLTIPS?.MLD_REDEMPTION_PRICE,
        id: 'MLD_REDEMPTION_PRICE',
      },
    ];
  }

  const dataArr: any[] = [
    {
      title: 'Asset Summary',
      tooltipData: '',
      value: getBadgeName(assetData?.financeProductType),
      imageUrl: assetData?.partnerLogo,
      summary: [
        {
          title: 'Yield to Maturity',
          value: `${assetData?.assetMappingData?.calculationInputFields?.preTaxYtm}%`,
          tooltipData:
            "Yield to Maturity (YTM) is the total annualized return expected on a Bond/ SDI if held until maturity. YTM accounts for the investment amount, interest payments, and principal repayment. YTM is calculated after deducting brokerage fees and calculated for T+1 day, where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).",
          isCampaignEnabled: assetData?.assetMappingData?.calculationInputFields
            ?.irrCutout
            ? true
            : false,
          cutoutValue: `${
            assetData?.assetMappingData?.calculationInputFields?.irrCutout || 0
          }%`,
          isNegative:
            Number(
              assetData?.assetMappingData?.calculationInputFields?.irrCutout
            ) > Number(assetData?.bonds?.preTaxYtm),
        },
        {
          title: 'Time to Maturity',
          value: `${getMaturityMonths(getMaturityDate(assetData))} Months`,
          tooltipData: '',
        },
      ],
    },
    {
      title: 'Amount Payable',
      value: `${numberToIndianCurrencyWithDecimals(
        (assetCalculationData?.investmentAmount || 0) +
          (Math.round(assetCalculationData?.stampDuty) || 0)
      )}`,
      tooltipData:
        'The total amount you need to pay to buy the securities, including any extra charges like stamp duty or brokerage.',
      id: 'INVESTMENT_AMOUNT_BONDS',
      summary: amountPayableSummary,
    },
    {
      title: 'Total Returns',
      tooltipData: '',
      value: `${numberToIndianCurrencyWithDecimals(totalReturns)}`,
      summary: totalPaymentSummary,
    },
  ];

  return dataArr;
};

/**
 * Handles investment overview summary data
 * @param assetData Selected asset info
 * @returns
 */
export const getSdiSummaryDetails = (
  assetData: any,
  lotSize: number | string,
  assetCalculationData: any
) => {
  const dataArr: any[] = [
    {
      title: 'Asset Summary',
      tooltipData: '',
      value: getBadgeName(assetData?.financeProductType),
      imageUrl: assetData?.partnerLogo,
      summary: [
        {
          title: 'Yield to Maturity',
          value: `${roundOff(assetData?.irr ?? 0, 2)}%`,
          tooltipData: `Yield to Maturity (YTM) is the total annualized return expected on a Bond/ SDI if held until maturity. YTM accounts for the investment amount, interest payments, and principal repayment. YTM is calculated after deducting brokerage fees and calculated for T+1 day, where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).`,
          isCampaignEnabled: assetData?.assetMappingData?.calculationInputFields
            ?.irrCutout
            ? true
            : false,
          cutoutValue: `${
            assetData?.assetMappingData?.calculationInputFields?.irrCutout || 0
          }%`,
          isNegative:
            Number(
              assetData?.assetMappingData?.calculationInputFields?.irrCutout
            ) > Number(assetData?.irr),
        },
        {
          title: 'Time to Maturity',
          value: `${getMaturityMonths(getMaturityDate(assetData))} Months`,
          tooltipData: '',
        },
      ],
    },
    {
      title: 'Amount Payable',
      tooltipData:
        'The total amount you need to pay to buy the securities, including any extra charges like stamp duty or brokerage.',
      value: `${numberToIndianCurrencyWithDecimals(
        (assetCalculationData?.investmentAmount || 0) +
          (Math.round(assetCalculationData?.stampDuty) || 0)
      )}`,
      summary: [
        {
          title: 'Price/Lot',
          value: `${numberToIndianCurrencyWithDecimals(
            Number(assetCalculationData?.purchasePrice || 0) /
              Number(lotSize || 1)
          )}`,
          tooltipData: 'Cost of buying of one lot of a security',
          id: 'PRICE_PER_UNIT_SDISECONDARY',
        },
        {
          title: 'Brokerage Fees (0.50%)',
          id: 'brokerageFees',
          value: '₹0',
          isCampaignEnabled: true,
          cutoutValue: `${numberToIndianCurrencyWithDecimals(
            Number(assetCalculationData?.purchasePrice || 0) * 0.005
          )}`,
          tooltipData:
            'Brokerage is the fee Grip charges investors for facilitating Bond/ SDI investments. The brokerage amount is inclusive of 18% GST. The YTM displayed to investors is the net YTM after deducting these charges.',
        },
        {
          title: 'Lots',
          value: lotSize,
          tooltipData: '',
        },
      ],
    },
    {
      title: 'Total Returns',

      tooltipData: '',
      value: `${numberToIndianCurrencyWithDecimals(
        Number(assetCalculationData?.principalAmount || 0) +
          Number(assetCalculationData?.totalInterest || 0)
      )}`,
      summary: [
        {
          title: 'Purchase Amount',
          tooltipData:
            "The remaining amount of the Principal that hasn't been repaid or returned yet.",
          value: `${numberToIndianCurrencyWithDecimals(
            Number(assetCalculationData?.principalAmount || 0)
          )}`,
        },
        {
          title: 'Total Interest',
          value: `${numberToIndianCurrencyWithDecimals(
            Number(assetCalculationData?.totalInterest || 0)
          )}`,
          tooltipData: '',
        },
      ],
    },
  ];

  return dataArr;
};

export const getBasketSummaryDetails = (
  assetData: any,
  lotSize: number | string,
  assetCalculationData: any
) => {
  const dataArr: any[] = [
    {
      title: 'Asset Summary',
      tooltipData: '',
      value: getBadgeName(assetData?.financeProductType),
      imageUrl: assetData?.partnerLogo,
      summary: [
        {
          title: 'Yield to Maturity',
          value: `${roundOff(
            assetData?.assetMappingData?.calculationInputFields?.irr ?? 0,
            2
          )}%`,
          tooltipData: `Yield to Maturity (YTM) is the total annualized return expected on a Bond/ SDI if held until maturity. YTM accounts for the investment amount, interest payments, and principal repayment. YTM is calculated after deducting brokerage fees and calculated for T+1 day, where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).`,
          isCampaignEnabled: assetData?.assetMappingData?.calculationInputFields
            ?.preTaxIrrCutout
            ? true
            : false,
          cutoutValue: `${
            assetData?.assetMappingData?.calculationInputFields
              ?.preTaxIrrCutout || 0
          }%`,
          isNegative:
            Number(
              assetData?.assetMappingData?.calculationInputFields
                ?.preTaxIrrCutout
            ) > Number(assetData?.irr),
        },
        {
          title: 'Time to Maturity',
          value: `${getMaturityMonths(getMaturityDate(assetData))} Months`,
          tooltipData: '',
        },
      ],
    },
    {
      title: 'Amount Payable',
      tooltipData: '',
      value: `${numberToIndianCurrencyWithDecimals(
        (assetCalculationData?.investmentAmount || 0) +
          (Math.round(assetCalculationData?.stampDuty) || 0)
      )}`,
      summary: [
        {
          title: 'Price/Lot',
          value: `${numberToIndianCurrencyWithDecimals(
            Number(assetCalculationData?.purchasePrice || 0) /
              Number(lotSize || 1)
          )}`,
          tooltipData: 'Cost of buying of one lot of a security',
          id: 'PRICE_PER_UNIT_SDISECONDARY',
        },
        {
          title: 'Brokerage Fees (0.50%)',
          id: 'brokerageFees',
          value: '₹0',
          isCampaignEnabled: true,
          cutoutValue: `${numberToIndianCurrencyWithDecimals(
            Number(assetCalculationData?.purchasePrice || 0) * 0.005
          )}`,
          tooltipData:
            'Brokerage is the fee Grip charges investors for facilitating Bond/ SDI investments. The brokerage amount is inclusive of 18% GST. The YTM displayed to investors is the net YTM after deducting these charges.',
        },
        {
          title: 'Lots',
          value: lotSize,
          tooltipData: '',
        },
      ],
    },
    {
      title: 'Total Returns',

      tooltipData: '',
      value: `${numberToIndianCurrencyWithDecimals(
        Number(assetCalculationData?.principalAmount || 0) +
          Number(assetCalculationData?.totalInterest || 0)
      )}`,
      summary: [
        {
          title: 'Principal O/S',
          value: `${numberToIndianCurrencyWithDecimals(
            Number(assetCalculationData?.principalAmount || 0)
          )}`,
        },
        {
          title: 'Total Interest',
          value: `${numberToIndianCurrencyWithDecimals(
            Number(assetCalculationData?.totalInterest || 0)
          )}`,
          tooltipData: '',
        },
      ],
    },
  ];

  return dataArr;
};

export const giveInstructionList = (props) => {
  const { settlementDate } = props;
  return [
    {
      title: `Transfer only on ${dayjs(settlementDate)
        .tz('Asia/Calcutta')
        .format('DD MMM YYYY')} by 2:00 PM`,
      description:
        '  If you make the payment before the settlement date, the money will  be reverted to the source account within 1 business day',
    },
    {
      title: `Transfer ${`${numberToIndianCurrencyWithDecimals(
        Number(props?.totalPayableAmount || 0).toFixed(2)
      )}`} without rounding off`,
      description:
        ' If you round off the payment, the order would not go through and the money will be reverted to the source account within 1 business day',
    },
  ];
};

export const rtgsBankDetailList = (props) => {
  return [
    {
      label: 'Amount Payable',
      value: `${`${numberToIndianCurrencyWithDecimals(
        Number(props?.amount || 0).toFixed(2)
      )}`}`,
    },
    {
      label: 'Accepted mode',
      value: 'IMPS/NEFT/RTGS',
    },
    {
      label: 'Settlement Day',
      value: `${dayjs(props?.settlementDate)
        .tz('Asia/Calcutta')
        .format('DD MMM YYYY')} before 2:00 PM`,
    },
  ];
};

export const pendingInvestmentModalDetail = (props) => ({
  title: 'Your order was placed but the payment is still pending',
  subtitle: `We will hold the units for you for 1 business day. The payment can be completed anytime until ${dayjs(
    props?.settlementDate
  ).format('DD MMM YYYY')} until 2 PM through your Portfolio or Discover page`,
});

export const getTotalAmountPaybale = (
  investmentAmount = 0,
  stampDuty = 0,
  units = 1
) => {
  return (
    Number(Math.round(stampDuty * units)) + Number(investmentAmount * units)
  );
};

export const getUnitsFromTotalAmount = (
  totalAmountPayable = 0,
  investmentAmount = 0,
  stampDuty = 0
) => {
  return Math.floor(
    totalAmountPayable / (investmentAmount + Math.round(stampDuty))
  );
};

/**
 * Status for UPI Verification
 *
 * 0 = upi not available
 * 1 = verified
 * 2 = upi id not linked to the account
 * 3 = error received
 */
export type verifyUPIIDEvent = Partial<{
  amo_order: boolean;
  amount: string | number;
  bank_name: string;
  status: number;
  response_payload: unknown;
}>;

export const PaymentVariantIndexValue: PaymentTypeVariant[] = [
  'UPI',
  'NetBanking',
  'NEFT',
];
