import { render, screen, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import AssetContent from './index';
import useAssetDocuments from '../../../utils/customHooks/useDocuments';
import { useAppSelector } from '../../../redux/slices/hooks';
import { isAssetBonds, isAssetStartupEquity } from '../../../utils/financeProductTypes';
import React from 'react';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('../../../redux/slices/hooks', () => ({
    useAppSelector: jest.fn(),
}));

jest.mock('../../../utils/customHooks/useDocuments', () => jest.fn());

jest.mock('../../../utils/financeProductTypes', () => ({
    isAssetBonds: jest.fn(),
    isAssetStartupEquity: jest.fn(),
}));

jest.mock('../../../redux/slices/assets', () => ({
    __esModule: true,
    fetchAndSetDetails: jest.fn((id, callback) => {
        if (callback) {
          callback();
        }
        return { type: 'mock/fetchAndSetDetails', payload: id };
    }),
    setAssetDocuments: jest.fn((docs) => {
      return { type: 'mock/setAssetDocuments', payload: docs };
    })
}));

jest.mock('../AssetContentSticky', () => jest.fn(() => <div data-testid="asset-content-sticky" />));
jest.mock('../AssetDealContent', () => jest.fn(() => <div data-testid="asset-deal-content" />));
jest.mock('../../primitives/CustomSkeleton/CustomSkeleton', () => jest.fn(() => <div data-testid="custom-skeleton" />));
jest.mock('../AssetDocument', () => jest.fn(() => <div data-testid="asset-documents" />));
jest.mock('../startUpEquityDetails', () => jest.fn(() => <div data-testid="startup-equity-details" />));
jest.mock('../../common/pdfViewer', () => jest.fn(() => <div data-testid="pdf-viewer" />));


describe('AssetContent Component', () => {
    const mockDispatch = jest.fn();
    const mockRouter = { query: { value: ['asset', '123'] } };
    const mockDocuments = [{ id: 1, name: 'Document 1' }, { id: 2, name: 'Document 2' }];
    
    beforeEach(() => {
        (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useAssetDocuments as jest.Mock).mockReturnValue(mockDocuments);
        
        mockDispatch.mockImplementation((action) => {
            if (typeof action === 'function') {
                action(mockDispatch);
            }
            return action;
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('render AssetContent with bonds', () => {
        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: [],
                detailsHeadings: [],
                detailsMap: {},
                assetID: 123,
                financeProductType: 'bonds',
            },
            partnerHeadings: [],
            detailsHeadings: [],
            detailsMap: {},
            assetID: 123,
            financeProductType: 'bonds',
        }));

        render(<AssetContent />);

        expect(screen.getByTestId('asset-content-sticky')).toBeInTheDocument();
        expect(screen.getByTestId('asset-documents')).toBeInTheDocument();
    });

    test('should render startup equity content with investor deck', async () => {
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()]); // loader

        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: [],
                detailsHeadings: ['Overview'],
                detailsMap: {
                  'Overview': [{ title: 'Overview Info', content: 'Overview details' }],
                },
                assetID: 123,
                financeProductType: 'startupEquity',
                investorDeckUrl: 'https://example.com/deck.pdf',
            },
            partnerHeadings: [],
            detailsHeadings: ['Overview'],
            detailsMap: {
              'Overview': [{ title: 'Overview Info', content: 'Overview details' }],
            },
            assetID: 123,
            financeProductType: 'startupEquity',
            investorDeckUrl: 'https://example.com/deck.pdf',
        }));
      
        (isAssetBonds as jest.Mock).mockReturnValue(false);
        (isAssetStartupEquity as jest.Mock).mockReturnValue(true);
      
        render(<AssetContent />);
      
        await waitFor(() => {
            expect(screen.getByText('Documents')).toBeInTheDocument();
        });
    });

    test('should render startup equity content with previous rounds', async () => {
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()]); // loader

        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: [],
                detailsHeadings: ['Overview'],
                detailsMap: {
                  'Overview': [{ title: 'Overview Info', content: 'Overview details' }],
                },
                assetID: 123,
                financeProductType: 'startupEquity',
                partnerFundingDetails: [{ round: 'Seed', amount: '$1M' }],
            },
            partnerHeadings: [],
            detailsHeadings: ['Overview'],
            detailsMap: {
              'Overview': [{ title: 'Overview Info', content: 'Overview details' }],
            },
            assetID: 123,
            financeProductType: 'startupEquity',
            partnerFundingDetails: [{ round: 'Seed', amount: '$1M' }],
        }));

        (isAssetBonds as jest.Mock).mockReturnValue(false);
        (isAssetStartupEquity as jest.Mock).mockReturnValue(true);

        render(<AssetContent />);

        await waitFor(() => {
            expect(screen.getByText('Documents')).toBeInTheDocument();
        });
    });

    test('should handle case with both investor deck and previous rounds', async () => {
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()]); // loader

        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: [],
                detailsHeadings: ['Overview'],
                detailsMap: {
                  'Overview': [{ title: 'Overview Info', content: 'Overview details' }],
                },
                assetID: 123,
                financeProductType: 'startupEquity',
                investorDeckUrl: 'https://example.com/deck.pdf',
                partnerFundingDetails: [{ round: 'Seed', amount: '$1M' }],
            },
            partnerHeadings: [],
            detailsHeadings: ['Overview'],
            detailsMap: {
              'Overview': [{ title: 'Overview Info', content: 'Overview details' }],
            },
            assetID: 123,
            financeProductType: 'startupEquity',
            investorDeckUrl: 'https://example.com/deck.pdf',
            partnerFundingDetails: [{ round: 'Seed', amount: '$1M' }],
        }));

        (isAssetBonds as jest.Mock).mockReturnValue(false);
        (isAssetStartupEquity as jest.Mock).mockReturnValue(true);

        render(<AssetContent />);

        await waitFor(() => {
            expect(screen.getByText('Documents')).toBeInTheDocument();
        });
    });

    test('should not render documents section when documents array is empty', async () => {
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()]); // loader

        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: [],
                detailsHeadings: ['Overview'],
                detailsMap: {
                    'Overview': [{ title: 'Overview Info', content: 'Overview details' }],
                },
                assetID: 123,
                financeProductType: 'bonds',
            },
            partnerHeadings: [],
            detailsHeadings: ['Overview'],
            detailsMap: {
                'Overview': [{ title: 'Overview Info', content: 'Overview details' }],
            },
            assetID: 123,
            financeProductType: 'bonds',
        }));

        (isAssetBonds as jest.Mock).mockReturnValue(true);
        (isAssetStartupEquity as jest.Mock).mockReturnValue(false);

        (useAssetDocuments as jest.Mock).mockReturnValue([]);

        render(<AssetContent />);

        await waitFor(() => {
            expect(screen.queryByText('Documents')).not.toBeInTheDocument();
        });
    });

    test('should call setAssetDocuments with documents from hook', async () => {
        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: [],
                detailsHeadings: [],
                detailsMap: {},
                assetID: 123,
                financeProductType: 'bonds',
            },
            partnerHeadings: [],
            detailsHeadings: [],
            detailsMap: {},
            assetID: 123,
            financeProductType: 'bonds',
        }));

        const dispatchSpy = jest.fn();
        (useDispatch as jest.Mock).mockReturnValue(dispatchSpy);

        render(<AssetContent />);

        await waitFor(() => {
            expect(dispatchSpy).toHaveBeenCalledTimes(2);
        });
    });

    test('should handle case when selectedAsset is undefined', async() => {
        (useAppSelector as jest.Mock).mockImplementation(() => {
            if ((useAppSelector as jest.Mock).mock.calls.length === 1) {
                return undefined;
            }
            return {
                selectedAsset: {},
                partnerHeadings: undefined,
                detailsHeadings: undefined,
                detailsMap: undefined,
                assetID: undefined,
                financeProductType: undefined
            };
        });
      
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()]);
      
        render(<AssetContent />);

        await waitFor(() => {
            expect(screen.queryByText('Documents')).toBeInTheDocument();
        });
    });

    test('should handle case when router.query.value is undefined (else case)', () => {
        (useRouter as jest.Mock).mockReturnValue({ query: { value: 1 } });

        const setLoaderMock = jest.fn();
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [true, setLoaderMock]);
        
        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: [],
                detailsHeadings: [],
                detailsMap: {},
                assetID: 123,
                financeProductType: 'bonds',
            },
            partnerHeadings: [],
            detailsHeadings: [],
            detailsMap: {},
            assetID: 123,
            financeProductType: 'bonds',
        }));
      
        render(<AssetContent />);

        expect(setLoaderMock).toHaveBeenCalledWith(false);
    });

    test('should render with partner sections when partnerHeadings has valid data', async() => {
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()]);

        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: ['About Partners', 'Partner Info'],
                detailsHeadings: ['Overview'],
                detailsMap: {
                  'About Partners': [{ title: 'Partner 1', content: 'Partner 1 details' }],
                  'Partner Info': [{ title: 'Partner Info', content: 'More partner details' }],
                  'Overview': [{ title: 'Overview', content: 'Overview content' }]
                },
                assetID: 123,
                financeProductType: 'bonds',
            },
            partnerHeadings: ['About Partners', 'Partner Info'],
            detailsHeadings: ['Overview'],
            detailsMap: {
                'About Partners': [{ title: 'Partner 1', content: 'Partner 1 details' }],
                'Partner Info': [{ title: 'Partner Info', content: 'More partner details' }],
                'Overview': [{ title: 'Overview', content: 'Overview content' }]
            },
            assetID: 123,
            financeProductType: 'bonds',
        }));
      
        render(<AssetContent />);

        await waitFor(() => {
            expect(screen.queryByText('Documents')).toBeInTheDocument();
        });
    });

    test('should handle the case when selectedDetails is empty', async() => {
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()]);

        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: [],
                detailsHeadings: ['Overview', 'EmptySection'],
                detailsMap: {
                  'Overview': [{ title: 'Overview', content: 'Overview content' }],
                  'EmptySection': []
                },
                assetID: 123,
                financeProductType: 'bonds',
            },
            partnerHeadings: [],
            detailsHeadings: ['Overview', 'EmptySection'],
            detailsMap: {
                'Overview': [{ title: 'Overview', content: 'Overview content' }],
                'EmptySection': []
            },
            assetID: 123,
            financeProductType: 'bonds',
        }));
      
        (isAssetBonds as jest.Mock).mockReturnValue(true);

        render(<AssetContent />);

        await waitFor(() => {
            expect(screen.queryByText('Documents')).toBeInTheDocument();
        });
    });

    test('should handle empty partner section and return null', async() => {
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()]);
        
        (useAppSelector as jest.Mock).mockImplementation(() => ({
            selectedAsset: {
                partnerHeadings: ['About Partners', 'Empty Partner Section'],
                detailsHeadings: [],
                detailsMap: {
                    'About Partners': [{ title: 'Partner 1', content: 'Partner details' }],
                    'Empty Partner Section': []
                },
                assetID: 123,
                financeProductType: 'bonds',
            },
            partnerHeadings: ['About Partners', 'Empty Partner Section'],
            detailsHeadings: [],
            detailsMap: {
                'About Partners': [{ title: 'Partner 1', content: 'Partner details' }],
                'Empty Partner Section': []
            },
            assetID: 123,
            financeProductType: 'bonds',
        }));
      
        (isAssetBonds as jest.Mock).mockReturnValue(true);

        render(<AssetContent />);
      
        await waitFor(() => {
            expect(screen.queryByText('Documents')).toBeInTheDocument();
        });
    });
});
