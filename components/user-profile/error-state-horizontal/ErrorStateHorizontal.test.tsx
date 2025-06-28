import { render, screen, fireEvent } from '@testing-library/react';
import ProfileHeader from '../header';
import { useAppSelector } from '../../../redux/slices/hooks';
import { isGCOrder } from '../../../utils/gripConnect';

// Mock hooks and utils
jest.mock('../../../redux/slices/hooks');
jest.mock('../../../utils/gripConnect', () => ({ isGCOrder: jest.fn() }));
// Mock EditProfileDetails
jest.mock('../../user-kyc/common/GenericModal', () => jest.fn());
jest.mock('../edit-details-modal', () => ({
  __esModule: true,
  default: () => <div data-testid="edit-modal" />,
}));

describe('ProfileHeader component', () => {
  const mockOnBack = jest.fn();
  const mockOnBook = jest.fn();
  const mockHandleEdit = jest.fn();

  const setup = (gcOrder = true, hideBookCall = false) => {
    (isGCOrder as jest.Mock).mockReturnValue(gcOrder);
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        gcConfig: {
          configData: {
            themeConfig: {
              pages: { profile: { hideBookCallTopNav: hideBookCall } },
            },
          },
        },
      };
      return selector(state);
    });
    return render(
      <ProfileHeader
        title="Test Title"
        showRightBtn={true}
        className="custom"
        onBackClick={mockOnBack}
        onBookClick={mockOnBook}
        showEditBtn={true}
        handleEditModal={mockHandleEdit}
        showEditModal={false}
        editData={{ editTitle: 'Field', subtitle: 'field' }}
      />
    );
  };

  afterEach(() => jest.clearAllMocks());

  it('renders title and back button triggers onBackClick', () => {
    const { container } = setup();
    // Title
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    // Click back button via its Back class span
    const backBtn = container.querySelector('span.Back');
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn!);
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('renders Request Edit button and triggers handleEditModal', () => {
    setup();
    const editBtn = screen.getByText('Request Edit');
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn);
    expect(mockHandleEdit).toHaveBeenCalled();
  });

  it('renders Book A Call when isGCOrder true and showRightBtn true', () => {
    setup(true, false);
    const book = screen.getByText('Book A Call');
    expect(book).toBeInTheDocument();
    fireEvent.click(book);
    expect(mockOnBook).toHaveBeenCalled();
  });

  it('renders Book A Call when isGCOrder is false', () => {
    setup(false, false);
    expect(screen.getByText('Book A Call')).toBeInTheDocument();
  });

  it('does not render Book A Call when hideBookCallTopNav is true', () => {
    setup(true, true);
    expect(screen.queryByText('Book A Call')).toBeNull();
  });

  it('passes correct props to EditProfileDetails', () => {
    setup();
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });
});
