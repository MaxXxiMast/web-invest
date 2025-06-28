import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NeedHelpPopup from './index';
import { fetchAPI } from '../../../api/strapi';

// Mock the external dependencies
jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
    useMediaQuery: jest.fn(),
}));

jest.mock('./index', () => {
    const originalModule = jest.requireActual('./index');
    const component = originalModule.default;
    originalModule.getServerData = jest.fn();

    return {
        __esModule: true,
        default: component,
        getServerData: originalModule.getServerData,
    };
});

jest.mock('../../../api/strapi', () => ({
    fetchAPI: jest.fn(),
}));

jest.mock('dompurify', () => ({
    sanitize: jest.fn((content) => content),
}));

jest.mock('../../../utils/string', () => ({
    urlify: jest.fn((str) => str.replace(/\s+/g, '-').toLowerCase()),
}));

// Mock MaterialModalPopup component
jest.mock('../../primitives/MaterialModalPopup', () => {
    return function MockedMaterialModalPopup({ children, showModal }) {
        return showModal ? (
            <div data-testid="material-modal">{children}</div>
        ) : null;
    };
});

describe('NeedHelpPopup Component', () => {
    const mockHandleClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test case 1
    test('renders with default data when API fails', async () => {
        // Mock API failure
        (fetchAPI as jest.Mock).mockRejectedValue(new Error('API error'));

        render(
            <NeedHelpPopup
                showNeedHelpModal={true}
                handleClose={mockHandleClose}
            />
        );

        expect(await screen.findByText('Need Help?')).toBeInTheDocument();
        expect(screen.getByText('Date of Birth (DOB) should be as mentioned on your PAN card')).toBeInTheDocument();
        expect(screen.getByText('Ensure you are entering the DOB in DDMMYYYY format. For eg, your DOB is 28 May 1985, then enter 28051985')).toBeInTheDocument();
        expect(screen.getByText('If issue still persists; then mail us at support@gripinvest.in')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    // Test case 2
    test('renders with data from API when successful', async () => {
        // Mock API success
        const mockAPIResponse = {
            data: [
                {
                    attributes: {
                        pageData: [
                            {
                                keyValue: 'needHelpPopup',
                                objectData: {
                                    title: 'Custom Help Title',
                                    data: [
                                        'Custom help item 1',
                                        'Custom help item 2',
                                        'Custom help item 3'
                                    ],
                                    buttonText: 'Custom Button'
                                }
                            }
                        ]
                    }
                }
            ]
        };

        (fetchAPI as jest.Mock).mockResolvedValue(mockAPIResponse);

        render(
            <NeedHelpPopup
                showNeedHelpModal={true}
                handleClose={mockHandleClose}
            />
        );

        // Wait for API data to load and render
        await waitFor(() => {
            expect(screen.getByText('Custom Help Title')).toBeInTheDocument();
            expect(screen.getByText('Custom help item 1')).toBeInTheDocument();
            expect(screen.getByText('Custom help item 2')).toBeInTheDocument();
            expect(screen.getByText('Custom help item 3')).toBeInTheDocument();
        });
    });

    // Test case 3
    test('closes modal when Try Again button is clicked', async () => {
        (fetchAPI as jest.Mock).mockRejectedValue(new Error('API error'));

        render(
            <NeedHelpPopup
                showNeedHelpModal={true}
                handleClose={mockHandleClose}
            />
        );

        // Find and click the Try Again button
        const tryAgainButton = await screen.findByText('Try Again');
        fireEvent.click(tryAgainButton);

        // Verify the close handler was called with expected argument
        expect(mockHandleClose).toHaveBeenCalledWith(false);
    });

    // Test case 4
    test('does not render when showNeedHelpModal is false', () => {
        (fetchAPI as jest.Mock).mockRejectedValue(new Error('API error'));

        render(
            <NeedHelpPopup
                showNeedHelpModal={false}
                handleClose={mockHandleClose}
            />
        );

        // When showNeedHelpModal is false, the modal content should not be in the document
        expect(screen.queryByText('Need Help?')).not.toBeInTheDocument();
    });

    // Test case 5
    test('sanitizes HTML content in list items', async () => {
        const mockDangerousHTML = '<script>alert("XSS")</script>Safe content';

        // Mock API with potentially dangerous HTML
        const mockAPIResponse = {
            data: [
                {
                    attributes: {
                        pageData: [
                            {
                                keyValue: 'needHelpPopup',
                                objectData: {
                                    title: 'Help Title',
                                    data: [mockDangerousHTML],
                                    buttonText: 'OK'
                                }
                            }
                        ]
                    }
                }
            ]
        };

        (fetchAPI as jest.Mock).mockResolvedValue(mockAPIResponse);

        render(
            <NeedHelpPopup
                showNeedHelpModal={true}
                handleClose={mockHandleClose}
            />
        );

        // Verify DOMPurify.sanitize was called with the dangerous content
        await waitFor(() => {
            expect(require('dompurify').sanitize).toHaveBeenCalledWith(mockDangerousHTML);
        });
    });

    // Test case 6
    test('handles API response with missing data properly', async () => {
        // Mock API with incomplete data
        const mockIncompleteResponse = {
            data: [
                {
                    attributes: {
                        pageData: [
                            {
                                keyValue: 'somethingElse',
                                objectData: {
                                    title: 'Wrong Title',
                                    data: ['Wrong item']
                                }
                            }
                        ]
                    }
                }
            ]
        };

        (fetchAPI as jest.Mock).mockResolvedValue(mockIncompleteResponse);

        render(
            <NeedHelpPopup
                showNeedHelpModal={true}
                handleClose={mockHandleClose}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Need Help?')).toBeInTheDocument();
            expect(screen.getByText('Date of Birth (DOB) should be as mentioned on your PAN card')).toBeInTheDocument();
        });
    });

    // Test case 7
    test('handles empty API response properly', async () => {
        // Mock API with empty response
        (fetchAPI as jest.Mock).mockResolvedValue({});

        render(
            <NeedHelpPopup
                showNeedHelpModal={true}
                handleClose={mockHandleClose}
            />
        );
        await waitFor(() => {
            expect(screen.getByText('Need Help?')).toBeInTheDocument();
        });
    });
});