import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Documents from '.';
import { fetchDocuments, getSignedUrl } from '../../../api/document';
import { useAppSelector } from '../../../redux/slices/hooks';
import { postMessageToNativeOrFallback } from '../../../utils/appHelpers';
import { callErrorToast } from '../../../api/strapi';

// Mock dependencies
jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));
jest.mock('../../../api/document', () => ({
  fetchDocuments: jest.fn(),
  getSignedUrl: jest.fn(),
}));
jest.mock('../../../api/strapi', () => ({
  callErrorToast: jest.fn(),
}));
jest.mock('../../../utils/appHelpers', () => ({
  postMessageToNativeOrFallback: jest.fn(),
}));
jest.mock('./GID', () => {
  return function MockGID({ gidDocuments }) {
    return gidDocuments?.length > 0 ? (
      <div data-testid="gid-component" />
    ) : null;
  };
});
jest.mock('./AGTS', () => {
  return function MockAGTS({ agtsDocuments }) {
    return agtsDocuments?.length > 0 ? (
      <div data-testid="agts-component" />
    ) : null;
  };
});
jest.mock('../../common/noData', () => {
  return function MockNoData({ header }) {
    return <div data-testid="no-data">{header}</div>;
  };
});
jest.mock('../../primitives/CustomSkeleton/CustomSkeleton', () => {
  return function MockCustomSkeleton() {
    return <div data-testid="custom-skeleton" />;
  };
});
jest.mock('./DocumentButton', () => {
  return function MockDocumentButton({ name, onClick }) {
    return (
      <button data-testid={`document-button-${name}`} onClick={onClick}>
        {name}
      </button>
    );
  };
});

describe('Documents Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();

    (useAppSelector as jest.Mock).mockReturnValue({ userID: 'user123' });

    // Ensure a valid DOM container exists
    const rootDiv = document.createElement('div');
    rootDiv.setAttribute('id', 'root');
    document.body.appendChild(rootDiv);
  });

  afterEach(() => {
    // Clean up the DOM container after each test
    const rootDiv = document.getElementById('root');
    if (rootDiv) {
      document.body.removeChild(rootDiv);
    }
  });

  test('renders loading skeletons initially', () => {
    (fetchDocuments as jest.Mock).mockResolvedValue({ list: [] });

    const { container } = render(<Documents />);
    expect(container).toBeInTheDocument();

    const skeletons = screen.getAllByTestId('custom-skeleton');
    expect(skeletons.length).toBe(6); // 1 for title + 5 for document buttons
  });

  test('renders NoData component when no documents are available', async () => {
    (fetchDocuments as jest.Mock).mockResolvedValue({ list: [] });

    render(<Documents />);

    await waitFor(() => {
      expect(screen.getByTestId('no-data')).toBeInTheDocument();
      expect(screen.getByText('No documents available')).toBeInTheDocument();
    });
  });

  test('renders documents when available', async () => {
    const mockDocuments = [
      { docType: 'gid', displayName: 'GID Doc 1' },
      { docType: 'agts', displayName: 'AGTS Doc 1' },
      { docSubType: 'pan', filePath: '/path/to/file', displayName: 'PAN' },
      { docSubType: 'aof', filePath: '/path/to/file', displayName: 'AOF' },
    ];

    (fetchDocuments as jest.Mock).mockResolvedValue({ list: mockDocuments });

    render(<Documents />);

    await waitFor(() => {
      expect(screen.getByTestId('gid-component')).toBeInTheDocument();
      expect(screen.getByTestId('agts-component')).toBeInTheDocument();
      expect(
        screen.getByText('Download a copy of your documents')
      ).toBeInTheDocument();
    });
  });

  test('handles AOF download with correct filename', async () => {
    const mockDocuments = [
      {
        docSubType: 'aof',
        filePath: '/path/to/file',
        displayName: 'Account Opening Form',
        fileName: 'aof',
      },
    ];

    (fetchDocuments as jest.Mock).mockResolvedValue({ list: mockDocuments });
    (getSignedUrl as jest.Mock).mockResolvedValue({
      url: 'https://example.com/signed-url',
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        blob: () =>
          Promise.resolve(
            new Blob(['pdf content'], { type: 'application/pdf' })
          ),
      } as Response)
    );

    render(<Documents />);
    await waitFor(() => {
      expect(
        screen.getByTestId('document-button-Account Opening Form')
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('document-button-Account Opening Form'));

    await waitFor(() => {
      expect(postMessageToNativeOrFallback).toHaveBeenCalledWith(
        'downloadAppDocument',
        {
          url: 'https://example.com/signed-url',
          fileName: 'aof.pdf',
        },
        expect.any(Function)
      );
    });
  });

  test('handles error during document download', async () => {
    const mockDocuments = [
      { docSubType: 'pan', filePath: '/path/to/file', displayName: 'PAN Card' },
    ];

    (fetchDocuments as jest.Mock).mockResolvedValue({ list: mockDocuments });
    (getSignedUrl as jest.Mock).mockRejectedValue(
      new Error('Failed to get signed URL')
    );

    render(<Documents />);

    await waitFor(() => {
      expect(screen.getByTestId('document-button-PAN')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('document-button-PAN'));

    await waitFor(() => {
      expect(callErrorToast).toHaveBeenCalledWith(
        'Cannot open the document, please try again in some time'
      );
    });
  });
});
