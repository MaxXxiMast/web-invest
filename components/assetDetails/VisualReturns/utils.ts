import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { assetReturnCycle } from '../../portfolio-investment/InvestmentCardV2/utils';

export const getAssetReturnCycle = (asset: any) => {
  switch (asset?.repaymentCycle) {
    case assetReturnCycle.Quarterly:
      return assetReturnCycle.Quarterly;
    case assetReturnCycle.HalfYearly:
      return assetReturnCycle.HalfYearly;
    case assetReturnCycle.Yearly:
      return assetReturnCycle.Yearly;
    case assetReturnCycle.Monthly:
    case assetReturnCycle.OneTime:
    default:
      return assetReturnCycle.Monthly;
  }
};

export const getAverageReturns = (returns: any) => {
  if (!returns.totalPostTaxAmount) {
    return 0;
  }
  return parseInt(
    String(
      Math.round(returns.totalPostTaxAmount - returns.assetSaleValue) /
        returns.userPayments.length
    )
  );
};

export const paymentScheduleDownloadLabels = [
  {
    id: 'pdf',
    label: 'As PDF',
    icon: `${GRIP_INVEST_BUCKET_URL}new-website/assets/pdfDownload.svg`,
  },
  {
    id: 'csv',
    label: 'As Excel',
    icon: `${GRIP_INVEST_BUCKET_URL}new-website/assets/xlsDownload.svg`,
  },
];
