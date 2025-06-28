import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppDownloadModal from '.';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('../primitives/MaterialModalPopup', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal">{children}</div>
  ),
}));

jest.mock('../primitives/Image', () => ({
  __esModule: true,
  default: ({ alternativeText }: { alternativeText: string }) => (
    <img alt={alternativeText} data-testid="image" />
  ),
}));

jest.mock('../primitives/Button', () => {
  return {
    __esModule: true,
    ButtonType: { Primary: 'primary' },
    default: ({ onClick, children }: any) => (
      <button onClick={onClick} data-testid="download-button">
        {children}
      </button>
    ),
  };
});

describe('AppDownloadModal', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders desktop modal content correctly', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  
    render(<AppDownloadModal />);
  
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Marketplace is available')).toBeInTheDocument();
    expect(screen.getByText('only on Grip App')).toBeInTheDocument();
    expect(screen.queryByTestId('download-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('image')).toBeInTheDocument();
  });
  
  it('renders mobile modal content with download button', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<AppDownloadModal />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Download to View Deal')).toBeInTheDocument();
    expect(screen.getByTestId('image')).toBeInTheDocument();
  });

  it('clicking the button navigates to /marketplace', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<AppDownloadModal />);
    const downloadButton = screen.getByTestId('download-button');
    const anchor = downloadButton.closest('a');
    expect(anchor).toHaveAttribute('href', 'https://gripinvest.app.link/Website_Nav_Bar');
    expect(anchor).toHaveAttribute('target', '_blank');
  });

  it('modal is initially visible', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(<AppDownloadModal />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });
});
