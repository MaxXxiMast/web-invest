import { render, screen } from '@testing-library/react';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import Mobile from '.';
import { useAppSelector } from '../../../../redux/slices/hooks';
import { MyHoldingsCount } from '../types';

const myHoldingsCount: MyHoldingsCount[] = [
  {
    id: 'Bonds',
    key: 'bonds',
    name: 'Bonds',
    iconName: 'icon-badge',
    order: 1,
    count: 0,
  },
  {
    id: 'SDIs',
    key: 'sdis',
    name: 'SDIs',
    iconName: 'icon-invest-plant',
    order: 2,
    count: 0,
  },
  {
    id: 'Baskets',
    key: 'baskets',
    name: 'Baskets',
    iconName: 'icon-badge',
    order: 3,
    count: 0,
  },
];

jest.mock('../../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('../../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

describe('My Holdings', () => {
  test('Skeleton', () => {
    (useAppSelector as jest.Mock).mockReturnValue({});
    render(
      <Mobile
        loading={true}
        dealType={'Active'}
        myHoldingsCount={myHoldingsCount}
        holdings={[]}
        activeProductType={'Bonds'}
        handleProductType={() => {}}
        page={1}
        totalPages={1}
        handlePageChange={() => {}}
        setDealType={() => {}}
        search={''}
        handleSearch={() => {}}
      />
    );
    const element = screen.getByTestId('MyHoldingsSkeleton');
    expect(element).toBeInTheDocument();
  });
  test('No Data', () => {
    (useAppSelector as jest.Mock).mockReturnValue({});
    render(
      <Mobile
        loading={false}
        dealType={'Active'}
        myHoldingsCount={myHoldingsCount}
        holdings={[]}
        activeProductType={'Bonds'}
        setDealType={() => {}}
        handleProductType={() => {}}
        page={1}
        totalPages={1}
        handlePageChange={() => {}}
        search={''}
        handleSearch={() => {}}
      />
    );
    const element = screen.getByTestId('noDataContainer');
    expect(element).toBeInTheDocument();
  });
  test('Table', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    (useAppSelector as jest.Mock).mockReturnValue({});
    render(
      <Mobile
        loading={false}
        dealType={'Active'}
        myHoldingsCount={myHoldingsCount}
        setDealType={() => {}}
        holdings={[
          {
            securityID: 19,
            logo: 'https://s3.ap-south-1.amazonaws.com/docs.gripinvest.in/dev/asset/1231/website/logo/trucaplogo.png',
            units: 2,
            partialSold: true,
            maturityDate: '2026-02-28',
            investedAmount: 165326.24,
            totalReturns: 177999.98,
            receivedReturns: 0,
            xirr: 1,
            header:
              'RFQ Invest in monthly income, senior secured bond by a Gold Loan NBFC, TruCap',
            availableSellDate: null,
            partnerName: '',
          },
        ]}
        activeProductType={'Bonds'}
        handleProductType={() => {}}
        page={1}
        totalPages={1}
        handlePageChange={() => {}}
        search={''}
        handleSearch={() => {}}
      />
    );
    const element = screen.getByTestId('table');
    expect(element).toBeInTheDocument();
  });
  test('Table', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    (useAppSelector as jest.Mock).mockReturnValue({
      user: {
        portfolio: {
          list: [
            {
              orderID: '78fda157-5acd-43c8-b445-dcf66c40ef6e',
              orderDate: '2025-03-05T10:58:16.000Z',
              userID: 489280,
              assetID: 1320,
              spvID: 369,
              amount: 50000,
              paymentGatewayID: null,
              paymentMethod: null,
              transactionID: '1e9c59db-02c4-4243-a898-03c1b5938d58',
              transactionTime: null,
              paymentLink:
                'https://gripinvest.dev.fixerra.in/login?authCode=249a22814bf213a7ff2e68cfa58da9d3%253A3e0d6990685a4843b4158779b52879f93641a71a2d3d949acbbb69ef274248537f85672725e5453ad5ab554a3b309e92177b9496fa58a31659',
              status: 1,
              subStatus: 0,
              partner: {
                name: 'Shriram Finance',
                leadInvestorLogo: null,
                logo: 'https://s3.ap-south-1.amazonaws.com/docs.gripinvest.in/dev/asset/1320/website/logo/shriramfinancelogo.png',
                basePath: 'dev/asset/1320/website/logo/',
                fileName: 'shriramfinancelogo.png',
              },
              partnerType: 'sp',
              source: 'client',
              createdAt: '2025-03-05T10:58:16.000Z',
              lastUpdatedAt: '2025-03-05T10:58:59.000Z',
              amoLink: null,
              isAmo: 0,
              units: null,
              unitPrice: null,
              isRfq: 0,
              paymentSessionID: null,
              txns: [
                {
                  transactionID: '1e9c59db-02c4-4243-a898-03c1b5938d58',
                  orderID: '78fda157-5acd-43c8-b445-dcf66c40ef6e',
                  orderDate: '2025-03-05T10:58:16.000Z',
                  orderAmount: 50000,
                  createdAt: '2025-03-05T10:58:16.000Z',
                  lastUpdatedAt: '2025-03-05T10:58:59.000Z',
                  orderStatus: 'confirmed',
                  status: 1,
                  subStatus: 0,
                  noOfUnits: null,
                  bondPurchasePrice: null,
                  expectedReturns: 68354.17,
                  paymentGatewayID: null,
                  paymentLink:
                    'https://gripinvest.dev.fixerra.in/login?authCode=249a22814bf213a7ff2e68cfa58da9d3%253A3e0d6990685a4843b4158779b52879f93641a71a2d3d949acbbb69ef274248537f85672725e5453ad5ab554a3b309e92177b9496fa58a31659',
                  paymentMethod: null,
                  source: 'client',
                  transactionTime: null,
                  partnerType: 'sp',
                  orderDateDetail: {
                    id: 13946,
                    orderID: '78fda157-5acd-43c8-b445-dcf66c40ef6e',
                    securityTransferDate: '2025-03-10T14:00:00.000Z',
                    transferInitiatedDate: '2025-03-10T11:00:00.000Z',
                    orderSettlementDate: '2025-03-10T17:30:00.000Z',
                    rfqExpiresBy: null,
                    amoStartDate: null,
                    amoExpiresBy: null,
                    createdAt: '2025-03-05T10:58:18.000Z',
                    updatedAt: '2025-03-05T10:58:18.000Z',
                  },
                },
              ],
              tenure: 1521,
              nextReturnAmount: 325.49,
              expectedReturns: null,
              shouldResign: false,
              assetMappingData: {
                rating: 'BBB',
                tenure: 30,
                irrCutout: null,
                tenureType: 'Days',
                maxInterest: 9.3,
                maxTxnAmount: 999999999,
                minTxnAmount: 5000,
                minAmountCutout: null,
                compoundingFrequency: 'Quarterly',
              },
              assetDetails: {
                financeProductType: 'High Yield FDs',
                repaymentCycle: 'Monthly',
                categoryName: 'nbfc',
                assetID: 1320,
                assetName: 'FD-Shriram_test',
                dealType: 4,
                category: 56,
                totalAmount: 0,
                tenure: '0',
                totalMaxAmount: 0,
                collectedAmount: 4242101,
                irr: 11,
                minAmount: 0,
                maxAmount: 0,
                hasLlp: 0,
                hasResignation: 0,
                overAmount: null,
                interest: 3,
                paymentStatus: 5,
                preTaxMinAmount: 5000,
                preTaxMaxAmount: 2000000,
                preTaxTotalMaxAmount: 2147483647,
                repayment: false,
              },
              spvType: '9',
              isinNumber: null,
              securityLogo: null,
              maturityDate: '2029-05-04',
              rate: 8.8,
              isAssetReturnsCompleted: false,
              nextReturnDate: '2025-03-31T00:00:00.000Z',
              noOfReturnsScheduled: 6,
              noOfReturnsReceived: 0,
              totalAmtReceived: 0,
              docs: [],
            },
          ],
        },
      },
    });
    render(
      <Mobile
        loading={false}
        dealType={'Active'}
        myHoldingsCount={myHoldingsCount}
        setDealType={() => {}}
        holdings={[]}
        activeProductType={'High Yield FDs'}
        handleProductType={() => {}}
        page={1}
        totalPages={1}
        handlePageChange={() => {}}
        search={''}
        handleSearch={() => {}}
      />
    );
    const element = screen.getByTestId('LeasingInvestments');
    expect(element).toBeInTheDocument();
  });
});
