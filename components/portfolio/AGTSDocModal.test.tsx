import { render, screen, fireEvent } from '@testing-library/react';
import AGTSDocModal from './AGTSDocModal';
import { getSignedUrl } from '../../api/document';
import { trackEvent } from '../../utils/gtm';

// Mock dependencies
jest.mock('../../api/document');
jest.mock('../../utils/gtm');
jest.mock('../../utils/appHelpers');

describe('AGTSDocModal', () => {
  const mockCloseModal = jest.fn();
  const mockAgts = [
    { docID: '123', displayName: 'AGTS Document 1', fileName: 'agts1.pdf' },
    { docID: '456', displayName: 'AGTS Document 2', fileName: 'agts2.pdf' },
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

  test('renders correctly with AGTS documents', () => {
    render(<AGTSDocModal agts={mockAgts} closeModal={mockCloseModal} />);

    expect(screen.getByText('Download AGTS Document')).toBeInTheDocument();
    expect(screen.getByText('AGTS Document 1')).toBeInTheDocument();
    expect(screen.getByText('AGTS Document 2')).toBeInTheDocument();
  });

  test('renders correctly with empty AGTS array', () => {
    render(<AGTSDocModal agts={[]} closeModal={mockCloseModal} />);

    expect(screen.getByText('Download AGTS Document')).toBeInTheDocument();
    expect(screen.queryByText('AGTS Document 1')).not.toBeInTheDocument();
  });

  test('applies custom className if provided', () => {
    render(
      <AGTSDocModal
        agts={mockAgts}
        className="custom-class"
        closeModal={mockCloseModal}
      />
    );

    const modalElement = screen
      .getByText('Download AGTS Document')
      .closest('div').parentElement;
    expect(modalElement).toHaveClass('custom-class');
  });

  test('calls trackEvent with correct parameters when document is clicked', async () => {
    render(<AGTSDocModal agts={mockAgts} closeModal={mockCloseModal} />);

    const firstDoc = screen.getByText('AGTS Document 1');
    fireEvent.click(firstDoc);

    expect(trackEvent).toHaveBeenCalledWith('document_requested', {
      doctype: 'AGTS',
      option_text: 'AGTS Document 1',
    });
  });

  test('calls getSignedUrl with correct parameters when document is clicked', async () => {
    render(<AGTSDocModal agts={mockAgts} closeModal={mockCloseModal} />);

    const firstDoc = screen.getByText('AGTS Document 1');
    fireEvent.click(firstDoc);

    expect(getSignedUrl).toHaveBeenCalledWith({
      module: 'user',
      docID: '123',
    });
  });
});
