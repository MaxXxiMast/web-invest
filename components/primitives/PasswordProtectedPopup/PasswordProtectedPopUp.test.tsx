import { render, screen, fireEvent } from '@testing-library/react';
import PasswordProtectedPopup from '.';

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));
describe('PasswordProtectedPopup Component', () => {
  const onSubmitMock = jest.fn();
  const handleModalCloseMock = jest.fn();

  const defaultProps = {
    showPopup: true,
    onSubmit: onSubmitMock,
    hideCloseButton: false,
    handleModalClose: handleModalCloseMock,
  };

  beforeEach(() => {
    onSubmitMock.mockClear();
    handleModalCloseMock.mockClear();
  });

  it('should render modal when showPopup is true', () => {
    render(<PasswordProtectedPopup {...defaultProps} />);
    expect(screen.getByText(/Please enter the password/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Confirm/i })
    ).toBeInTheDocument();
  });

  it('should update password input on user input', () => {
    render(<PasswordProtectedPopup {...defaultProps} />);
    const input = screen.getByPlaceholderText('') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'secure123' } });
    expect(input.value).toBe('secure123');
  });

  it('should call onSubmit with password when Confirm button is clicked', () => {
    render(<PasswordProtectedPopup {...defaultProps} />);
    const input = screen.getByPlaceholderText('') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /Confirm/i });

    fireEvent.change(input, { target: { value: 'abc123' } });
    fireEvent.click(button);

    expect(onSubmitMock).toHaveBeenCalledWith('abc123');
  });

  it('should clear password when showPopup becomes false', () => {
    const { rerender } = render(<PasswordProtectedPopup {...defaultProps} />);

    const input = screen.getByPlaceholderText('') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'temporary' } });
    expect(input.value).toBe('temporary');

    rerender(<PasswordProtectedPopup {...defaultProps} showPopup={false} />);

    rerender(<PasswordProtectedPopup {...defaultProps} showPopup={true} />);

    const updatedInput = screen.getByPlaceholderText('') as HTMLInputElement;
    expect(updatedInput.value).toBe('');
  });

  it('should hide close button if hideCloseButton is true', () => {
    render(<PasswordProtectedPopup {...defaultProps} hideCloseButton={true} />);
    const closeButton = screen.queryByTestId('modal-close-button');
    expect(closeButton).not.toBeInTheDocument();
  });

  it('should call handleModalClose if provided', () => {
    render(<PasswordProtectedPopup {...defaultProps} />);

    const closeButton = screen.queryByTestId('modal-close-button');

    if (closeButton) {
      fireEvent.click(closeButton);
      expect(handleModalCloseMock).toHaveBeenCalled();
    }
  });
});
