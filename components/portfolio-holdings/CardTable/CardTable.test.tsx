import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardTable, { transformAPIResponse } from '.';

jest.mock('../../../skeletons/card-tables-skeleton/CardTableSkeleton', () => {
  const MockCardTableSkeleton: React.FC<{ columns: number; rows: number }> = (
    props
  ) => (
    <div
      data-testid="card-table-skeleton"
      data-columns={props.columns}
      data-rows={props.rows}
    >
      Skeleton
    </div>
  );

  MockCardTableSkeleton.displayName = 'CardTableSkeleton';
  return MockCardTableSkeleton;
});

describe('CardTable Component', () => {
  const tableHeaders = ['Date', 'Type', 'Units', 'Deal Sheet', 'Order Receipt'];
  const tableData = [
    {
      date: '1 Jan 2023',
      type: 'Buy',
      units: 100,
      dealSheet: 'http://example.com/deal1.pdf',
      orderReceipt: 'http://example.com/order1.pdf',
    },
    {
      date: '2 Feb 2023',
      type: 'Sell',
      units: 50,
      dealSheet: 'http://example.com/deal2.pdf',
      orderReceipt: 'http://example.com/order2.pdf',
    },
  ];

  it('renders table headers correctly', () => {
    render(<CardTable tableHeaders={tableHeaders} tableData={tableData} />);
    tableHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('renders table data correctly', () => {
    render(<CardTable tableHeaders={tableHeaders} tableData={tableData} />);
    expect(screen.getByText('1 Jan 2023')).toBeInTheDocument();
    expect(screen.getByText('Buy')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('2 Feb 2023')).toBeInTheDocument();
    expect(screen.getByText('Sell')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});

describe('transformAPIResponse', () => {
  it('transforms a valid API response correctly', () => {
    const apiResponse = [
      {
        orderDate: '2023-01-01T00:00:00Z',
        orderType: 'BUY',
        units: 100,
        dealSheet: 'http://example.com/deal1.pdf',
        orderReceipt: 'http://example.com/order1.pdf',
      },
      {
        orderDate: '2023-02-01T00:00:00Z',
        orderType: 'SELL',
        units: 50,
        dealSheet: 'http://example.com/deal2.pdf',
        orderReceipt: 'http://example.com/order2.pdf',
      },
    ];
    const transformed = transformAPIResponse(apiResponse);
    expect(transformed.length).toBe(2);
    expect(transformed[0].type).toBe('Buy');
    expect(transformed[0].date).toMatch(/\d{1,2} \w{3} 2023/);
    expect(transformed[1].type).toBe('Sell');
  });

  it('returns an empty array for invalid API response input', () => {
    expect(transformAPIResponse(null)).toEqual([]);
    expect(transformAPIResponse({} as any)).toEqual([]);
  });
});
