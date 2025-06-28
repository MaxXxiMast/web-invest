import { render, screen, fireEvent } from '@testing-library/react';
import HighlightSection from './index';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../redux/slices/hooks';

jest.mock('lodash', () => ({
    groupBy: jest.fn((data, key) => {
        if (!data || !Array.isArray(data)) return {};
        return data.reduce((acc, item) => {
            const groupKey = item[key];
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(item);
            return acc;
        }, {});
    }),
}));
  
jest.mock('./ReasonToInvest', () => {
    const ReasonToInvestMock = jest.fn(props => {
        const { data = [], handleModal, showSeeMore, className } = props || {};
        return (
            <div data-testid="reason-to-invest" className={className || ''}>
                {data.map((item, index) => (
                    <div key={index} data-testid="reason-item">
                        {item.text || item.title || 'Item'}
                    </div>
                ))}
                {showSeeMore !== false && handleModal && (
                    <button 
                      data-testid="see-more-reasons" 
                      onClick={() => handleModal('resonToInvest')}
                    >
                        See more
                    </button>
                )}
            </div>
        );
    });
    return {
        __esModule: true,
        default: ReasonToInvestMock
    };
});
  
jest.mock('./ImageHighlights', () => {
    const ImageHighlightsMock = jest.fn(props => {
        const { bannerData = {}, handleModal, showSeeMore, className, isFallbackCard } = props || {};
        return (
            <div data-testid="image-highlights" className={className || ''}>
                {Object.keys(bannerData).map((key, index) => (
                    <div key={index} data-testid="image-highlight-item">{key}</div>
                ))}
                {showSeeMore !== false && handleModal && !isFallbackCard && (
                    <button 
                      data-testid="see-more-images" 
                      onClick={() => handleModal('imgHighlights')}
                    >
                      See more
                    </button>
                )}
                {isFallbackCard && <div data-testid="fallback-card">Fallback Card</div>}
            </div>
        );
    });
    return {
        __esModule: true,
        default: ImageHighlightsMock
    };
});
  
jest.mock('../../primitives/MaterialModalPopup', () => {
    const MaterialModalPopupMock = jest.fn(props => {
        const { children, showModal, handleModalClose } = props || {};
        return showModal ? (
            <div data-testid="modal-popup">
                {children}
                <button 
                  data-testid="modal-close-btn" 
                  onClick={handleModalClose}
                >
                  Close Modal
                </button>
            </div>
        ) : null;
    });
    return {
        __esModule: true,
        default: MaterialModalPopupMock
    };
});
  
jest.mock('../../primitives/Button', () => {
    const ButtonMock = jest.fn(props => {
        const { children, onClick, className, width } = props || {};
        return (
            <button 
              className={className} 
              data-testid="custom-button" 
              onClick={onClick}
              style={width ? { width } : {}}
            >
                {children}
            </button>
        );
    });
    return {
        __esModule: true,
        default: ButtonMock
    };
});
  
jest.mock('../../primitives/CustomSkeleton/CustomSkeleton', () => {
    const CustomSkeletonMock = jest.fn(props => {
        const { styles } = props || {};
        return (
            <div 
              data-testid="custom-skeleton" 
              style={styles || {}}
            >
                Loading...
            </div>
        );
    });
    return {
        __esModule: true,
        default: CustomSkeletonMock
    };
});

jest.mock('./utils', () => ({
    fallbackData: {
        'Fallback Title': [{
            title: 'Fallback Title',
            description: 'Fallback Description',
            imgUrl: 'fallback-url.jpg'
        }]
    }
}));

jest.mock('../../../utils/customHooks/useMediaQuery');
jest.mock('../../../redux/slices/hooks');

