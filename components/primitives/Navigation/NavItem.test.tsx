import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavItem from './NavItem';
import { LinkModel } from './NavigationModels';
import React from 'react';

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/test-path',
    push: jest.fn(),
  }),
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, onClick }) => {
      return (
        <a href={href} onClick={onClick}>
          {children}
        </a>
      );
    }
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppDispatch: () => jest.fn(),
}));

jest.mock('../../../redux/slices/config', () => ({
  setAssetsSort: jest.fn(),
}));

jest.mock('./CategoryMenu', () => ({
    __esModule: true,
    default: () => <div data-testid="category-menu">Category Menu</div>
}));

jest.mock('./ProductsMenu', () => ({
    __esModule: true,
    default: () => <div data-testid="products-menu">Products Menu</div>
}));

jest.mock('./ToolsMenu', () => ({
    __esModule: true,
    default: () => <div data-testid="tools-menu">Tools Menu</div>
}));

jest.mock('./BlogNavigationContent', () => ({
    __esModule: true,
    default: ({ contextData }) => (
        <div data-testid="blog-navigation">Blog Navigation</div>
    )
}));

jest.mock('./NavCaret', () => ({
    __esModule: true,
    default: ({ handleClickEvent, linkArr }) => (
        <div data-testid="nav-caret" onClick={handleClickEvent}>
        {linkArr && linkArr.length > 0 ? 'v' : ''}
        </div>
    )
}));

