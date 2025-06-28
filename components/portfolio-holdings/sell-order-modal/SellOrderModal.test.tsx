import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import SellOrderModal, { SellOrderData } from './SellOrderModal';
import {
  fetchSellOrderData,
  placeSellOrder,
  fetchXirr,
} from '../../../api/order';

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('next/image', () => {
  // eslint-disable-next-line @next/next/no-img-element
  const MockNextImage = (props: any) => <img alt='mock-alt' {...props} />;
  MockNextImage.displayName = 'NextImage';
  return MockNextImage;
});

jest.mock('../../../api/order', () => ({
  fetchSellOrderData: jest.fn(),
  placeSellOrder: jest.fn(),
  fetchXirr: jest.fn(),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock(
  '../../../skeletons/sell-order-skeleton/SellOrderModalSkeleton',
  () => {
    const MockSellOrderModalSkeleton = () => (
      <div data-testid="sell-order-skeleton">Skeleton Loading...</div>
    );
    MockSellOrderModalSkeleton.displayName = 'SellOrderModalSkeleton';
    return MockSellOrderModalSkeleton;
  }
);

const sellOrderDataProp: SellOrderData = {
  logo: '/logo.png',
  securityID: 123,
  xirr: 3.4,
};

const mockSellOrderResponse = {
  holdings: 5,
  eligibleHoldings: 3,
  maturityDate: '2024-12-31',
  expectedPayout: '15000',
};

const mockXirrResponse = {
  xirr: 2,
  units: 3,
};

describe('SellOrderModal', () => {
  const onCloseMock = jest.fn();
  const onPlaceSellRequestMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchSellOrderData as jest.Mock).mockResolvedValue(mockSellOrderResponse);
    (placeSellOrder as jest.Mock).mockResolvedValue({});
    (fetchXirr as jest.Mock).mockResolvedValue(mockXirrResponse);
  });

  test('renders skeleton while loading', async () => {
    let resolvePromise: (value: any) => void;
    (fetchSellOrderData as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(
      <SellOrderModal
        showModal={true}
        onClose={onCloseMock}
        data={sellOrderDataProp}
        onPlaceSellRequest={onPlaceSellRequestMock}
      />
    );

    expect(screen.getByTestId('sell-order-skeleton')).toBeInTheDocument();
    act(() => {
      resolvePromise(mockSellOrderResponse);
    });
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Place Sell Request/i })
      ).toBeInTheDocument();
    });
  });

  test('shows error when input is empty', async () => {
    render(
      <SellOrderModal
        showModal={true}
        onClose={onCloseMock}
        data={sellOrderDataProp}
        onPlaceSellRequest={onPlaceSellRequestMock}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Place Sell Request/i })
      ).toBeInTheDocument();
    });

    const input = document.getElementById('unitsToSell') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '' } });
    expect(
      screen.getByText(/You must sell at least one unit./i)
    ).toBeInTheDocument();
  });

  test('shows error when input is "0" and resets to "1"', async () => {
    render(
      <SellOrderModal
        showModal={true}
        onClose={onCloseMock}
        data={sellOrderDataProp}
        onPlaceSellRequest={onPlaceSellRequestMock}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Place Sell Request/i })
      ).toBeInTheDocument();
    });

    const input = document.getElementById('unitsToSell') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '0' } });
    expect(
      screen.getByText(/You must sell at least one unit./i)
    ).toBeInTheDocument();
    expect(input.value).toBe('1');
  });

  test('shows error and resets input when input exceeds eligible holdings', async () => {
    render(
      <SellOrderModal
        showModal={true}
        onClose={onCloseMock}
        data={sellOrderDataProp}
        onPlaceSellRequest={onPlaceSellRequestMock}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Place Sell Request/i })
      ).toBeInTheDocument();
    });

    const input = document.getElementById('unitsToSell') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '10' } });
    expect(
      screen.getByText(/You can only sell units that are eligible for sale./i)
    ).toBeInTheDocument();
    expect(input.value).toBe('3');
  });

  test('calls onPlaceSellRequest when valid input is provided and button clicked', async () => {
    render(
      <SellOrderModal
        showModal={true}
        onClose={onCloseMock}
        data={sellOrderDataProp}
        onPlaceSellRequest={onPlaceSellRequestMock}
      />
    );
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Place Sell Request/i })
      ).toBeInTheDocument();
    });
    const input = document.getElementById('unitsToSell') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '3' } });

    const button = screen.getByRole('button', { name: /Place Sell Request/i });
    expect(button).not.toBeDisabled();
    await waitFor(() => {
      fireEvent.click(button);
    });
    await waitFor(() => {
      expect(placeSellOrder).toHaveBeenCalledWith(123, 3);
      expect(onPlaceSellRequestMock).toHaveBeenCalled();
    });
  });
});
