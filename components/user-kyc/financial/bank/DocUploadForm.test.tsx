import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../common/KYCUploadButton', () => ({
  __esModule: true,
  default: function MockKYCUploadButton({ 
    kycType, 
    btnText, 
    handleCB, 
    fileSizeExceedCheck 
  }: any) {
    return (
      <button
        data-testid="kyc-upload-button"
        data-kyc-type={kycType}
        data-btn-text={String(btnText)}
        data-file-size-check={String(fileSizeExceedCheck)}
        onClick={() => {
          if (handleCB) {
            handleCB('success', { fileId: '123' }, new File(['test'], 'test.jpg'));
          }
        }}
      >
        {btnText || 'Default Button Text'}
      </button>
    );
  }
}));

jest.mock('../../common/Note', () => ({
  __esModule: true,
  default: function MockNote({ className, text }: any) {
    return (
      <div data-testid="note" className={className} data-text={String(text)}>
        {text || 'Default Note Text'}
      </div>
    );
  }
}));

describe('DocUploadForm Component', () => {
  const mockHandleUploadCB = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should render with valid UploadBtnData', async () => {
    jest.doMock('../../utils/financialUtils', () => ({
      __esModule: true,
      UploadBtnData: {
        cheque: {
          btnTxt: 'Upload Cheque',
          note: 'Please upload a clear image of your cancelled cheque'
        }
      }
    }));

    
    const { default: DocUploadFormComponent } = await import('./DocUploadForm');
    
    render(<DocUploadFormComponent handleUploadCB={mockHandleUploadCB} />);
    
    const uploadButton = screen.getByTestId('kyc-upload-button');
    const note = screen.getByTestId('note');
    
    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toHaveAttribute('data-btn-text', 'Upload Cheque');
    expect(note).toBeInTheDocument();
    expect(note).toHaveAttribute('data-text', 'Please upload a clear image of your cancelled cheque');
  });

  test('should handle undefined UploadBtnData', async () => {
    jest.doMock('../../utils/financialUtils', () => ({
      __esModule: true,
      UploadBtnData: undefined
    }));

    const { default: DocUploadFormComponent } = await import('./DocUploadForm');
    
    render(<DocUploadFormComponent handleUploadCB={mockHandleUploadCB} />);
    
    const uploadButton = screen.getByTestId('kyc-upload-button');
    const note = screen.getByTestId('note');
    
    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toHaveAttribute('data-btn-text', 'undefined');
    expect(note).toBeInTheDocument();
    expect(note).toHaveAttribute('data-text', 'undefined');
  });
});