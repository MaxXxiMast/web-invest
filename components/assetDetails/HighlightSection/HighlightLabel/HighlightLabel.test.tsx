import { render, screen } from '@testing-library/react';
import HighlightLabel from './index';

describe('HighlightLabel Component', () => {
    test('renders HighlightLabel', () => {
        const { container } = render(<HighlightLabel />);
        const labelElement = container.querySelector('.label');
        expect(labelElement).toBeInTheDocument();
    });

    test('renders with provided label text', () => {
        render(<HighlightLabel label="Test Label" />);
        expect(screen.getByText('Test Label')).toBeInTheDocument()
    });
});