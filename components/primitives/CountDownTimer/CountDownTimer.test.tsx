import { render } from "@testing-library/react";
import CountDownTimer from "./index";
import { CountdownProps } from "../../../utils/customHooks/useCountDown";

const mockUseCountdown = {
    pathLength: 100,
    stroke: '#ff0000',
    strokeDashoffset: 10,
    remainingTime: 5,
    elapsedTime: 7,
    size: 120,
    strokeWidth: 8,
};

jest.mock('../../../utils/customHooks/useCountDown', () => ({
    useCountdown: () => mockUseCountdown,
}));

describe("CountDownTimer", () => {
    const defaultProps: CountdownProps = {
        duration: 10,
        color: '#000000',
        size: 120,
        strokeWidth: 8,
        rotation: 'clockwise',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test case - 1
    test("should render CountDownTimer", () => {
        const { container } = render(<CountDownTimer {...defaultProps} />);

        const paths = container.querySelectorAll('path');
        expect(paths[0]).toHaveAttribute('stroke', '#d9d9d9'); 
    });

    // Test case - 2
    test("render children as function", () => {
        const children = jest.fn().mockReturnValue(<div>Timer</div>);

        render(<CountDownTimer {...defaultProps}>{children}</CountDownTimer>);

        expect(children).toHaveBeenCalledWith({
            remainingTime: 5,
            elapsedTime: 7,
            color: '#ff0000',
        });
    });

    // Test case - 3
    test('should apply custom strokeLinecap, trailColor and trailStrokeWidth', () => {
        const { container } = render(
            <CountDownTimer 
                {...defaultProps} 
                strokeLinecap="square" 
                trailColor="#ffffff" 
                trailStrokeWidth={8}
            />
        );

        const paths = container.querySelectorAll('path');
        expect(paths[0]).toHaveAttribute('stroke', '#ffffff');
        expect(paths[1]).toHaveAttribute('stroke-linecap', 'square');
        expect(paths[1]).toHaveAttribute('stroke-width', '8');
    })
});
