import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReasonToInvest from './index';

jest.mock('../../../../utils/htmlSanitizer', () => ({
    htmlSanitizer: jest.fn().mockImplementation((content) => `sanitized-${content}`),
}));

jest.mock('../../utils', () => ({
    processContent: jest.fn().mockImplementation((content) => `processed-${content}`),
}));

jest.mock('../../../../utils/string', () => ({
    handleExtraProps: jest.fn(props => `extra-${props}`),
}));

jest.mock('../HighlightLabel', () => {
    const MockHighlightLabel = ({ label }) => {
        return <div data-testid="highlight-label">{label}</div>;
    };
    return MockHighlightLabel;
});

jest.mock('../../../primitives/Button', () => {
    const MockButton = ({ children, onClick, className }) => (
        <button onClick={onClick} className={className} data-testid="see-more-button">
            {children}
        </button>
    );
    const ButtonType = {
        BorderLess: 'borderless',
    };

    return Object.assign(MockButton, { ButtonType });
});

describe('ReasonToInvest Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockIsOverflowing = (initialValue) => {
        const setState = jest.fn();
        const useStateMock = jest.spyOn(React, 'useState');
        useStateMock.mockImplementationOnce(() => [initialValue, setState]);
        return { setState };
    };

    test('renders empty state when no data is provided', () => {
        render(<ReasonToInvest />);
        expect(screen.queryByTestId('highlight-label')).not.toBeInTheDocument();
    });

    test('renders content correctly with data', () => {
        const testData = [
          { title: 'Test Title 1', content: '<p>Test Content 1</p>' },
          { title: 'Test Title 2', content: '<p>Test Content 2</p>' }
        ];

        render(<ReasonToInvest data={testData} className="custom-class"/>);

        const labels = screen.getAllByTestId('highlight-label');
        expect(labels).toHaveLength(2);
        expect(labels[0]).toHaveTextContent('Test Title 1');
        expect(labels[1]).toHaveTextContent('Test Title 2');
    });

    test('calls handleModal with correct parameter when See More button is clicked', () => {
        mockIsOverflowing(true);
        const mockHandleModal = jest.fn();
        const testData = [
            { title: 'Test Title', content: '<p>Test Content</p>' }
        ];

        render(
            <ReasonToInvest 
              data={testData} 
              showSeeMore={true} 
              handleModal={mockHandleModal} 
            />
        );

        fireEvent.click(screen.getByTestId('see-more-button'));
        expect(mockHandleModal).toHaveBeenCalledWith('resonToInvest');
    });

    test('default handleModal function works without errors', () => {
        mockIsOverflowing(true);
        const testData = [
            { title: 'Test Title', content: '<p>Test Content</p>' }
        ];

        render(
            <ReasonToInvest 
              data={testData} 
              showSeeMore={true} 
            />
        );

        expect(() => {
          fireEvent.click(screen.getByTestId('see-more-button'));
        }).not.toThrow();
    });

    test('handles empty or undefined content', () => {
        const { htmlSanitizer } = require('../../../../utils/htmlSanitizer');
        const { processContent } = require('../../utils');

        const testData = [
            { title: 'Empty Content', content: '' },
            { title: 'Undefined Content' },
            { title: 'Null Content', content: null }
        ];

        render(<ReasonToInvest data={testData} />);

        // For empty content
        expect(processContent).toHaveBeenCalledWith('');
        expect(htmlSanitizer).toHaveBeenCalledWith('processed-');

        // For undefined content
        expect(processContent).toHaveBeenCalledWith('');
        expect(htmlSanitizer).toHaveBeenCalledWith('processed-');

        // For null content
        expect(processContent).toHaveBeenCalledWith('');
        expect(htmlSanitizer).toHaveBeenCalledWith('processed-');

        // Verify the total number of calls
        expect(processContent).toHaveBeenCalledTimes(3);
        expect(htmlSanitizer).toHaveBeenCalledTimes(3);
    });
});