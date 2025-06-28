import { render, screen, fireEvent } from '@testing-library/react';
import FilterTab from './index';

const mockHandleTabChangeCB = jest.fn();

const defaultProps = {
    id: "1",
    tabArr: ['Tab 1', 'Tab 2', 'Tab 3'],
    handleTabChangeCB: mockHandleTabChangeCB,
};

describe('FilterTab Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test case - 1
    test('should render all tabs', () => {
        render(<FilterTab {...defaultProps} />);

        expect(screen.getByText('Tab 1')).toBeInTheDocument();
        expect(screen.getByText('Tab 2')).toBeInTheDocument();
        expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    // Test case - 2
    test('should activate defaultTab if provided', () => {
        render(<FilterTab {...defaultProps} defaultTab="Tab 2" />);

        const activeTab = screen.getByText('Tab 2');
        expect(activeTab).toHaveClass('ActiveTab');
    });

    // Test case - 3
    test('should change active tab on click', () => {
        render(<FilterTab {...defaultProps} />);

        const tab2 = screen.getByText('Tab 2');
        fireEvent.click(tab2);

        expect(mockHandleTabChangeCB).toHaveBeenCalledWith('Tab 2');
        expect(tab2).toHaveClass('ActiveTab');
    });

    // Test case - 4
    test('should activate tab based on event prop', () => {
        render(<FilterTab {...defaultProps} event="tab 3" />);

        const activeTab = screen.getByText('Tab 3');
        expect(activeTab).toHaveClass('ActiveTab');
    });

    // Test case - 5
    test('should render extra components for tabs and when event is not in tab', () => {
        render(
            <FilterTab 
                {...defaultProps}
                event='unknown'
                extraComponentForTabs={[<span key="1">Extra1</span>, <span key="2">Extra2</span>]}
            />
        );

        expect(screen.getByText('Extra1')).toBeInTheDocument();
        expect(screen.getByText('Extra2')).toBeInTheDocument();
        expect(screen.getByText('Tab 1')).toHaveClass('ActiveTab');
    });

    // Test case - 6
    test('should return nothing when activate tab is event', () => {
        render(<FilterTab {...defaultProps} event="tab 3"/>);

        const activeTab = screen.getByText('Tab 3');
        fireEvent.click(activeTab);
        expect(activeTab).toHaveClass('ActiveTab');
    })

    // Test case - 7
    test('should render children', () => {
        render(
            <FilterTab {...defaultProps}>
                <div>Children Content</div>
            </FilterTab>
        );

        expect(screen.getByText('Children Content')).toBeInTheDocument();
    });
});
