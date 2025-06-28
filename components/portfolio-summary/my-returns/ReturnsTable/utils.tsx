// NODE MODULES
import dayjs from 'dayjs';

// Components
import ReturnsAccordian from '../ReturnsAccordian';
import ReturnsTableAsset from '../ReturnsTableAsset';

// Utils
import { handleStringLimit } from '../../../../utils/string';

// Types
import type { TableHeader } from '../../../primitives/Table/types';
import type { ReturnsData } from './types';
import type { InvestmentType } from '../../utils';

const scheduleDate = {
  key: 'dateOfReturn',
  label: 'Date of Return',
  style: {
    width: 150,
  },
  formatter: (value: any) => {
    return dayjs(value).format('MMM DD, YYYY');
  },
};

const dealHeader = {
  key: '',
  label: 'Deal',
  customRow: (value: ReturnsData) => {
    return <ReturnsTableAsset item={value} />;
  },
  style: {
    width: 150,
  },
};

const dealCode = {
  key: 'assetName',
  label: 'Deal Code',
  showTooltip: true,
};

const isin = {
  key: 'isinNumber',
  label: 'ISIN',
  showTooltip: true,
};

const assetDesc = {
  key: 'assetDesc',
  label: 'Security',
  showTooltip: true,
};

const llpName = (selectedAssetType = 'Bonds, SDIs & Baskets') => {
  return {
    key: 'llpName',
    label: `${
      selectedAssetType === 'LLPs & CRE' ? 'LLP name' : 'Trust/LLP Name'
    }`,
    showTooltip: true,
  };
};

const returnsSplit = (sendTds = true) => ({
  key: '',
  label: 'Expected Return',
  customRow: (value: ReturnsData) => {
    return (
      <ReturnsAccordian
        returnsSplit={value?.returnsSplit ?? {}}
        totalAmount={value?.amount ?? 0}
        tdsAmount={sendTds ? value?.tdsAmount ?? 0 : 0}
      />
    );
  },
});

const noOfReturns = {
  key: '',
  label: '# Return',
  customRow: (value: ReturnsData) => {
    return `${value?.noOfReturn ?? 0}/${value?.noOftotalReturns ?? 0}`;
  },
};

export const inArrearsHeaders = (
  selectedAssetType = 'Bonds, SDIs & Baskets'
): TableHeader[] => {
  return [
    {
      ...scheduleDate,
      label: 'Scheduled Date',
    },
    dealHeader,
    {
      ...(selectedAssetType === 'Bonds, SDIs & Baskets' ? assetDesc : dealCode),
      style: {
        width: 150,
      },
      formatter: (value: any) => {
        return handleStringLimit(value, 14);
      },
    },
    {
      ...(selectedAssetType === 'Bonds, SDIs & Baskets'
        ? isin
        : llpName(selectedAssetType)),
      style: {
        width: 150,
      },
      formatter: (value: any) => {
        return handleStringLimit(value, 14);
      },
    },
    returnsSplit(false),
    noOfReturns,
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'comments',
      label: 'Remark',
      showTooltip: true,
    },
  ];
};

export const upcomingHeaders = (
  selectedAssetType: InvestmentType = 'Bonds, SDIs & Baskets'
): TableHeader[] => {
  return [
    { ...scheduleDate, style: { width: 150 } },
    dealHeader,
    {
      ...(selectedAssetType === 'Bonds, SDIs & Baskets'
        ? assetDesc
        : {
            ...dealCode,
            style: {
              width: 200,
            },
          }),
    },
    selectedAssetType === 'Bonds, SDIs & Baskets'
      ? {
          ...isin,
          style: {
            width: 200,
          },
        }
      : llpName(selectedAssetType),
    {
      ...returnsSplit(false),
      label: 'Scheduled Return',
    },
    { ...noOfReturns, style: { width: 150 } },
  ];
};

export const pastHeaders = (
  selectedAssetType: InvestmentType = 'Bonds, SDIs & Baskets'
): TableHeader[] => {
  return [
    { ...scheduleDate, style: { width: 150 } },
    dealHeader,
    {
      ...(selectedAssetType === 'Bonds, SDIs & Baskets'
        ? assetDesc
        : {
            ...dealCode,
            style: {
              width: 200,
            },
          }),
    },
    selectedAssetType === 'Bonds, SDIs & Baskets'
      ? {
          ...isin,
          style: {
            width: 200,
          },
        }
      : llpName(selectedAssetType),
    {
      ...returnsSplit(),
      label: 'Returns Credited',
    },
    { ...noOfReturns, style: { width: 150 } },
  ];
};

export const fdHeaders = [
  { ...scheduleDate, style: { width: 150 } },
  { ...dealHeader, label: 'Provider' },
  {
    ...dealCode,
    style: {
      width: 200,
    },
  },
  {
    ...returnsSplit(),
    label: 'Returns Credited',
    style: { width: 150 },
  },
];
