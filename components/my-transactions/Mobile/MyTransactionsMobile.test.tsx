import { render, screen } from '@testing-library/react';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import Mobile from '.';

const transactionsCount = [
  {
    id: 'Bonds',
    name: 'Bonds',
    key: 'bonds',
    iconName: 'icon-badge',
    order: 1,
    count: 0,
  },
  {
    id: 'SDIs',
    key: 'sdi',
    name: 'SDIs',
    iconName: 'icon-invest-plant',
    order: 2,
    count: 0,
  },
  {
    id: 'Baskets',
    key: 'basket',
    name: 'Baskets',
    iconName: 'icon-badge',
    order: 3,
    count: 0,
  },
];

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

describe('My Transactions', () => {
  test('component render', () => {
    render(
      <Mobile
        loading={true}
        search={''}
        handleSearch={() => { }}
        transactions={[]}
        activeProduct={'Bonds'}
        transactionsCount={[]}
        handleProductChange={() => { }}
        page={1}
        totalPages={1}
        handlePageChange={() => { }}
        orderType={'ALL'}
        handleOrderType={() => { }}
      />
    );

  });
  test('No Data', () => {
    render(
      <Mobile
        loading={false}
        search={''}
        handleSearch={() => { }}
        transactions={[]}
        activeProduct={'Bonds'}
        transactionsCount={transactionsCount}
        handleProductChange={() => { }}
        page={1}
        totalPages={1}
        handlePageChange={() => { }}
        orderType={'ALL'}
        handleOrderType={() => { }}
      />
    );
    const element = screen.getByTestId('noDataContainer');
    expect(element).toBeInTheDocument();
  });
  test('Table', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    render(
      <Mobile
        loading={false}
        search={''}
        handleSearch={() => { }}
        transactions={[
          {
            logo: 'https://s3.ap-south-1.amazonaws.com/docs.gripinvest.in/dev/asset/1692/website/logo/trucaplogo_1.png',
            orderID: 1,
            units: 1,
            amount: 1000,
            ytm: 13.5,
            holdingPeriod: 5,
            transactionDate: '2021-09-01',
            orderStatus: 'pending',
            orderType: 'BUY',
            status: 1,
            timestamps: {
              orderPlaced: new Date(),
              payment: new Date(),
              securityTransfer: new Date(),
              transferInitiatedDate: new Date(),
              orderSettlementDate: new Date(),
            },
          },
        ]}
        activeProduct={'Bonds'}
        transactionsCount={transactionsCount}
        handleProductChange={() => { }}
        page={1}
        totalPages={1}
        handlePageChange={() => { }}
        orderType={'ALL'}
        handleOrderType={() => { }}
      />
    );
    const element = screen.getByTestId('table');
    expect(element).toBeInTheDocument();
  });
});
