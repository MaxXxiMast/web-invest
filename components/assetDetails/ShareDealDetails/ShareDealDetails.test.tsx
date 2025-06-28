import { render, screen, fireEvent } from '@testing-library/react';
import ShareDealDetails from '../../../components/assetDetails/ShareDealDetails';
import { useAppSelector } from '../../../redux/slices/hooks';
import * as useCopyToClipBoard from '../../../utils/customHooks/useCopyToClipBoard';

// Mock Redux hook
jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

// Mock clipboard copy function
jest.mock('../../../utils/customHooks/useCopyToClipBoard', () => ({
  copy: jest.fn(),
}));

describe('ShareDealDetails Component Testcases', () => {
  beforeEach(() => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedAsset: {
        partnerName: 'Test Partner',
        desc: 'Test description',
      },
    });
    window.open = jest.fn();
  });

  test('Copies URL to clipboard when Copy button is clicked', () => {
    const mockCopy = useCopyToClipBoard.copy as jest.Mock;
    mockCopy.mockClear();
  
    render(<ShareDealDetails />);
    const copyButton = screen.getByText('Copy').parentElement?.querySelector('img');
  
    fireEvent.click(copyButton!);
  
    expect(mockCopy).toHaveBeenCalledTimes(1);
    expect(mockCopy).toHaveBeenCalledWith(window.location.href);
  });
  
  test('renders social media share options', () => {
    render(<ShareDealDetails />);
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getByText('Whatsapp')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  test('opens mail link in new tab', () => {
    render(<ShareDealDetails />);
    const mailIcon = screen.getByText('Mail').parentElement?.querySelector('img');

    fireEvent.click(mailIcon!);
    expect(window.open).toHaveBeenCalledTimes(1);
  });

  test('opens WhatsApp link in new tab', () => {
    render(<ShareDealDetails />);
    const whatsappIcon = screen.getByText('Whatsapp').parentElement?.querySelector('img');

    fireEvent.click(whatsappIcon!);
    expect(window.open).toHaveBeenCalledTimes(1);
  });

  test('renders Share Deal header', () => {
    render(<ShareDealDetails />);
    expect(screen.getByText('Share Deal')).toBeInTheDocument();
  });

  test('Does NOT open new tab when Copy is clicked.', () => {
    render(<ShareDealDetails />);

    const copyButton = screen.getByText('Copy').closest('div');
    fireEvent.click(copyButton!);

    expect(window.open).not.toHaveBeenCalled();
  });

  test('Opens a new tab when a non-Copy media item is clicked', () => {
    render(<ShareDealDetails />);

    const mailIcon = screen.getByText('Mail').parentElement?.querySelector('img');
    fireEvent.click(mailIcon!);
    expect(window.open).toHaveBeenCalledTimes(1);
  });

});


