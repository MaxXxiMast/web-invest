import { render, screen } from '@testing-library/react';
import ReadTime from '.';

jest.mock('../../../utils/string', () => ({
  handleExtraProps: (cls: string) => cls,
}));

describe('ReadTime Component', () => {
  const shortDescription = 'This is a test description.';
  const longDescription = '<p>' + 'word '.repeat(3000) + '</p>';

  it('renders nothing if showReadTime is false', () => {
    const { container } = render(
      <ReadTime showReadTime={false} description={shortDescription} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if description is empty', () => {
    const { container } = render(
      <ReadTime showReadTime={true} description="" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correct read time for short description', () => {
    render(<ReadTime showReadTime={true} description={shortDescription} />);
    const span = screen.getByText(/min read/);
    expect(span).toBeInTheDocument();
    expect(span.textContent).toMatch(/\d+ min read/);
  });

  it('caps read time at 12 mins for very long text', () => {
    render(<ReadTime showReadTime={true} description={longDescription} />);
    expect(screen.getByText('12 mins read')).toBeInTheDocument();
  });

  it('uses singular "min" when read time is 1', () => {
    const desc = 'Read this';
    render(<ReadTime showReadTime={true} description={desc} />);
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });

  it('applies additional className from props', () => {
    const { container } = render(
      <ReadTime
        showReadTime={true}
        description={shortDescription}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
