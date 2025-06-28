import { render, screen, fireEvent } from '@testing-library/react';
import EditProfileDetails from '.';

// Mock GenericModal
jest.mock('../../user-kyc/common/GenericModal', () => ({
  __esModule: true,
  default: ({
    showModal,
    title,
    subtitle,
    Content,
    btnText,
    handleBtnClick,
  }: any) => {
    return (
      <div data-testid="generic-modal">
        <div data-testid="modal-show">{String(showModal)}</div>
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-subtitle">{subtitle}</div>
        <div data-testid="modal-content">
          <Content />
        </div>
        <button data-testid="modal-button" onClick={handleBtnClick}>
          {btnText}
        </button>
      </div>
    );
  },
}));

describe('EditProfileDetails component', () => {
  const defaultProps = {
    showEditModal: false,
    editData: { title: 'Name', subtitle: 'name' },
    handleEditModal: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders GenericModal with correct showModal prop', () => {
    render(<EditProfileDetails {...defaultProps} />);
    expect(screen.getByTestId('modal-show').textContent).toBe('false');

    render(
      <EditProfileDetails {...defaultProps} showEditModal={true} />
    );
    expect(screen.getAllByTestId('modal-show')[1].textContent).toBe('true');
  });

  it('passes title and subtitle correctly to GenericModal', () => {
    render(<EditProfileDetails {...defaultProps} />);
    expect(screen.getByTestId('modal-title').textContent).toBe(
      `Get in touch to edit ${defaultProps.editData.title} details`
    );
    expect(screen.getByTestId('modal-subtitle').textContent).toContain(
      `Making changes to ${defaultProps.editData.subtitle} detail(s)`
    );
  });

  it('renders Content component with email link', () => {
    render(<EditProfileDetails {...defaultProps} />);
    const content = screen.getByTestId('modal-content');
    expect(content.textContent).toContain('To submit the change request please mail to -');
    const link = screen.getByRole('link', { name: 'invest@gripinvest.in' });
    expect(link).toHaveAttribute('href', 'mailto:invest@gripinvest.in');
  });

  it('calls handleEditModal when OKAY button is clicked', () => {
    render(<EditProfileDetails {...defaultProps} showEditModal={true} />);
    const button = screen.getByTestId('modal-button');
    fireEvent.click(button);
    expect(defaultProps.handleEditModal).toHaveBeenCalledTimes(1);
  });
});
