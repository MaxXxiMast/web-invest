import { render, screen, fireEvent, act } from '@testing-library/react';
import ProfileImage from './ProfileImage';
import { useAppSelector } from '../../../redux/slices/hooks';

jest.mock('next/image', () => ({
    __esModule: true,
    default: function MockImage(props) {
      return (
        <div 
          data-testid="next-image"
          data-src={props.src}
          data-alt={props.alt}
          data-height={props.height}
          data-width={props.width}
          onClick={props.onClick}
          onError={props.onError}
        >
          {props.alt}
        </div>
      );
    }
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('ProfileImage', () => {
  const mockUser = {
    photo: 'https://example.com/photo.jpg',
    firstName: 'first',
    lastName: 'last',
  };

  beforeEach(() => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => 
      selector({ user: { userData: mockUser } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the image when photo is available', () => {
    render(<ProfileImage />);
    
    const imgElement = screen.getByTestId('next-image');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement.getAttribute('data-src')).toBe('https://example.com/photo.jpg');
    expect(imgElement.getAttribute('data-alt')).toBe('first last');
  });

  test('renders initials when photo is not available', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => 
      selector({ user: { userData: { ...mockUser, photo: null } } })
    );
    
    render(<ProfileImage />);
    
    const initialsElement = screen.getByText('FL');
    expect(initialsElement).toBeInTheDocument();
  });

  test('applies the correct size from props', () => {
    const customSize = 64;
    render(<ProfileImage size={customSize} />);
    
    const imgElement = screen.getByTestId('next-image');
    expect(imgElement).toHaveAttribute('data-height', customSize.toString());
    expect(imgElement).toHaveAttribute('data-width', customSize.toString());
    
    const wrapperElement = imgElement.parentElement;
    expect(wrapperElement).toHaveStyle({
      height: `${customSize}px`,
      width: `${customSize}px`,
    });
  });

  test('calls onclickEvent when image is clicked', () => {
    const onclickMock = jest.fn();
    render(<ProfileImage onclickEvent={onclickMock} />);
    
    const imgElement = screen.getByTestId('next-image');
    fireEvent.click(imgElement);
    
    expect(onclickMock).toHaveBeenCalledTimes(1);
  });

  test('calls onclickEvent when initials div is clicked', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => 
      selector({ user: { userData: { ...mockUser, photo: null } } })
    );
    
    const onclickMock = jest.fn();
    render(<ProfileImage onclickEvent={onclickMock} />);
    
    const initialsElement = screen.getByText('FL');
    fireEvent.click(initialsElement);
    
    expect(onclickMock).toHaveBeenCalledTimes(1);
  });

  test('uses default size when size prop is not provided', () => {
    render(<ProfileImage />);
    
    const imgElement = screen.getByTestId('next-image');
    expect(imgElement).toHaveAttribute('data-height', '32');
    expect(imgElement).toHaveAttribute('data-width', '32');
    
    const wrapperElement = imgElement.parentElement;
    expect(wrapperElement).toHaveStyle({
      height: '32px',
      width: '32px',
    });
  });

  test('handles undefined user data gracefully', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => 
      selector({ user: { userData: {} } })
    );
    
    const { container } = render(<ProfileImage />);
    
    const profileWrapper = container.querySelector('.ProfilePic.flex_wrapper');
    expect(profileWrapper).toBeInTheDocument();
    
    const innerDiv = container.querySelector('.ProfilePic.flex_wrapper > .flex_wrapper');
    expect(innerDiv).toBeInTheDocument();
    expect(innerDiv?.textContent).toBe('');
  });

  test('renders without onclickEvent prop and does not crash when clicked', () => {
    render(<ProfileImage />);
    
    const imgElement = screen.getByTestId('next-image');
    expect(() => fireEvent.click(imgElement)).not.toThrow();
  });

  test('renders initials when photo loading fails', () => {
    let errorHandler;
    
    const originalMock = jest.requireMock('next/image').default;
    jest.requireMock('next/image').default = function(props) {
      errorHandler = props.onError;
      return originalMock(props);
    };
    
    render(<ProfileImage />);
    
    expect(screen.getByTestId('next-image')).toBeInTheDocument();
    act(() => errorHandler());
    expect(screen.getByText('FL')).toBeInTheDocument();
    jest.requireMock('next/image').default = originalMock;
  });
});