import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DealDetails from './DealDetails';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('DealDetails Component', () => {
  const mockDealDetails = {
    isin: 'US1234567890',
    tranche: 'A',
    orderDate: '2023-05-15T10:30:00Z',
    settlementDate: '2023-06-01T14:45:00Z',
    orderReceipt: 'https://example.com/receipt.pdf',
    dealSheet: 'https://example.com/dealsheet.pdf',
  };

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders null if no dealDetails prop is provided', () => {
    const { container } = render(<DealDetails />);
    expect(container.firstChild).toBeNull();
  });

  test('renders deal details correctly when valid dealDetails prop is provided', () => {
    render(<DealDetails dealDetails={mockDealDetails} />);

    expect(screen.getByText(/Tranche: A/i)).toBeInTheDocument();
    expect(screen.getByText(/Order Placed on:/i)).toBeInTheDocument();
    expect(screen.getByText(/Settled on:/i)).toBeInTheDocument();
    expect(screen.getByText(/Order Receipt/i)).toBeInTheDocument();
    expect(screen.getByText(/Deal Sheet/i)).toBeInTheDocument();
    const downloadLinks = screen.getAllByText(/Download/i);
    expect(downloadLinks).toHaveLength(2);
  });

  test('triggers document download when a download link is clicked', async () => {
    render(<DealDetails dealDetails={mockDealDetails} />);
    const orderReceiptDownloadLink =
      screen.getByText(/Order Receipt/i).nextElementSibling;
    expect(orderReceiptDownloadLink).toBeInTheDocument();

    fireEvent.click(orderReceiptDownloadLink!);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(mockDealDetails.orderReceipt);
    });
  });
});
