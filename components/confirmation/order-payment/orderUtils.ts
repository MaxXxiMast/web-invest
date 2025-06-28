import { getMaturityDate, getMaturityMonths } from '../../../utils/asset';
import {
  numberToIndianCurrencyWithDecimals,
  roundOff,
} from '../../../utils/number';
import { maskString } from '../../../utils/string';

export const getOrderDetails = (props: any) => {
  const isBonds = props?.financeProductType === 'Bonds';
  return [
    {
      title: 'Asset Summary',
      value: props.assetName,
      icon: props.assetImage,
      key: 'asset_name',
      summary: [
        {
          title: 'Yield to Maturity',
          value: `${
            isBonds
              ? roundOff(props?.preTaxYtm ?? 0, 2)
              : roundOff(props?.assetMappingData?.irr ?? props?.irr ?? 0, 2)
          }%`,
        },
        {
          title: 'Time to Maturity',
          value: `${getMaturityMonths(getMaturityDate(props))} Months`,
        },
      ],
    },
    {
      title: 'Amount Payable',
      value: `${numberToIndianCurrencyWithDecimals(
        Number(props?.investedAmount || 0)
      )}`,
      key: 'invested_amt',
      summary: [
        {
          title: 'Price/Unit',
          value: `${numberToIndianCurrencyWithDecimals(
            Number(props?.unitPrice || 0)
          )}`,
        },
        {
          title: 'Units',
          value: props.units ?? 0,
        },
      ],
    },
    {
      title: 'Total Returns',
      value: `${numberToIndianCurrencyWithDecimals(
        Number(props?.preTaxReturns || 0)
      )}`,
      isHighlighted: true,
      key: 'return_amt',
      summary: [
        {
          title: 'Principal Amount',
          value: `${numberToIndianCurrencyWithDecimals(
            Number(props.principalAmount || 0)
          )}`,
        },
        {
          title: 'Total Interest',
          value: `${numberToIndianCurrencyWithDecimals(
            Number(props.totalInterest || 0)
          )}`,
        },
      ],
    },
  ];
};

export const getAccDetails = (props: any) => {
  const {
    firstName = '',
    lastName = '',
    panNo = '',
    dematAccountNumber = '',
  } = props?.accInfo;
  return [
    {
      title: `${firstName} ${lastName}` || '',
      icon: 'icons/user.svg',
      key: 'username',
    },
    {
      title: `PAN ${maskString(panNo) ?? ''}`,
      icon: 'icons/pan_icon.svg',
      key: 'pan_no',
    },
    {
      title: `DEMAT ${maskString(dematAccountNumber)}`,
      icon: 'icons/demat_icon.svg',
      key: 'demat_no',
    },
  ];
};
