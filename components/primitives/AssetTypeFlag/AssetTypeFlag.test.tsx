import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetTypeFlag from './AssetTypeFlag';

// Mock the dependencies
jest.mock('../../../utils/financeProductTypes', () => ({
  financeProductTypeConstants: {
    leasing: 'LEASING',
    bonds: 'BONDS',
    sdi: 'SDI',
  },
  financeProductTypeMapping: {
    LEASING: 'leasingStyle',
    BONDS: 'bondsStyle',
    SDI: 'sdiStyle',
  },
}));

jest.mock('../../../utils/badge', () => ({
  getAssetTypeFlag: jest.fn((asset, isInvestmentOverView) => {
    return asset.financeProductType === 'LEASING'
      ? 'Leasing'
      : asset.financeProductType === 'BONDS'
      ? 'Bonds'
      : asset.financeProductType === 'SDI'
      ? 'SDI'
      : '';
  }),
}));

// Mock CSS modules
jest.mock('./AssetTypeFlag.module.css', () => ({
  Flag: 'flag-base-class',
  LeasingAssetList: 'leasing-asset-list-class',
  CorporateBondList: 'corporate-bond-list-class',
  sdiSecondaryInvestmentOverview: 'sdi-secondary-investment-overview-class',
  SDIAssetlist: 'sdi-asset-list-class',
  CorporateBondInvestmentOverview: 'corporate-bond-investment-overview-class',
}));

describe('AssetTypeFlag', () => {
  test('renders nothing when financeProductType is not provided', () => {
    const { container } = render(<AssetTypeFlag asset={{ }}/>);
    expect(container.firstChild).toBeNull();
  });

  test('renders leasing flag in asset list view', () => {
    const { container, getByText } = render(
      <AssetTypeFlag
        asset={{ financeProductType: 'LEASING' }}
        isAssetList={true}
      />
    );

    expect(getByText('Leasing')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('flag-base-class');
    expect(container.firstChild).toHaveClass('leasing-asset-list-class');
  });

  test('renders bonds flag in asset list view', () => {
    const { container, getByText } = render(
      <AssetTypeFlag
        asset={{
          assetID: 2,
          badges: 'badge2',
          collectedAmount: 2000,
          category: 'category2',
          desc: 'description2',
          financeProductType: 'BONDS',
          productCategory: 'productCategory2',
          productSubcategory: 'productSubcategory2',
          header: 'header2',
          postTaxYield: '4%',
          minInvestmentAmount: 1000,
        }}
        isAssetList={true}
      />
    );

    expect(getByText('Bonds')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('flag-base-class');
    expect(container.firstChild).toHaveClass('corporate-bond-list-class');
  });

  test('renders sdi flag in asset list view', () => {
    const { container, getByText } = render(
      <AssetTypeFlag
        asset={{
          assetID: 1,
          badges: 'badge1',
          collectedAmount: 1000,
          category: 'category1',
          desc: 'description',
          financeProductType: 'SDI',
          productCategory: 'productCategory1',
          productSubcategory: 'productSubcategory1',
          header: 'header1',
          postTaxYield: '5%',
          minInvestmentAmount: 500,
        }}
        isAssetList={true}
      />
    );

    expect(getByText('SDI')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('flag-base-class');
    expect(container.firstChild).toHaveClass('sdi-asset-list-class');
  });

  test('renders sdi flag in investment overview', () => {
    const { container, getByText } = render(
      <AssetTypeFlag
        asset={{ financeProductType: 'SDI' }}
        isAssetList={false}
      />
    );

    expect(getByText('SDI')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('flag-base-class');
    expect(container.firstChild).toHaveClass(
      'sdi-secondary-investment-overview-class'
    );
  });

  test('renders bonds flag in investment overview', () => {
    const { container, getByText } = render(
      <AssetTypeFlag
        asset={{ financeProductType: 'BONDS' }}
        isAssetList={false}
      />
    );

    expect(getByText('Bonds')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('flag-base-class');
    expect(container.firstChild).toHaveClass(
      'corporate-bond-investment-overview-class'
    );
  });

  test('applies custom className when provided', () => {
    const { container } = render(
      <AssetTypeFlag
        asset={{ financeProductType: 'LEASING' }}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('passes isInvestmentOverView to getAssetTypeFlag', () => {
    const { getAssetTypeFlag } = require('../../../utils/badge');

    render(
      <AssetTypeFlag
        asset={{ financeProductType: 'BONDS' }}
        isInvestmentOverView={true}
      />
    );

    expect(getAssetTypeFlag).toHaveBeenCalledWith(
      { financeProductType: 'BONDS' },
      true
    );
  });
});
