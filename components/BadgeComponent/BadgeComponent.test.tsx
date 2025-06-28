import { render, screen } from "@testing-library/react";
import { BadgeList } from "./index";
import { getVisibleBadges } from "./utils";

jest.mock('./utils', () => ({
    badgePriority: [
        { label: "verified", icon: "icon-verified" },
        { label: "repeat investors", icon: "icon-repeat-investors" },
    ],
    getVisibleBadges: jest.fn(),
}));

jest.mock('./BadgeComponent.module.css', () => ({
    "default-badge-color": "default-class"
}));

describe("BadgeComponent", () => {
    test("renders badges correctly", () => {
        const badges = ["verified", "repeat investors"];

        (getVisibleBadges as jest.Mock).mockReturnValue([
            { label: "verified" },
            { label: "repeat investors" },
        ]);

        render(<BadgeList badges={badges} repeatInvestorsPercentage={80} />);

        expect(screen.getByText("verified")).toBeInTheDocument();
        expect(screen.getByText("80% repeat investors")).toBeInTheDocument();
    });

    test("does not render a badge if the label does not exist", () => {
        console.warn = jest.fn();
    
        (getVisibleBadges as jest.Mock).mockReturnValue([{ label: "unknown-badge" }]);
    
        render(<BadgeList badges={["unknown-badge"]} repeatInvestorsPercentage={0} />);
    
        expect(screen.queryByText("unknown-badge")).not.toBeInTheDocument();
        expect(console.warn).toHaveBeenCalledWith("No matching badge found for label: unknown-badge");
    });

    test("render IRRDropBadge", () => {
        const mockDate = new Date("2024-12-31T23:59:59.999Z");
    
        render(<BadgeList badges={["verified"]} repeatInvestorsPercentage={0} showIrr irrDroppingDate={mockDate} />);
    });
});
