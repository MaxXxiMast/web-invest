import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RedirectionPaymentPopup from './index';

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@mui/material/CircularProgress', () => {
    return function MockedCircularProgress(props) {
        const { variant, size, thickness, value, className, disableShrink, ...domProps } = props 
        return (
            <div 
                data-testid="circular-progress" 
                data-variant={variant}
                data-size={size}
                data-thickness={thickness}
                data-value={value}
                className={className}
                data-disable-shrink={disableShrink ? true : undefined}
                {...domProps}
            />
        )
    };
});

jest.mock('../../primitives/MaterialModalPopup', () => {
  return function MockedMaterialModalPopup({ children, showModal, hideClose, isModalDrawer, drawerExtraClass, className, ...props }) {
    return (
        <div 
            data-testid="modal-popup"
            data-show-modal={showModal ? true : undefined}
            data-hide-close={hideClose ? true : undefined}
            data-is-modal-drawer={isModalDrawer ? true : undefined}
            data-drawer-extra-class={drawerExtraClass}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
  };
});

const mockPush = jest.fn();

describe('RedirectionPaymentPopup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        require('next/router').useRouter.mockImplementation(() => ({
            push: mockPush,
        }));
    });

    test('renders with default props', () => {
        render(<RedirectionPaymentPopup mainHeadingText='mock-heading'/>);

        const modalElement = screen.getByTestId('modal-popup');
        expect(modalElement).toBeInTheDocument();
        expect(modalElement).toHaveClass('PopupInner');

        const progressElements = screen.getAllByTestId('circular-progress');
        expect(progressElements.length).toBe(2);
        expect(screen.getByText('Please do not hit back or refresh button')).toBeInTheDocument();
        expect(screen.queryByText(/Click here/)).not.toBeInTheDocument();
    });

    test('renders with custom props', () => {
        const props = {
          mainHeadingText: 'Processing Payment',
          subHeadingText: 'Please wait...',
          redirectURL: 'https://example.com',
        };

        render(<RedirectionPaymentPopup {...props} />);

        expect(screen.getByText('Processing Payment')).toBeInTheDocument();
        expect(screen.getByText('Please wait...')).toBeInTheDocument();

        expect(screen.getByText('Click here')).toBeInTheDocument();
        expect(screen.getByText("if redirect doesn't happen")).toBeInTheDocument();
    });

    test('clicking redirect link calls router.push with correct URL', () => {
        const redirectURL = 'https://example.com';

        render(
            <RedirectionPaymentPopup 
                mainHeadingText="Processing" 
                redirectURL={redirectURL} 
            />
        );

        const redirectLink = screen.getByText('Click here');
        fireEvent.click(redirectLink);

        expect(mockPush).toHaveBeenCalledWith(redirectURL);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    test('does not render redirect text when redirectURL is empty', () => {
        render(
            <RedirectionPaymentPopup 
                mainHeadingText="Processing" 
                redirectURL="" 
            />
        );

        expect(screen.queryByText(/Click here/)).not.toBeInTheDocument();
        expect(screen.queryByText(/if redirect doesn't happen/)).not.toBeInTheDocument();
    });

    test('renders CircularProgress components with correct props', () => {
        render(<RedirectionPaymentPopup mainHeadingText='mock-heading' />);

        const progressElements = screen.getAllByTestId('circular-progress');

        expect(progressElements[0]).toHaveClass('circularProgressDeterminate');
        expect(progressElements[1]).toHaveClass('circularProgressInDeterminate');
    });
});