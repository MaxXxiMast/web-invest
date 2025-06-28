import { render, screen, fireEvent } from '@testing-library/react';
import Accordian from './index';
import { title } from 'process';

describe('Accordian Component', () => {
    const defaultProps = {
        children: <div>Child Content</div>
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render with empty title', () => {
        const { container } = render(
            <Accordian {...defaultProps} />
        );
        expect(container.querySelector('.title')).toBeInTheDocument();
    });

    test('should render title when passed', () => {
        render(
            <Accordian 
                {...defaultProps} 
                title="Test Title" 
                containerClass="test-container" 
                titleClassName="test-title" 
                size={20}
            />
        );
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    test('should expand and show children on click and call toggleCallback', () => {
        const toggleCallbackMock = jest.fn();

        render(<Accordian {...defaultProps} title="Test Title" toggleCallback={toggleCallbackMock}/>);
        const header = screen.getByText('Test Title');
        fireEvent.click(header);
        expect(screen.getByText('Child Content')).toBeInTheDocument();
        expect(toggleCallbackMock).toHaveBeenCalled();
    });

    test('should render children if defaultValue is true', () => {
      render(<Accordian {...defaultProps} defaultValue={true} />);
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
});
