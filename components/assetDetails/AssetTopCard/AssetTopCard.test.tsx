import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetTopCard from '../AssetTopCard';
import { useAppSelector } from '../../../redux/slices/hooks';
import * as useMediaQueryHook from '../../../utils/customHooks/useMediaQuery';

// Mock internal modules/components
jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../assetsList/partnerLogo', () => {
  const Mock = () => <div data-testid="partner-logo" />;
  Mock.displayName = 'MockPartnerLogo';
  return Mock;
});

jest.mock('../../assetsList/RatingScale', () => {
  const Mock = () => <div data-testid="rating-scale" />;
  Mock.displayName = 'MockRatingScale';
  return Mock;
});

jest.mock('./AssetProgress', () => {
  const Mock = () => <div data-testid="asset-progress" />;
  Mock.displayName = 'MockAssetProgress';
  return Mock;
});

jest.mock('../MonthlyReturnCard', () => {
  const Mock = () => <div data-testid="monthly-return-card" />;
  Mock.displayName = 'MockMonthlyReturnCard';
  return Mock;
});

jest.mock('../../primitives/TooltipCompoent/TooltipCompoent', () => {
  const MockTooltip = ({ children }: any) => <>{children}</>;
  MockTooltip.displayName = 'MockTooltipComponent';
  return MockTooltip;
});

jest.mock('../../mutual-funds/mf-line-chart/MFLineChart', () => {
  const Mock = () => <div data-testid="mf-line-chart" />;
  Mock.displayName = 'MockMFLineChart';
  return Mock;
});

jest.mock('../../BadgeComponent', () => ({
  BadgeList: () => <div data-testid="badge-list" />,
}));

jest.mock('./utils', () => ({
  getAssetOverview: jest.fn(() => [
    { label: 'Tenure', value: '12M' },
    { label: 'Return', value: '8%' },
  ]),
  getBondMFOverview: jest.fn(() => [{ label: 'NAV', value: '₹10' }]),
}));

jest.mock('../../../utils/asset', () => ({
  assetStatus: jest.fn(() => 'active'),
}));

jest.mock('../../../utils/financeProductTypes', () => ({
  isAssetBondsMF: jest.fn(() => false),
  isHighYieldFd: jest.fn(() => false),
}));

jest.mock('../../primitives/AssetCard/utils', () => ({
  isHideCutOut: jest.fn(() => false),
}));

jest.mock('../../../utils/number', () => ({
  numberToIndianCurrencyWithDecimals: jest.fn(() => '₹1.08L'),
  roundOff: jest.fn(),
}));

describe('AssetTopCard', () => {
  const mockAsset = {
    detailsBadge: 'Top Pick',
    header: 'Test MF',
    badges: 'new,top-rated',
    irrDroppingDate: null,
    assetMappingData: {
      calculationInputFields: {
        ratedBy: 'CRISIL',
        rating: 'AAA',
      },
    },
    desc: 'Growth chart data',
    repeatInvestorsPercentage: 40,
  };

  beforeEach(() => {
    (useAppSelector as jest.Mock).mockImplementation((fn) =>
      fn({
        assets: {
          selectedAsset: mockAsset,
          showDefaultAssetDetailPage: true,
        },
        mfConfig: {
          selectedTenure: '12M',
          returnPercentage: 8,
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders asset label when visible', () => {
    jest.spyOn(document, 'getElementById').mockReturnValueOnce({
      offsetWidth: 200,
    } as HTMLElement);

    render(<AssetTopCard />);
    expect(screen.getByText('Top Pick')).toBeInTheDocument();
  });

  it('renders PartnerLogo, RatingScale, and badge list', () => {
    render(<AssetTopCard />);
    expect(screen.getByTestId('partner-logo')).toBeInTheDocument();
    expect(screen.getByTestId('rating-scale')).toBeInTheDocument();
    expect(screen.getByTestId('badge-list')).toBeInTheDocument();
  });

  it('renders details correctly for desktop view', () => {
    jest.spyOn(useMediaQueryHook, 'useMediaQuery').mockReturnValue(false);
    render(<AssetTopCard />);
    expect(screen.getByText('Tenure')).toBeInTheDocument();
    expect(screen.getByText('Return')).toBeInTheDocument();
  });

  it('renders mutual fund investment section correctly', () => {
    const isAssetBondsMF =
      require('../../../utils/financeProductTypes').isAssetBondsMF;
    isAssetBondsMF.mockReturnValueOnce(true);

    render(<AssetTopCard />);
    expect(screen.getByText(/Investment of/i)).toBeInTheDocument();
    expect(screen.getByText(/₹1.08L/)).toBeInTheDocument();
  });

  it('renders MFLineChart in mobile if MF', () => {
    jest.spyOn(useMediaQueryHook, 'useMediaQuery').mockReturnValue(true);
    const isAssetBondsMF =
      require('../../../utils/financeProductTypes').isAssetBondsMF;
    isAssetBondsMF.mockReturnValueOnce(true);

    render(<AssetTopCard />);
    expect(screen.getByTestId('mf-line-chart')).toBeInTheDocument();
  });

  it('does not render badge scroll when no badges', () => {
    (useAppSelector as jest.Mock).mockImplementation((fn) =>
      fn({
        assets: {
          selectedAsset: { ...mockAsset, badges: '' },
          showDefaultAssetDetailPage: true,
        },
        mfConfig: {
          selectedTenure: '12M',
          returnPercentage: 8,
        },
      })
    );
    render(<AssetTopCard />);
    expect(screen.queryByTestId('badge-list')).not.toBeInTheDocument();
  });

  it('renders AssetProgress for non-MF, non-FD assets', () => {
    render(<AssetTopCard />);
    expect(screen.getByTestId('asset-progress')).toBeInTheDocument();
  });

  it('renders MonthlyReturnCard in mobile when isDefault is false', () => {
    (useAppSelector as jest.Mock).mockImplementation((fn) =>
      fn({
        assets: {
          selectedAsset: mockAsset,
          showDefaultAssetDetailPage: false,
        },
        mfConfig: {
          selectedTenure: '12M',
          returnPercentage: 8,
        },
      })
    );
    jest.spyOn(useMediaQueryHook, 'useMediaQuery').mockReturnValue(true);
    render(<AssetTopCard />);
    expect(screen.getByTestId('monthly-return-card')).toBeInTheDocument();
  });
});
