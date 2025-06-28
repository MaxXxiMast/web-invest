import { render, screen, fireEvent } from '@testing-library/react';
import Dealassist from './Dealassist';
import { useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { isGCOrder } from '../../../utils/gripConnect';
import { trackEvent } from '../../../utils/gtm';

// Mock dependencies
jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));
jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));
jest.mock('../../../utils/gripConnect', () => ({
  isGCOrder: jest.fn(),
}));
jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));
jest.mock('../../../utils/financeProductTypes', () => ({
  isHighYieldFd: jest.fn(() => false),
}));

describe('Dealassist', () => {
  const mockSetShowAiPopup = jest.fn();

  beforeEach(() => {
    (useAppSelector as jest.Mock).mockImplementation((selectorFn: any) =>
      selectorFn({
        user: { userData: { userID: '123' } },
        aiAssist: { messages: [], assetId: 'asset-1' },
      })
    );
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    (isGCOrder as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Deal Assist button and handles click', () => {
    render(
      <Dealassist
        setShowAiPopup={mockSetShowAiPopup}
        asset={{ assetID: 'asset-1' }}
      />
    );

    const button = screen.getByRole('button', { name: /Deal Assist/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(trackEvent).toHaveBeenCalledWith(
      'deal_assist_button_clicked',
      expect.objectContaining({
        userID: '123',
        clickCount: 1,
      })
    );

    expect(mockSetShowAiPopup).toHaveBeenCalledWith(true);
  });

  it('renders GC button when isGCOrder returns true', () => {
    (isGCOrder as jest.Mock).mockReturnValue(true);

    render(
      <Dealassist
        setShowAiPopup={mockSetShowAiPopup}
        asset={{ assetID: 'asset-1' }}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('dealAssistGCButton');
  });

  it('does not render button if asset is High Yield FD', () => {
    const { isHighYieldFd } = require('../../../utils/financeProductTypes');
    isHighYieldFd.mockReturnValue(true);

    render(
      <Dealassist
        setShowAiPopup={mockSetShowAiPopup}
        asset={{ assetID: 'asset-1' }}
      />
    );

    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('does not render button if asset is missing and High Yield', () => {
    const { isHighYieldFd } = require('../../../utils/financeProductTypes');
    isHighYieldFd.mockReturnValue(true);

    render(<Dealassist setShowAiPopup={mockSetShowAiPopup} />);

    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });
  it('renders blue dot when conditions are met', () => {
    const { isHighYieldFd } = require('../../../utils/financeProductTypes');
    isHighYieldFd.mockReturnValue(false);
  
    (useAppSelector as jest.Mock).mockImplementation((selectorFn: any) =>
      selectorFn({
        user: { userData: { userID: '123' } },
        aiAssist: { messages: ['Hello'], assetId: 'asset-1' },
      })
    );
  
    render(
      <Dealassist
        setShowAiPopup={mockSetShowAiPopup}
        onMinimize={() => {}}
        asset={{ assetID: 'asset-1' }}
      />
    );
  
    const dot = screen.getByTestId('blue-dot');
    expect(dot).toBeInTheDocument();
  });

  it('applies mobile styles when isMobile is true', () => {
    const { isHighYieldFd } = require('../../../utils/financeProductTypes');
    isHighYieldFd.mockReturnValue(false);
  
    (useMediaQuery as jest.Mock).mockReturnValue(true);
  
    render(
      <Dealassist
        setShowAiPopup={mockSetShowAiPopup}
        asset={{ assetID: 'asset-1' }}
      />
    );
  
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ height: '28px' });
  });
  

  it('increments click count on multiple clicks', () => {
    render(
      <Dealassist
        setShowAiPopup={mockSetShowAiPopup}
        asset={{ assetID: 'asset-1' }}
      />
    );

    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(trackEvent).toHaveBeenCalledTimes(3);
  });
});
