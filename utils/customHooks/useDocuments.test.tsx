import React from 'react';
import { render, act } from '@testing-library/react';
import useAssetDocuments, { documentCache } from './useDocuments';
import { fetchDocuments } from '../../api/document';
import { isUserLogged } from '../user';

// Mock react-redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock other dependencies
jest.mock('../../api/document', () => ({
  fetchDocuments: jest.fn(),
}));

jest.mock('../user', () => ({
  isUserLogged: jest.fn(),
}));

// Type declarations for mocked functions
const mockUseSelector = require('react-redux').useSelector as jest.Mock;
const mockIsUserLogged = isUserLogged as jest.Mock;
const mockFetchDocuments = fetchDocuments as jest.Mock;

// Test component
const TestComponent = ({ assetID }: { assetID: string | null }) => {
  const documents = useAssetDocuments({ assetID });
  return (
    <div data-testid="documents-container">
      {documents.map((doc, index) => (
        <div key={index}>{doc.id}</div>
      ))}
    </div>
  );
};

describe('useAssetDocuments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the cache before each test
    Object.keys(documentCache).forEach((key) => delete documentCache[key]);
  });

  it('should return empty array when no assetID is provided', () => {
    mockUseSelector.mockImplementation((selector) => {
      // Mock the specific selector behavior
      return 'active'; // Return default asset status
    });
    mockIsUserLogged.mockReturnValue(true);

    const { getByTestId } = render(<TestComponent assetID={null} />);
    expect(getByTestId('documents-container')).toBeEmptyDOMElement();
  });

  it('should return empty array for past assets', () => {
    mockUseSelector.mockImplementation((selector) => {
      return 'past'; // Return past asset status
    });
    mockIsUserLogged.mockReturnValue(true);

    const { getByTestId } = render(<TestComponent assetID="123" />);
    expect(getByTestId('documents-container')).toBeEmptyDOMElement();
  });

  it('should return cached documents without API call', () => {
    mockUseSelector.mockImplementation((selector) => {
      return 'active';
    });
    mockIsUserLogged.mockReturnValue(true);
    documentCache['123'] = [{ id: 'cached', docType: 'pdf', displayOrder: 1 }];

    const { getByTestId } = render(<TestComponent assetID="123" />);
    expect(getByTestId('documents-container')).toHaveTextContent('cached');
    expect(mockFetchDocuments).not.toHaveBeenCalled();
  });

  it('should fetch and return documents when not cached', async () => {
    mockUseSelector.mockImplementation((selector) => {
      return 'active';
    });
    mockIsUserLogged.mockReturnValue(true);
    mockFetchDocuments.mockResolvedValue({
      list: [
        { id: 'doc1', docType: 'pdf', displayOrder: 2 },
        { id: 'doc2', docType: 'pdf', displayOrder: 1 },
      ],
    });

    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<TestComponent assetID="123" />));
    });

    expect(container!.textContent).toContain('doc1');
    expect(container!.textContent).toContain('doc2');
  });

  it('should filter out website documents except third_party_logo', async () => {
    mockUseSelector.mockImplementation((selector) => {
      return 'active';
    });
    mockIsUserLogged.mockReturnValue(true);
    mockFetchDocuments.mockResolvedValue({
      list: [
        { id: 'doc1', docType: 'pdf', displayOrder: 1 },
        { id: 'web1', docType: 'website', docSubType: 'other' },
        { id: 'logo1', docType: 'website', docSubType: 'third_party_logo' },
      ],
    });

    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<TestComponent assetID="123" />));
    });

    expect(container!.textContent).toContain('doc1');
    expect(container!.textContent).toContain('logo1');
    expect(container!.textContent).not.toContain('web1');
  });

  it('should sort documents by displayOrder', async () => {
    mockUseSelector.mockImplementation((selector) => {
      return 'active';
    });
    mockIsUserLogged.mockReturnValue(true);
    mockFetchDocuments.mockResolvedValue({
      list: [
        { id: 'doc2', docType: 'pdf', displayOrder: 2 },
        { id: 'doc1', docType: 'pdf', displayOrder: 1 },
      ],
    });

    let container: HTMLElement;
    await act(async () => {
      ({ container } = render(<TestComponent assetID="123" />));
    });

    const content = container!.textContent;
    expect(content!.indexOf('doc1')).toBeLessThan(content!.indexOf('doc2'));
  });

  it('should handle API errors gracefully', async () => {
    mockUseSelector.mockImplementation((selector) => {
      return 'active';
    });
    mockIsUserLogged.mockReturnValue(true);
    mockFetchDocuments.mockRejectedValue(new Error('API Error'));

    const { getByTestId } = render(<TestComponent assetID="123" />);

    await act(async () => {
      // Wait for potential state updates
    });

    const container = getByTestId('documents-container');
    expect(container.children).toHaveLength(0); // Verify no documents are rendered
  });

  it('should not fetch documents for unauthenticated users', () => {
    mockUseSelector.mockImplementation((selector) => {
      return 'active';
    });
    mockIsUserLogged.mockReturnValue(false);

    render(<TestComponent assetID="123" />);
    expect(mockFetchDocuments).not.toHaveBeenCalled();
  });
});
