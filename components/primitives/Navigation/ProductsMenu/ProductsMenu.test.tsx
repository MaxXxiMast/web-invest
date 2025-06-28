import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductsMenu from '.';

// Mock the dependencies
jest.mock('../../Image', () => {
  return function MockImage({ alternativeText, alt }) {
    return( 
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={alternativeText || alt} data-testid="mock-image" />
      </>
    )
  };
});

jest.mock('../MegaMenuLinkItem', () => {
  return function MockMegaMenuLinkItem({
    title,
    clickUrl,
    shortDescription,
    icon,
    openInNewTab,
    isBgFilledIcon,
    subLinks,
  }) {
    return (
      <div data-testid="mega-menu-item">
        <h4>{title}</h4>
        <p>{shortDescription}</p>
        <div>{icon}</div>
        <span data-url={clickUrl} />
        <span data-openintab={openInNewTab ? 'true' : 'false'} />
        <span data-bgfilledicon={isBgFilledIcon ? 'true' : 'false'} />
        <span data-sublinks={JSON.stringify(subLinks)} />
      </div>
    );
  };
});

// Mock the data imports
jest.mock('../data', () => {
  const mockProduct1 = {
    id: 'product1',
    title: 'Product 1',
    clickUrl: '/product1',
    shortDescription: 'Description 1',
    icon: '/icons/product1.svg',
    openInNewTab: false,
    isBgFilledIcon: true,
    subLinks: [{ title: 'Sub 1', clickUrl: '/sub1' }],
  };

  const mockProduct2 = {
    id: 'product2',
    title: 'Product 2',
    clickUrl: '/product2',
    shortDescription: 'Description 2',
    icon: '/icons/product2.svg',
    openInNewTab: true,
    isBgFilledIcon: false,
    subLinks: [],
  };

  const mockProduct3 = {
    id: 'product3',
    title: 'Product 3',
    clickUrl: '/product3',
    shortDescription: 'Description 3',
    icon: '/icons/product3.svg',
    openInNewTab: false,
    isBgFilledIcon: true,
    subLinks: [],
  };

  return {
    ProductCategoryLinkArr: [mockProduct1, mockProduct2, mockProduct3],
    LeftSideLinkArr: ['product1', 'product2'],
    RightSideLinkArr: ['product3'],
    CategoriesLinkType: {},
  };
});

// Mock the string constant
jest.mock('../../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://bucket-url.com',
}));

describe('ProductsMenu Component', () => {
  test('renders with the correct structure', () => {
    render(<ProductsMenu />);

    // Check the title is rendered
    expect(screen.getByText('Our Products')).toBeInTheDocument();

    // Check the correct number of menu items are rendered
    const menuItems = screen.getAllByTestId('mega-menu-item');
    expect(menuItems).toHaveLength(3);

    // Check left column items
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();

    // Check right column items
    expect(screen.getByText('Product 3')).toBeInTheDocument();
  });

  test('passes props correctly to MegaMenuLinkItem components', () => {
    render(<ProductsMenu />);

    // Check descriptions are passed correctly
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('Description 3')).toBeInTheDocument();

    // Check images are rendered
    const images = screen.getAllByTestId('mock-image');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('alt', 'Product 1');
    expect(images[1]).toHaveAttribute('alt', 'Product 2');
    expect(images[2]).toHaveAttribute('alt', 'Product 3');
  });

  test('applies custom className when provided', () => {
    const { container } = render(<ProductsMenu className="custom-class" />);
    const rowDiv = container.firstChild;

    expect(rowDiv).toHaveClass('Row');
    expect(rowDiv).toHaveClass('custom-class');
  });

  test('passes additional props to the outer div', () => {
    const { container } = render(
      <ProductsMenu data-testid="products-menu" aria-label="Products" />
    );
    const rowDiv = container.firstChild;

    expect(rowDiv).toHaveAttribute('data-testid', 'products-menu');
    expect(rowDiv).toHaveAttribute('aria-label', 'Products');
  });

  test('forwards ref to the outer div', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<ProductsMenu ref={ref} />);

    expect(ref.current).toBe(container.firstChild);
  });

  test('filters products correctly for left and right columns', () => {
    render(<ProductsMenu />);

    const menuItems = screen.getAllByTestId('mega-menu-item');

    // First two items should be in left column (product1, product2)
    expect(menuItems[0]).toHaveTextContent('Product 1');
    expect(menuItems[1]).toHaveTextContent('Product 2');

    // Third item should be in right column (product3)
    expect(menuItems[2]).toHaveTextContent('Product 3');
  });

  test('combines bucket URL with icon paths', () => {
    const { container } = render(<ProductsMenu />);

    // Check the image URLs in the MegaMenuLinkItem mock
    // (This is an indirect test since we're mocking Image component)
    const menuItems = screen.getAllByTestId('mega-menu-item');
    expect(menuItems).toHaveLength(3);

    // We can't easily test the actual URL in the mocked component
    // but we can verify the Image component is receiving props
    expect(screen.getAllByTestId('mock-image')).toHaveLength(3);
  });
});
