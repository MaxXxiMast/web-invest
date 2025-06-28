import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GIDDocModal from './GIDDocModal';
import { getSignedUrl } from '../../api/document';
import { trackEvent } from '../../utils/gtm';
import { postMessageToNativeOrFallback } from '../../utils/appHelpers';

// Mock dependencies
jest.mock('../../api/document');
jest.mock('../../utils/gtm');
jest.mock('../../utils/appHelpers');

describe('GIDDocModal', () => {
  const mockCloseModal = jest.fn();
  const mockGid = [
    { docID: '123', displayName: 'GID Document 1', fileName: 'gid1.pdf' },
    { docID: '456', displayName: 'GID Document 2', fileName: 'gid2.pdf' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getSignedUrl as jest.Mock).mockResolvedValue({
      url: 'https://example.com/signed-url',
    });
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
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
  });

  test('renders correctly with GID documents', () => {
    render(<GIDDocModal gid={mockGid} closeModal={mockCloseModal} />);

    expect(screen.getByText('Download GID Document')).toBeInTheDocument();
    expect(screen.getByText('GID Document 1')).toBeInTheDocument();
    expect(screen.getByText('GID Document 2')).toBeInTheDocument();
  });

  test('renders correctly with empty GID array', () => {
    render(<GIDDocModal gid={[]} closeModal={mockCloseModal} />);

    expect(screen.getByText('Download GID Document')).toBeInTheDocument();
    expect(screen.queryByText('GID Document 1')).not.toBeInTheDocument();
  });

  test('applies custom className if provided', () => {
    render(
      <GIDDocModal
        gid={mockGid}
        className="custom-class"
        closeModal={mockCloseModal}
      />
    );

    const modalElement = screen
      .getByText('Download GID Document')
      .closest('div').parentElement;
    expect(modalElement).toHaveClass('custom-class');
  });

  test('calls trackEvent with correct parameters when document is clicked', async () => {
    render(<GIDDocModal gid={mockGid} closeModal={mockCloseModal} />);

    const firstDoc = screen.getByText('GID Document 1');
    fireEvent.click(firstDoc);

    expect(trackEvent).toHaveBeenCalledWith('document_requested', {
      doctype: 'GID',
      option_text: 'GID Document 1',
    });
  });

  test('calls getSignedUrl with correct parameters when document is clicked', async () => {
    render(<GIDDocModal gid={mockGid} closeModal={mockCloseModal} />);

    const firstDoc = screen.getByText('GID Document 1');
    fireEvent.click(firstDoc);

    expect(getSignedUrl).toHaveBeenCalledWith({
      module: 'user',
      docID: '123',
    });
  });

  test('creates and clicks download link when fallback function is called', async () => {
    const appendChildMock = jest.spyOn(document.body, 'appendChild');
    const createElementMock = jest.spyOn(document, 'createElement');
    render(<GIDDocModal gid={mockGid} closeModal={mockCloseModal} />);

    const firstDoc = screen.getByText('GID Document 1');
    fireEvent.click(firstDoc);

    // Extract the fallback function that would be called
    await waitFor(() => {
      const fallbackFn = (postMessageToNativeOrFallback as jest.Mock).mock
        .calls[0][2];
      fallbackFn();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('https://example.com/signed-url', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });
      expect(createElementMock).toHaveBeenCalled();
      expect(appendChildMock).toHaveBeenCalled();

      expect(mockCloseModal).toHaveBeenCalled();
    });

    createElementMock.mockRestore();
    appendChildMock.mockRestore();
  });
});
