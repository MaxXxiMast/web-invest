import { render, screen, fireEvent } from '@testing-library/react';
import MegaMenuLinkItem from '.';
import { useRouter } from 'next/router';

// Mocking useRouter from Next.js
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('MegaMenuLinkItem', () => {
  beforeEach(() => {
    // Mock the router.push function
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('should render MegaMenuLinkItem correctly with title and short description', () => {
    render(
      <MegaMenuLinkItem
        title="Test Title"
        shortDescription="This is a short description"
        clickUrl="/test-url"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('This is a short description')).toBeInTheDocument();
  });

  it('should render an icon if provided', () => {
    const icon = <div data-testid="icon">Icon</div>;

    render(<MegaMenuLinkItem icon={icon} />);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should open the link in a new tab when openInNewTab is true', () => {
    render(<MegaMenuLinkItem clickUrl="/test-url" openInNewTab={true} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should render an anchor tag with correct href and no target when openInNewTab is false', () => {
    render(<MegaMenuLinkItem clickUrl="/test-url" openInNewTab={false} />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', '/test-url');
    expect(link).not.toHaveAttribute('target', '_blank');
  });

  it('should display sub-links if provided', () => {
    const subLinks = [
      { title: 'Sub Link 1', clickUrl: '/sub-link-1' },
      { title: 'Sub Link 2', clickUrl: '/sub-link-2' },
    ];

    render(<MegaMenuLinkItem subLinks={subLinks} />);

    expect(screen.getByText('Sub Link 1')).toBeInTheDocument();
    expect(screen.getByText('Sub Link 2')).toBeInTheDocument();
  });

  it('should call handleClick when the link is clicked', () => {
    const handleClick = jest.fn();

    render(<MegaMenuLinkItem handleClick={handleClick} />);

    const link = screen.getByRole('link');
    fireEvent.click(link);

    expect(handleClick).toHaveBeenCalled();
  });
});
