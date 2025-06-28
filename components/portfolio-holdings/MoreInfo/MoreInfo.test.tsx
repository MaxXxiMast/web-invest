import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import MoreInfo from './index';
import { usePathname } from 'next/navigation';
import { fetchTransactionInfo } from '../../../api/order';

jest.mock('../../../api/order', () => ({
  fetchMoreInfo: jest.fn(() =>
    Promise.resolve([{ isin: 'TEST123', units: 100 }])
  ),
  fetchTransactionInfo: jest.fn(),
}));

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('../../../utils/appHelpers', () => ({
  postMessageToNativeOrFallback: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('./DealDetails', () => {
  const MockDealDetails = () => <div>DealDetails Component</div>;
  MockDealDetails.displayName = 'DealDetails';
  return MockDealDetails;
});

jest.mock('../CardTable', () => {
  const MockCardTable = () => <div>CardTable Component</div>;
  MockCardTable.displayName = 'CardTable';
  return MockCardTable;
});

jest.mock('../../primitives/Image', () => {
  const MockImage: React.FC<any> = (props) => {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={props.alt || ''} src={props.src} className={props.className} />
      </>
    );
  };
  MockImage.displayName = 'Image';

  return {
    __esModule: true,
    default: MockImage,
  };
});

jest.mock('../../primitives/CustomSkeleton/CustomSkeleton', () => {
  const MockCustomSkeleton: React.FC<any> = (props) => <div>Skeleton</div>;
  MockCustomSkeleton.displayName = 'CustomSkeleton';
  return MockCustomSkeleton;
});
jest.mock('../../primitives/Button', () => {
  return {
    __esModule: true,
    default: (props: any) => <button {...props} />,
    ButtonType: { BorderLess: 'BorderLess' },
  };
});

jest.mock('../../primitives/MaterialModalPopup', () => {
  const MockMaterialModalPopup: React.FC<any> = (props) =>
    props.showModal ? <div>{props.children}</div> : null;
  MockMaterialModalPopup.displayName = 'MaterialModalPopup';
  return MockMaterialModalPopup;
});

describe('MoreInfo Component', () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  test('renders modal with CardTable when pathname includes "#my_holdings"', async () => {
    (usePathname as jest.Mock).mockReturnValue('some_path#my_holdings');

    render(
      <MoreInfo
        showModal={true}
        onClose={onCloseMock}
        securityID={32}
        logo=""
        orderID={352452}
        transactionLogo=""
      />
    );

    await waitFor(() => expect(screen.getByText(/ISIN:/i)).toBeInTheDocument());
    expect(screen.getByText(/More Info/i)).toBeInTheDocument();
    expect(screen.getByText(/ISIN:/i)).toBeInTheDocument();
    expect(screen.getByText(/CardTable Component/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/DealDetails Component/i)
    ).not.toBeInTheDocument();
  });

  test('renders modal with DealDetails when pathname does not include "#my_holdings"', async () => {
    (usePathname as jest.Mock).mockReturnValue('transactions');
    (fetchTransactionInfo as jest.Mock).mockResolvedValue({
      isin: 'US01234567890',
      dealID: 'D123',
      tranche: 'B',
      orderDate: '2023-07-01T15:00:00Z',
      settlementDate: '2023-07-02T10:30:00Z',
      dealSheet: 'https://example.com/dealsheet.pdf',
      orderReceipt: 'https://example.com/receipt.pdf',
    });

    render(
      <MoreInfo
        showModal={true}
        onClose={onCloseMock}
        securityID={32}
        logo="logo.png"
        orderID={352452}
        transactionLogo="transactionLogo.png"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Deal ID:/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/More Info/i)).toBeInTheDocument();
    expect(screen.getByText(/Deal ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/ISIN:/i)).toBeInTheDocument();
    expect(screen.queryByText(/Units:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CardTable Component/i)).not.toBeInTheDocument();
  });

  test('calls onClose when OKAY button is clicked', async () => {
    (usePathname as jest.Mock).mockReturnValue('some_other_path');

    render(
      <MoreInfo
        showModal={true}
        onClose={onCloseMock}
        securityID={32}
        logo=""
        orderID={352452}
        transactionLogo=""
      />
    );
    await waitFor(() => expect(screen.getByText(/OKAY/i)).toBeInTheDocument());

    const okayButton = screen.getByRole('button', { name: /OKAY/i });
    fireEvent.click(okayButton);

    expect(onCloseMock).toHaveBeenCalled();
  });

  test('does not render modal content when showModal is false', () => {
    (usePathname as jest.Mock).mockReturnValue('some_path');
    render(
      <MoreInfo
        showModal={false}
        onClose={onCloseMock}
        securityID={32}
        logo=""
        orderID={352452}
        transactionLogo=""
      />
    );
    expect(screen.queryByText(/More Info/i)).not.toBeInTheDocument();
  });
});
