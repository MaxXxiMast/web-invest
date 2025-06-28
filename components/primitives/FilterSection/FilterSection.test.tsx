import { fireEvent, render, screen } from "@testing-library/react";
import FilterSection from "./index";

jest.mock('../../assets/CloseLineIcon', () => ({
    __esModule: true,
    default: () => <svg data-testid="mock-closeLineIcon" />,
}));

jest.mock('../TooltipCompoent/TooltipCompoent', () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mock-tooltip">{children}</div>,
}));

const mockSetSelectedFilter = jest.fn();

const defaultProps = {
    options: ['Option 1', 'Option 2', 'Option 3'],
    label: "ToolTip",
    setSelectedFilter: mockSetSelectedFilter,
    selectedFilters: [],
    isCloseIcon: false,
    filterAndCompareData: {
        tooltips: {
            "ToolTip": "Option",
        }
    },
}

describe("FilterSection", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("render FilterSection", () => {
        render (<FilterSection {...defaultProps}/>);

        expect(screen.getByText('ToolTip')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    test("should call setSelectedFilter", () => {
        render(<FilterSection {...defaultProps}/>);

        fireEvent.click(screen.getByText('Option 1'));
        expect(mockSetSelectedFilter).toHaveBeenCalledWith('Option 1', "ToolTip");
        expect(screen.getByTestId('mock-tooltip')).toBeInTheDocument();
    });

    test("should call setSelectedFilter with closeIcon true", () => {
        render(
            <FilterSection 
                {...defaultProps} 
                isCloseIcon={true} 
                selectedFilters={['Option 1']}
            />
        );

        expect(screen.getByTestId('mock-closeLineIcon')).toBeInTheDocument();
    })

    test("should call setSelectedFilter when label is Tenure", () => {
        render(
            <FilterSection 
                {...defaultProps} 
                label={'Tenure'}
                selectedFilters="Option 1"
            />
        );

        fireEvent.click(screen.getByText('Option 1'));
        expect(mockSetSelectedFilter).toHaveBeenCalledWith('', 'Tenure');
    })

    test("should render Returns if label is IRR/YTM", () => {
        render(
            <FilterSection 
                {...defaultProps} 
                label={'IRR/YTM'}
            />
        );

        expect(screen.getByText('Returns')).toBeInTheDocument();
    })
});