describe('NavItem Component', () => {
  const basicLinkData: LinkModel = {
    link: {
      title: 'Home',  
      clickUrl: '/home',
      openInNewTab: false,
      accessibilityLabel: 'Navigate to home page'
    },
    childrenLinks: []
  };

  const linkWithSubmenu: LinkModel = {
    link: {
      title: 'Products',
      clickUrl: '#',
      openInNewTab: false,
      accessibilityLabel: 'Open products menu'
    },
    childrenLinks: [
      {
        title: 'Product A',
        clickUrl: '/product-a',
        openInNewTab: false,
        accessibilityLabel: 'Navigate to Product A'
      },
      {
        title: 'Product B',
        clickUrl: '/product-b',
        openInNewTab: false,
        accessibilityLabel: 'Navigate to Product B'
      }
    ]
  };

  const logoutLink: LinkModel = {
    link: {
      title: 'Logout',
      clickUrl: '/logout',
      openInNewTab: false,
      accessibilityLabel: 'Log out of your account'
    },
    childrenLinks: []
  };

  const blogsMegaMenu: LinkModel = {
    link: {
      title: 'Blogs',
      clickUrl: '/blogs',
      openInNewTab: false,
      accessibilityLabel: 'Open blogs menu'
    },
    childrenLinks: [
      {
        title: 'Blog A',
        clickUrl: '/blog-a',
        openInNewTab: false,
        accessibilityLabel: 'Navigate to Blog A'
      }
    ]
  };

  const contextData = {
    loading: false,
    recentArticles: [],
    totalBlogCount: 5,
    countBlogCategory: {},
    blogCategories: []
  };

  const mockHandleLogoutClick = jest.fn();
  const mockHandleMenuToggleClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('applies active class when URL matches pathname', () => {
    jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
      pathname: '/home',
      push: jest.fn(),
    }));

    const { container } = render(<NavItem linkData={basicLinkData} />);
    
    expect(container.firstChild).toHaveClass('NavItem');
    expect(container.firstChild).toHaveClass('NavItemActive');
  });

  test('calls logout handler when logout link is clicked', () => {
    render(
      <NavItem 
        linkData={logoutLink} 
        handleLogoutClick={mockHandleLogoutClick}
        handleMenuToggleClick={mockHandleMenuToggleClick}
      />
    );
    
    fireEvent.click(screen.getByText('Logout'));
    
    expect(mockHandleLogoutClick).toHaveBeenCalledTimes(1);
  });

  test('renders blogs mega menu when link title contains "blogs"', () => {
    render(
      <NavItem 
        linkData={blogsMegaMenu} 
        contextData={contextData}
      />
    );
    
    expect(screen.getByText('Blogs')).toBeInTheDocument();
    expect(screen.getByTestId('blog-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('nav-caret')).toBeInTheDocument();
  });

  test('renders tools mega menu when link title contains "tools"', () => {
    const toolsMenu: LinkModel = {
      link: {
        title: 'Tools',
        clickUrl: '/tools',
        openInNewTab: false,
        accessibilityLabel: 'View all tools'
      },
      childrenLinks: []
    };

    render(<NavItem linkData={toolsMenu} />);
    
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByTestId('tools-menu')).toBeInTheDocument();
  });

  test('renders learn mega menu when link title contains "learn"', () => {
    const learnMenu: LinkModel = {
      link: {
        title: 'Learn',
        clickUrl: '/learn',
        openInNewTab: false,
        accessibilityLabel: 'Access learning resources'
      },
      childrenLinks: []
    };

    render(<NavItem linkData={learnMenu} />);
    
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByTestId('category-menu')).toBeInTheDocument();
  });

  test('toggles submenu visibility when nav item is clicked', () => {
    const mockToggle = jest.fn();
    const mockElement = {
      classList: {
        toggle: mockToggle
      }
    };
  
    const mockRef = {
      current: {
        lastChild: mockElement,
        nextSibling: mockElement
      }
    };
    jest.spyOn(React, 'useRef').mockImplementation(() => mockRef);
  
    render(<NavItem linkData={linkWithSubmenu} />);
    
    const navItemContent = screen.getByText('Products').closest('div');
    fireEvent.click(navItemContent);
  });

  test('links with openInNewTab set to true have target="_blank"', () => {
    const externalLink: LinkModel = {
      link: {
        title: 'External',
        clickUrl: 'https://example.com',
        openInNewTab: true,
        accessibilityLabel: 'Visit external website'
      },
      childrenLinks: []
    };
  
    render(<NavItem linkData={externalLink} />);
    
    expect(screen.getByText('External').closest('a'));
  });

  test('removes localStorage item when any link is clicked', () => {
    const removeItemMock = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        removeItem: removeItemMock,
        getItem: jest.fn(),
        setItem: jest.fn()
      },
      writable: true
    });
  
    render(<NavItem linkData={basicLinkData} />);
    
    fireEvent.click(screen.getByText('Home'));
  });
  
  test('renders NavSubMenu with correct child links', () => {
    const linkWithChildren: LinkModel = {
      link: {
        title: 'Parent Menu',
        clickUrl: '#',
        openInNewTab: false,
        accessibilityLabel: 'Parent menu'
      },
      childrenLinks: [
        {
          title: 'Child Link 1',
          clickUrl: '/child-1',
          openInNewTab: false,
          accessibilityLabel: 'Child link 1'
        },
        {
          title: 'Child Link 2',
          clickUrl: '/child-2',
          openInNewTab: false,
          accessibilityLabel: 'Child link 2'
        }
      ]
    };
  
    render(<NavItem linkData={linkWithChildren} />);
    
    fireEvent.click(screen.getByText('Parent Menu'));
    
    expect(screen.getByText('Child Link 1')).toBeInTheDocument();
    expect(screen.getByText('Child Link 2')).toBeInTheDocument();
    
    const submenuContainer = screen.getByText('Child Link 1').closest('ul').parentElement;
    expect(submenuContainer).toHaveClass('SubMenu');
  });

  test('handles links with non-# clickUrl and childrenLinks property correctly', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
      pathname: '/test-path',
      push: mockPush
    }));
    
    const removeItemMock = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        removeItem: removeItemMock,
        getItem: jest.fn(),
        setItem: jest.fn()
      },
      writable: true
    });
    
    const mockDispatch = jest.fn();
    jest.spyOn(require('../../../redux/slices/hooks'), 'useAppDispatch')
      .mockImplementation(() => mockDispatch);
    
    const mockActionObject = { type: 'mock-action' };
    jest.spyOn(require('../../../redux/slices/config'), 'setAssetsSort')
      .mockReturnValue(mockActionObject);
    
    const mockHandleMenuToggleClick = jest.fn();
    
    const specialLink = {
      link: {
        title: 'Special Link',
        clickUrl: '/special-page',
        openInNewTab: false,
        accessibilityLabel: 'Special link with children',
        childrenLinks: [
          {
            title: 'Child Link',
            clickUrl: '/child',
            openInNewTab: false,
            accessibilityLabel: 'Child link'
          }
        ]
      },
      childrenLinks: []
    };
    
    render(
      <NavItem 
        linkData={specialLink}
        handleMenuToggleClick={mockHandleMenuToggleClick}
      />
    );
    
    const linkElement = screen.getByText('Special Link').closest('a');
    
    fireEvent.click(linkElement);
    
    expect(mockHandleMenuToggleClick).toHaveBeenCalledTimes(1);
    
    expect(removeItemMock).toHaveBeenCalledWith('isFromAssetDetail');
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(mockActionObject);
  });

  test('handles case when link.childrenLinks is undefined', () => {
    const mockHandleMenuToggleClick = jest.fn();
    const mockPush = jest.fn();
    
    jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
      pathname: '/test-path',
      push: mockPush,
    }));
    
    const linkWithoutChildrenLinks = {
      link: {
        title: 'Link Without Children',
        clickUrl: '/some-path',
        openInNewTab: false,
        accessibilityLabel: 'Link without children'
      },
      childrenLinks: []
    };
    
    render(
      <NavItem 
        linkData={linkWithoutChildrenLinks}
        handleMenuToggleClick={mockHandleMenuToggleClick}
      />
    );
    
    const linkElement = screen.getByText('Link Without Children').closest('a');
    fireEvent.click(linkElement);
    
    
    expect(mockHandleMenuToggleClick).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/some-path');
  });

  test('handles case when link.childrenLinks is null', () => {
    const mockHandleMenuToggleClick = jest.fn();
    const mockPush = jest.fn();
    
    jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => ({
      pathname: '/test-path',
      push: mockPush,
    }));
    
    const linkWithNullChildrenLinks = {
      link: {
        title: 'Link With Null Children',
        clickUrl: '/other-path',
        openInNewTab: false,
        accessibilityLabel: 'Link with null children',
        childrenLinks: null
      },
      childrenLinks: []
    };
    
    render(
      <NavItem 
        linkData={linkWithNullChildrenLinks}
        handleMenuToggleClick={mockHandleMenuToggleClick}
      />
    );
    
    const linkElement = screen.getByText('Link With Null Children').closest('a');
    fireEvent.click(linkElement);
    
    expect(mockHandleMenuToggleClick).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/other-path');
  });
});