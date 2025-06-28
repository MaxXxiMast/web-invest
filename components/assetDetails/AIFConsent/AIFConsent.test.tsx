import { render, screen, fireEvent } from '@testing-library/react';
import AifConsent from './index';
import { useAppSelector } from '../../../redux/slices/hooks';
import { assetStatus } from '../../../utils/asset';
import { isAssetCommercialProduct, isAssetStartupEquity } from '../../../utils/financeProductTypes';

jest.mock('../../../redux/slices/hooks', () => ({
    useAppSelector: jest.fn(),
}));

jest.mock('../../../utils/asset', () => ({
    assetStatus: jest.fn(),
}));

jest.mock('../../../utils/financeProductTypes', () => ({
    isAssetCommercialProduct: jest.fn(),
    isAssetStartupEquity: jest.fn(),
}));

jest.mock('dompurify', () => ({
    sanitize: jest.fn(html => html),
}));

jest.mock('../../primitives/Image', () => ({
    __esModule: true,
    default: function MockImage({ src, alternativeText }) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={src} 
              alt={alternativeText} 
              data-testid="mock-image" 
              width={100} 
              height={100}
            />
        );
    }
}));

jest.mock('../../common/IconDialog', () => ({
    __esModule: true,
    default: function MockIconDialog({ children, showDialog, headingText, onSubmit, onCloseDialog, submitButtonText }) {
        return showDialog ? (
            <div data-testid="mock-dialog">
                <h2>{headingText}</h2>
                <div>{children}</div>
                <button onClick={onSubmit} data-testid="dialog-submit">{submitButtonText}</button>
                <button onClick={onCloseDialog} data-testid="dialog-close">Close</button>
            </div>
        ) : null;
    }
}));

jest.mock('@mui/material/CircularProgress', () => ({
    __esModule: true,
    default: function MockCircularProgress() {
        return <div data-testid="mock-circular-progress">Loading...</div>;
    }
}));

jest.mock('../../utils/designUtils', () => ({
    getObjectClassNames: jest.fn(() => ({
        consentText: 'consentText',
        hyperLink: 'hyperLink',
        subHeader: 'subHeader',
        bold: 'bold',
    })),
}));

describe('AifConsent Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAppSelector as jest.Mock).mockReturnValue({
            spv: {
                aifDetails: {},
                spvLogo: 'https://example.com/logo.png',
            },
        });
        (assetStatus as jest.Mock).mockReturnValue('active');
        (isAssetCommercialProduct as jest.Mock).mockReturnValue(false);
        (isAssetStartupEquity as jest.Mock).mockReturnValue(false);
    });

    test('renders consent text when hideAIFConsent is false', () => {
        render(<AifConsent />);
        expect(screen.getByText(/By Continuing, I agree to be the part of/i)).toBeInTheDocument();
        expect(screen.getByText('AIF')).toBeInTheDocument();
    });

    test('does not render consent text when hideAIFConsent is true', () => {
        render(<AifConsent hideAIFConsent={true} />);
        expect(screen.queryByText(/By Continuing, I agree to be the part of/i)).not.toBeInTheDocument();
    });

    test('does not render AIF partner logo when hideAIFPartnerLogo is true', () => {
        render(<AifConsent hideAIFPartnerLogo={true} />);
        expect(screen.queryByText('Registered AIF Partner')).not.toBeInTheDocument();
    });

    test('shows CircularProgress when spvLogo is not available', () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            spv: {
                aifDetails: {},
                spvLogo: null,
            },
        });

        render(<AifConsent />);
        expect(screen.getByTestId('mock-circular-progress')).toBeInTheDocument();
    });

    test('opens popup dialog when AIF link is clicked', () => {
        render(<AifConsent />);

        expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
        fireEvent.click(screen.getByText('AIF'));    
        expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
        expect(screen.getAllByText('AIF')[0]).toBeInTheDocument();
    });

    test('closes dialog when OKAY button is clicked', () => {
        render(<AifConsent />);

        fireEvent.click(screen.getByText('AIF'));
        expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('dialog-submit'));    
        expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
    });

    test('closes dialog when close button is clicked', () => {
        render(<AifConsent />);

        fireEvent.click(screen.getByText('AIF'));
        expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('dialog-close'));
        expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
    });

    test('displays custom tooltip text when provided', () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            spv: {
                aifDetails: {
                    tooltip: '<p>Custom tooltip content</p>',
                    tooltipText: 'Custom AIF',
                },
                spvLogo: 'https://example.com/logo.png',
            },
        });

        render(<AifConsent />);

        expect(screen.getByText('Custom AIF')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Custom AIF'));
    });

    test('applies correct CSS classes for past startup equity assets', () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            spv: {
                aifDetails: {},
                spvLogo: 'https://example.com/logo.png',
            },
        });
        (assetStatus as jest.Mock).mockReturnValue('past');
        (isAssetStartupEquity as jest.Mock).mockReturnValue(true);

        const { container } = render(<AifConsent />);
        expect(container.querySelector('.BottomExtraCard.BottomExtraCardSEPast')).toBeInTheDocument();
    });

    test('applies correct CSS classes for past commercial product assets', () => {
        (useAppSelector as jest.Mock).mockReturnValue({
            spv: {
                aifDetails: {},
                spvLogo: 'https://example.com/logo.png',
            },
        });
        (assetStatus as jest.Mock).mockReturnValue('past');
        (isAssetCommercialProduct as jest.Mock).mockReturnValue(true);

        const { container } = render(<AifConsent />);
        expect(container.querySelector('.BottomExtraCard.BottomExtraCardCREPast')).toBeInTheDocument();
    });

    test('integrates with state.assets.selectedAsset correctly', () => {
        (useAppSelector as jest.Mock).mockImplementation((selector) => {
            const mockState = {
              assets: {
                selectedAsset: {
                  spv: {
                    aifDetails: {
                      tooltip: '<p>Test tooltip</p>',
                      tooltipText: 'Test AIF',
                    },
                    spvLogo: 'https://example.com/logo.png',
                  },
                },
              },
            };
            return selector(mockState);
        });

        render(<AifConsent />);

        expect(screen.getByText('Test AIF')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Test AIF'));
    });
});