describe('HighlightSection Component', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should render loading skeletons when data is not loaded', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        (useAppSelector as jest.Mock).mockImplementation((selector) => {
            const state = {
                assets: {
                    selectedAsset: {
                        highlightsMap: null,
                        isDetailsLoaded: false
                    }
                }
            };
            return selector(state);
        });
      
        render(<HighlightSection />);

        const skeletons = screen.getAllByTestId('custom-skeleton');
        expect(skeletons).toHaveLength(2);
    });

    test('should render loading skeletons in mobile view', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(true);
        (useAppSelector as jest.Mock).mockImplementation((selector) => {
            const state = {
                assets: {
                    selectedAsset: {
                        highlightsMap: null,
                        isDetailsLoaded: false
                    }
                }
            };
            return selector(state);
        });
    
        render(<HighlightSection />);
        
        const skeletons = screen.getAllByTestId('custom-skeleton');
        expect(skeletons).toHaveLength(2);
    });

    test('should render nothing when data is loaded but no highlights or image highlights', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        (useAppSelector as jest.Mock).mockImplementation((selector) => {
            const state = {
                assets: {
                    selectedAsset: {
                        highlightsMap: {
                            highlights: [],
                            imageHighlights: []
                        },
                        isDetailsLoaded: true
                    }
                }
            };
            return selector(state);
        });
      
        const { container } = render(<HighlightSection />);
        expect(container.firstChild).toBeNull();
    });

    test('should render fallback card when on desktop with only one data type present', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        (useAppSelector as jest.Mock).mockImplementation((selector) => {
            const state = {
                assets: {
                    selectedAsset: {
                        highlightsMap: {
                            highlights: [{ id: 1, text: 'Test highlight' }],
                            imageHighlights: []
                        },
                        isDetailsLoaded: true
                    }
                }
            };
            return selector(state);
        });

        render(<HighlightSection />);

        expect(screen.getByTestId('reason-to-invest')).toBeInTheDocument();
        expect(screen.getByTestId('image-highlights')).toBeInTheDocument();
        expect(screen.getByTestId('fallback-card')).toBeInTheDocument();
    });

    test('should not render fallback card on mobile with only one data type present', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(true);
        (useAppSelector as jest.Mock).mockImplementation((selector) => {
            const state = {
                assets: {
                    selectedAsset: {
                        highlightsMap: {
                            highlights: [{ id: 1, text: 'Test highlight' }],
                            imageHighlights: []
                        },
                        isDetailsLoaded: true
                    }
                }
            };
            return selector(state);
        });
      
        render(<HighlightSection />);

        expect(screen.getByTestId('reason-to-invest')).toBeInTheDocument();
        expect(screen.queryByTestId('image-highlights')).not.toBeInTheDocument();
    });

    test('should open image highlights modal when see more button is clicked', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        (useAppSelector as jest.Mock).mockImplementation((selector) => {
            const state = {
                assets: {
                    selectedAsset: {
                        highlightsMap: {
                            highlights: [],
                            imageHighlights: [{ title: 'Test', url: 'test.jpg' }]
                        },
                        isDetailsLoaded: true
                    }
                }
            };
            return selector(state);
        });
      
        render(<HighlightSection />);

        const seeMoreBtn = screen.getByTestId('see-more-images');
        fireEvent.click(seeMoreBtn);

        expect(screen.getByTestId('modal-popup')).toBeInTheDocument();
        expect(screen.getAllByTestId('image-highlights')[0]).toBeInTheDocument();
    });

    test('should close modal when okay button is clicked', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        (useAppSelector as jest.Mock).mockImplementation((selector) => {
            const state = {
                assets: {
                    selectedAsset: {
                        highlightsMap: {
                            highlights: [{ id: 1, text: 'Test highlight' }],
                            imageHighlights: []
                        },
                        isDetailsLoaded: true
                    }
                }
            };
            return selector(state);
        });

        render(<HighlightSection />);

        const seeMoreBtn = screen.getByTestId('see-more-reasons');
        fireEvent.click(seeMoreBtn);
        expect(screen.getByTestId('modal-popup')).toBeInTheDocument();

        const okayButton = screen.getByTestId('custom-button');
        fireEvent.click(okayButton);
        expect(screen.queryByTestId('modal-popup')).not.toBeInTheDocument();
    });

    test('should close modal when close button is clicked', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(false);
        (useAppSelector as jest.Mock).mockImplementation((selector) => {
            const state = {
                assets: {
                    selectedAsset: {
                        highlightsMap: {
                            highlights: [{ id: 1, text: 'Test highlight' }],
                            imageHighlights: []
                        },
                        isDetailsLoaded: true
                    }
                }
            };
            return selector(state);
        });

        render(<HighlightSection />);

        const seeMoreBtn = screen.getByTestId('see-more-reasons');
        fireEvent.click(seeMoreBtn);
        expect(screen.getByTestId('modal-popup')).toBeInTheDocument();

        const closeBtn = screen.getByTestId('modal-close-btn');
        fireEvent.click(closeBtn);
        expect(screen.queryByTestId('modal-popup')).not.toBeInTheDocument();
    });
});