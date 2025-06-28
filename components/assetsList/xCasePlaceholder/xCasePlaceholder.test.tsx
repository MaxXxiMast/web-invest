import { render, screen } from '@testing-library/react';
import XCasePlaceholder from './index';

jest.mock('../../../utils/string', () => ({
    GRIP_INVEST_BUCKET_URL: 'https://mock-bucket-url/',
    handleExtraProps: jest.fn(),
}));

jest.mock('../../primitives/Image', () => ({
    __esModule: true,
    default: props => (
        <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src={props.src}
                alt={props.alt}
                width={props.width}
                height={props.height}
                data-testid="mock-image"
            />
        </>
    ),
}));

describe('XCasePlaceholder Component', () => {
    const mockData = {
        background: '#f5f5f5',
        title: 'Test Title',
        image: {
            url: 'test-image.png',
            aspectRatio: 2,
            height: 50,
        },
        cardOptions: ['Option 1', 'Option 2', 'Option 3'],
    };

    // Test case - 1
    test('render XCasePlaceholder', () => {
        render(<XCasePlaceholder id="test-id" data={mockData} className="custom-class" />);
        
        const container = screen.getByRole('heading', { name: 'Test Title' }).parentElement;
        expect(container).toHaveAttribute('id', 'test-id');
        expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
        
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
        expect(listItems[0]).toHaveTextContent('Option 1');
        expect(listItems[1]).toHaveTextContent('Option 2');
        expect(listItems[2]).toHaveTextContent('Option 3');
    });

    // Test case - 2
    test('handles null or undefined data gracefully', () => {
        render(<XCasePlaceholder data={null} />);

        const image = screen.getByTestId('mock-image');
        expect(image).toHaveAttribute('src', 'https://mock-bucket-url/icons/less-is-more-assets.svg');
        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });
});