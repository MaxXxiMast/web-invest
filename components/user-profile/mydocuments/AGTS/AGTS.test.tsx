import { render, screen, fireEvent } from '@testing-library/react';
import AGTS from '.';

// Mock dependencies
jest.mock('next/dynamic', () => () => {
  const MaterialModalPopup = ({ children, showModal, handleModalClose }) => {
    return showModal ? (
      <div data-testid="modal-popup">
        <button onClick={handleModalClose} data-testid="close-modal-button">
          Close
        </button>
        {children}
      </div>
    ) : null;
  };
  return MaterialModalPopup;
});

jest.mock('../DocumentButton', () => {
  return function MockDocumentButton({ name, onClick }) {
    return (
      <button data-testid="document-button" onClick={onClick}>
        {name}
      </button>
    );
  };
});

jest.mock('../../../portfolio/AGTSDocModal', () => {
  return function MockAGTSDocModal({ agts, closeModal }) {
    return (
      <div data-testid="agts-doc-modal">
        <button onClick={closeModal} data-testid="close-in-modal">
          Close Modal
        </button>
        <div>
          {agts.map((doc) => (
            <div key={doc.id} data-testid="agts-document">
              {doc.displayName}
            </div>
          ))}
        </div>
      </div>
    );
  };
});

describe('AGTS Component', () => {
  const mockAgtsDocuments = [
    { id: '1', displayName: 'AGTS Document 1' },
    { id: '2', displayName: 'AGTS Document 2' },
  ];

  test('renders null when no documents are provided', () => {
    const { container } = render(<AGTS agtsDocuments={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders DocumentButton when documents are provided', () => {
    render(<AGTS agtsDocuments={mockAgtsDocuments} />);
    expect(screen.getByTestId('document-button')).toBeInTheDocument();
    expect(screen.getByText('AGTS')).toBeInTheDocument();
  });

  test('shows modal when button is clicked', () => {
    render(<AGTS agtsDocuments={mockAgtsDocuments} />);

    const button = screen.getByTestId('document-button');
    fireEvent.click(button);

    expect(screen.getByTestId('modal-popup')).toBeInTheDocument();
    expect(screen.getByTestId('agts-doc-modal')).toBeInTheDocument();
  });

  test('closes modal when close button is clicked', () => {
    render(<AGTS agtsDocuments={mockAgtsDocuments} />);

    // Open modal
    const button = screen.getByTestId('document-button');
    fireEvent.click(button);

    // Close modal
    const closeButton = screen.getByTestId('close-modal-button');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('modal-popup')).not.toBeInTheDocument();
  });

  test('closes modal when close function is called from AGTSDocModal', () => {
    render(<AGTS agtsDocuments={mockAgtsDocuments} />);

    // Open modal
    const button = screen.getByTestId('document-button');
    fireEvent.click(button);

    // Close modal using the function passed to AGTSDocModal
    const closeInModalButton = screen.getByTestId('close-in-modal');
    fireEvent.click(closeInModalButton);

    expect(screen.queryByTestId('modal-popup')).not.toBeInTheDocument();
  });

  test('passes documents to AGTSDocModal', () => {
    render(<AGTS agtsDocuments={mockAgtsDocuments} />);

    // Open modal
    const button = screen.getByTestId('document-button');
    fireEvent.click(button);

    const agtsDocuments = screen.getAllByTestId('agts-document');
    expect(agtsDocuments.length).toBe(2);
  });
});
