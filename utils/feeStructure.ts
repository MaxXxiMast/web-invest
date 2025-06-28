import { roundOff } from './number';

type StartupEquityFees = {
  gripFees: number;
  aif: number;
  statutory: number;
};

const getFeesAmount = (investmentAmount: number, fee: number) => {
  return (investmentAmount * fee) / 100;
};

export const startupEquityFeeStructure = (
  asset: any,
  investmentAmount: number
) => {
  if (!asset) {
    return [];
  }
  const {
    gripFee = 0,
    aifFee = 0,
    statuatoryFee = 0,
  } = asset?.assetMappingData?.calculationInputFields ?? {};
  const fees: StartupEquityFees = {
    gripFees: gripFee,
    aif: aifFee,
    statutory: statuatoryFee,
  };
  const gripFeeValue = getFeesAmount(investmentAmount, fees?.gripFees ?? 0);
  const aifFeeValue = getFeesAmount(investmentAmount, fees.aif);

  const statuatorFeesValue = fees?.statutory
    ? Number(fees.statutory).toFixed(2)
    : 0;

  let details = [
    {
      label: 'Grip Acquisition Fee',
      suffix: '%',
      feeValue: fees?.gripFees ? Number(fees.gripFees).toFixed(2) : 0,
      id: 'gripFees',
      valuePrefix: '₹',
      value: gripFeeValue || 0,
      labelTooltip:
        'This is a one-time fee charged by Grip for facilitating the fund-raise through Grip’s platforms.',
    },
    {
      label: 'AIF Acquisition Fee',
      suffix: '%',
      feeValue: fees?.aif ? Number(fees.aif).toFixed(2) : 0,
      id: 'aif',
      valuePrefix: '₹',
      value: aifFeeValue || 0,
      labelTooltip:
        'This is a one-time fee charged by the Investment Manager of the AIF for facilitating the fund-raise through its AIF.',
    },
    {
      label: 'Statutory Charges',
      suffix: '%',
      feeValue: statuatorFeesValue,
      id: 'statutory',
      valuePrefix: '₹',
      value: getFeesAmount(aifFeeValue, fees.statutory) || 0,
      labelTooltip: `Applicable GST (${statuatorFeesValue}%) payable on Grip/AIF's acquisition fees.`,
    },
  ];

  return details;
};

export const commercialProductFeesStructure = (
  asset: any,
  investmentAmount: number
) => {
  const fees = asset?.commercialPropertyDetails ?? {};

  const gripFee = asset?.gripFee ?? 0;
  const statuatoryFees = fees?.statuatorFees ?? 18;
  const aifFee = fees?.aifFees ?? 2;

  const gripFeeValue = getFeesAmount(investmentAmount, gripFee);
  const aifFeeValue = getFeesAmount(investmentAmount, aifFee);

  let details = [
    {
      label: 'Grip Acquisition Fee',
      suffix: '%',
      feeValue: Number(gripFee).toFixed(2),
      id: 'gripFees',
      valuePrefix: '₹',
      value: gripFeeValue,
    },
    {
      label: 'AIF Acquisition Fee ',
      suffix: '%',
      feeValue: Number(aifFee).toFixed(2),
      id: 'aif',
      valuePrefix: '₹',
      value: aifFeeValue,
      tooltip:
        'Upfront fee charged by the sponsor of the AIF, calculated as a percentage of the investment amount.',
    },
    {
      label: 'Statutory Charges',
      suffix: '%',
      feeValue: Number(statuatoryFees).toFixed(2),
      id: 'statutory',
      valuePrefix: '₹',
      value: getFeesAmount(aifFeeValue, statuatoryFees),
      tooltip: `Applicable GST (${Number(statuatoryFees).toFixed(
        1
      )}%) payable on Grip/AIF's acquisition fees.`,
    },
  ];

  return details;
};

export const defaultFeeStructure = (
  calculatedReturns: any,
  taxPercentage: string,
  asset: any
) => {
  if (!calculatedReturns || !asset) {
    return [];
  }
  let details = [
    {
      label: 'Pre-Tax Returns (in ₹)',
      suffix: '%',
      feeValue: null,
      id: 'pretax',
      valuePrefix: '₹',
      value: Math.round((calculatedReturns as any).totalPreTaxAmount || 0),
      tooltip: `The returns are calculated after Grip’s fee of ${
        asset?.gripFee ? roundOff(asset?.gripFee, 1) : 0
      }%
            of total payments by lessee.`,
    },
    {
      label: 'Tax Applicable',
      suffix: '%',
      feeValue: null,
      id: 'tax',
      valuePrefix: '',
      valueSuffix: '%',
      value: `${roundOff(taxPercentage, 1)}`,
    },
  ];

  return details;
};

export const calculateTotalPayableAmount = (
  fees: any,
  investmentAmount: number
) => {
  const totalFees = fees.reduce((acc: any, cur: any) => {
    let value = cur.value;
    if (typeof value == 'string') {
      value = value.replaceAll(',', '');
    }
    return acc + Number(value);
  }, 0);
  return Math.round(Number(investmentAmount) + totalFees);
};

export const WHY_POST_TAX_DETAILS = {
  WHY_POST_TAX: `<p> Grip creates a LLP on behalf of investors in the deal. Post Tax returns are payouts to LLP participants (investors) after taxes are deducted from the lease rentals.</p> <br/>
  <p>Tax is applicable only at the LLP level and payout made would not be subject to further taxation at the participant's end as provided under the <a style="text-decoration:underline;color:var(--gripBlue, #00357c);" href="https://www.incometaxindia.gov.in/Tutorials/11.Tax%20free%20incomes%20final.pdf" target="_blank" rel="noopener noreferrer"> Section 10(2A) </a> of the Income Tax Act </p>`,

  WHY_POST_TAX_HEADING: `Post Tax Returns`,
};
