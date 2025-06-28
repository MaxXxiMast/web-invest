import { getMaturityDate, getMaturityMonths } from '../../../utils/asset';
import {
  isAssetBasket,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import { getBadgeName } from '../../../utils/investment';
import {
  numberToIndianCurrencyWithDecimals,
  roundOff,
} from '../../../utils/number';
import { getTenure } from '../../fd-graph/utils';
import { getAmountPaybaleContentBreakdown } from '../../assetDetails/AssetCalculator/utils/sdi_secondary_utils';
import { getAmountPaybaleContentBreakdownBonds } from '../../assetDetails/AssetCalculator/utils/bond_utils';

export const getOrderDetails = (props: any, singleLotCalculation, pageData) => {
  const { isFdOrder } = props;
  const isBonds = props?.financeProductType === 'Bonds';
  let amountPaybaleBreakDown = [];
  let preTaxReturnPaybaleBreakDown = [];
  if (!isBonds) {
    let { amountPaybaleBreakDown: a, preTaxReturnPaybaleBreakDown: b } =
      getAmountPaybaleContentBreakdown(
        pageData,
        singleLotCalculation,
        props?.units
      );
    amountPaybaleBreakDown = a;
    preTaxReturnPaybaleBreakDown = b;
  } else {
    let { amountPaybaleBreakDown: a, preTaxReturnPaybaleBreakDown: b } =
      getAmountPaybaleContentBreakdownBonds(
        pageData,
        singleLotCalculation,
        props?.units,
        false
      );
    amountPaybaleBreakDown = a;
    preTaxReturnPaybaleBreakDown = b;
  }
  if (isFdOrder) {
    preTaxReturnPaybaleBreakDown[0].value = numberToIndianCurrencyWithDecimals(
      props?.principalAmount
    );
    preTaxReturnPaybaleBreakDown[1].value = numberToIndianCurrencyWithDecimals(
      props?.totalInterest
    );
  }
  if (isFdOrder) {
    return [
      {
        title: 'Asset Summary',
        value: getBadgeName(props.financeProductType),
        icon: props.assetImage,
        key: 'asset_name',
        summary: [
          {
            title: 'FD Rate',
            value: `${props?.preTaxYtm}%`,
          },
          {
            title: 'Time to Maturity',
            value: getTenure(props?.maturityDate || props?.dateOfMaturity || 0),
          },
        ],
      },
      {
        title: 'Amount Invested',
        value: `${numberToIndianCurrencyWithDecimals(props?.amount)}`,
        key: 'invested_amt',
        summary: [],
      },
      {
        title: 'Total Returns',
        value: `${numberToIndianCurrencyWithDecimals(
          Number(props?.preTaxReturns || 0)
        )}`,
        isHighlighted: true,
        key: 'return_amt',
        summary: preTaxReturnPaybaleBreakDown.map((ele: any) => {
          ele.title = ele.label;
          ele.tooltipData = ele.tooltip;
          return ele;
        }),
      },
    ];
  }
  return [
    {
      title: 'Asset Summary',
      value: getBadgeName(props.financeProductType),
      icon: props.assetImage,
      key: 'asset_name',
      summary: [
        {
          tooltipData: `Yield to Maturity (YTM) is the total annualized return expected on a Bond/ SDI if held until maturity. YTM accounts for the investment amount, interest payments, and principal repayment. YTM is calculated after deducting brokerage fees and calculated for T+1 day, where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).`,
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
      value: `${numberToIndianCurrencyWithDecimals(props?.amount)}`,
      key: 'invested_amt',
      tooltipData:
        'The total amount you need to pay to buy the securities, including any extra charges like stamp duty or brokerage.',
      summary: amountPaybaleBreakDown.map((ele: any) => {
        if (ele?.id === 'brokerageFees') {
          ele.isCampaignEnabled = true;
          ele.cutoutValue = ele.value;
          ele.value = '₹0';
        }
        ele.title = ele.label;
        ele.tooltipData = ele.tooltip;
        return ele;
      }),
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
          title: 'Purchase Amount',
          tooltipData:
            "The remaining amount of the Principal that hasn't been repaid or returned yet.",
          value: `${numberToIndianCurrencyWithDecimals(
            Number(props?.principalAmount || 0)
          )}`,
        },
        {
          title: 'Total Interest',
          value: `${numberToIndianCurrencyWithDecimals(
            Number(props?.totalInterest || 0)
          )}`,
        },
      ],
    },
  ];
};

export const getAssetDetailsMobile = ({
  financeProductType,
  maturityDate,
  units,
  irr,
  preTaxYtm,
  isFdOrder,
}) => {
  if (isFdOrder) {
    return [
      {
        label: '',
        value: `${preTaxYtm} %`,
      },
      {
        label: '',
        value: getTenure(maturityDate || 0),
      },
    ];
  }

  const isSDI = isSDISecondary({ financeProductType });
  const isBasket = isAssetBasket({ financeProductType });
  const months = getMaturityMonths(maturityDate);

  return [
    {
      label: isSDI ? 'Lots' : 'Units',
      value: units,
    },
    {
      label: 'YTM',
      value:
        isSDI || isBasket
          ? `${roundOff(irr ?? 0, 2)}%`
          : roundOff(preTaxYtm ?? 0, 2),
    },
    {
      label: '',
      value: `${months} Month${months > 1 ? 's' : ''}`,
    },
  ];
};
