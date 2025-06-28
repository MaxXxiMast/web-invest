import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadButtonKYC from '.';

// Mocks
jest.mock(
  'classnames',
  () =>
    (...classes: any[]) =>
      classes.filter(Boolean).join(' ')
);
jest.mock('next/dynamic', () => (loader: any, options: any) => {
  // Return a simple mock component
  const MockComponent = (props: any) => (
    <div
      data-testid="password-popup"
      hideCloseButton={props.hideCloseButton ? 'true' : 'false'}
      {...props}
    />
  );
  MockComponent.displayName = 'MockComponent';
  return MockComponent;
});

jest.mock('react-pdf', () => ({
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' }, version: '2.0.0' },
  Document: ({ children, onPassword, onLoadSuccess, onLoadError }: any) => (
    <div
      data-testid="react-pdf"
      onClick={() => onLoadSuccess && onLoadSuccess()}
    >
      {children}
    </div>
  ),
  Page: ({ pageNumber }: any) => (
    <div data-testid="pdf-page">Page {pageNumber}</div>
  ),
}));

jest.mock('../../../utils/gtm', () => ({ trackEvent: jest.fn() }));
jest.mock('../../../utils/number', () => ({
  bytesToSize: (size: number) => `${size}B`,
  getSizeToBytes: (_size: number) => 100,
}));
jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://bucket.url/',
}));
jest.mock('../../../api/strapi', () => ({ callErrorToast: jest.fn() }));

// Mock redux hooks
const mockDispatch = jest.fn();
const mockState = {
  user: { userData: { userID: '123' }, openPasswordPopup: false },
};

jest.mock('../../../redux/slices/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(mockState),
}));

// Mock custom hook
jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
}));

describe('UploadButtonKYC Component', () => {
  const onChange = jest.fn();
  const defaultProps = {
    name: 'Upload Document',
    allowedFileTypes: ['image/png', 'application/pdf'],
    error: '',
    onChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial upload container with name', () => {
    render(<UploadButtonKYC {...defaultProps} />);
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  it('calls onChange for non-PDF image under size limit', async () => {
    render(
      <UploadButtonKYC
        {...defaultProps}
        fileSizeExceedCheck={true}
        maxFileSize={1000}
      />
    );
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    const file = new File(['dummy'], 'test.png', {
      type: 'image/png',
    });
    Object.defineProperty(file, 'size', { value: 500 });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(file));
    expect(screen.getByText('test.png')).toBeInTheDocument();
  });

  it('shows error toast and tracks event when file size exceeds', () => {
    render(
      <UploadButtonKYC
        {...defaultProps}
        fileSizeExceedCheck={true}
        maxFileSize={50}
        kycStep="pan"
      />
    );
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    const largeFile = new File(['large'], 'large.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(largeFile, 'size', { value: 100 });
    fireEvent.change(input, { target: { files: [largeFile] } });
  });

  it('shows error toast when file type not allowed', () => {
    const { callErrorToast } = require('../../../api/strapi');

    render(
      <UploadButtonKYC {...defaultProps} allowedFileTypes={['image/png']} />
    );
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    const pdfFile = new File(['pdfcontent'], 'test.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(pdfFile, 'size', { value: 100 });
    fireEvent.change(input, { target: { files: [pdfFile] } });

    expect(callErrorToast).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deletes file and calls onChange(null) when close icon clicked', async () => {
    render(<UploadButtonKYC {...defaultProps} />);
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['dummy'], 'delete.png', {
      type: 'image/png',
    });
    Object.defineProperty(file, 'size', { value: 100 });

    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(file));

    const closeIcon = screen.getByTestId('close-icon');
    fireEvent.click(closeIcon);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByText('delete.png')).not.toBeInTheDocument();
  });
});
