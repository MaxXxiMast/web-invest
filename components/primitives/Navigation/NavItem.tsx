import { useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Types
import { LinkModel, NavigationLinkModel } from './NavigationModels';

//Components
import CategoryMenu from './CategoryMenu';
import ProductsMenu from './ProductsMenu';
import ToolsMenu from './ToolsMenu';
import NavCaret from './NavCaret';

import BlogNaviagtionContent from './BlogNavigationContent';

//Redux
import { setAssetsSort } from '../../../redux/slices/config';
import { useAppDispatch } from '../../../redux/slices/hooks';

//Styles
import classes from './Navigation.module.css';

// NAVIGATION ITEM
const NavItem = ({
  linkData,
  keyIndex = 0,
  handleLogoutClick = () => {},
  handleMenuToggleClick = () => {},
  contextData = {
    loading: true,
    recentArticles: [],
    totalBlogCount: 0,
    countBlogCategory: {},
    blogCategories: [],
  },
}: {
  linkData: LinkModel;
  keyIndex?: number;
  handleLogoutClick?: () => void;
  handleMenuToggleClick?: () => void;
  contextData?: {
    loading: boolean;
    recentArticles: any[];
    totalBlogCount: number;
    countBlogCategory: any;
    blogCategories: any[];
  };
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { link, childrenLinks } = linkData;
  const navRef = useRef<any>(null);

  const handleLinkClickEvent = () => {
    localStorage.removeItem('isFromAssetDetail');
    dispatch(
      setAssetsSort({
        tabSection: 'Baskets',
        tab: 'active',
        sortType: 'default',
      })
    );
  };

  const handleLinkClick = (event: any, link: NavigationLinkModel) => {
    if (link?.title === 'Logout') {
      event?.preventDefault();
      handleLogoutClick();
      handleLinkClickEvent();
    } else if (link.clickUrl === '#') {
      event?.preventDefault();
    } else if (link.clickUrl !== '#' && link.childrenLinks?.length > 0) {
      handleMenuToggleClick();
      handleLinkClickEvent();
    } else if (link.clickUrl) {
      router.push(link.clickUrl);
      handleMenuToggleClick();
    }
  };

  // NAVIGATION LINK ITEM
  const NavLinkItem = (link: NavigationLinkModel) => {
    const isMarketplace = link?.clickUrl === '/marketplace';
    if (isMarketplace) {
      return (
        <div
          className={`flex items-center justify-center ${classes.newBadgeDiv}`}
        >
          <Link
            href={link?.clickUrl}
            target={link?.openInNewTab ? '_blank' : ''}
            rel={'noreferrer'}
            title={link?.title}
            onClick={(event: any) => handleLinkClick(event, link)}
            prefetch={false}
          >
            {link?.title}
          </Link>
          {isMarketplace && (
            <span
              className={`flex items-center justify-center ${classes.newBadge}`}
            >
              New
            </span>
          )}
        </div>
      );
    }

    return (
      <Link
        href={link?.clickUrl}
        target={link?.openInNewTab ? '_blank' : ''}
        rel={'noreferrer'}
        title={link?.title}
        onClick={(event: any) => handleLinkClick(event, link)}
        prefetch={false}
      >
        {link?.title}
      </Link>
    );
  };

  // NAVIGATION SUIBMENU ITEM
  const NavSubMenu = (linkArr: NavigationLinkModel[] = []) => {
    if (linkArr.length > 0) {
      return (
        <div className={classes.SubMenu}>
          <ul>
            {linkArr.map((subEle: NavigationLinkModel) => {
              return <li key={`NavLink_${subEle}`}>{NavLinkItem(subEle)}</li>;
            })}
          </ul>
        </div>
      );
    }
    return null;
  };

  const renderNavSubMenu = (linkData: LinkModel) => {
    const { link, childrenLinks } = linkData;
    const title = link?.title?.toLowerCase();
    // Category / Blog mega menu rendering
    if (
      title.includes('learn') ||
      title.includes('blogs') ||
      title.includes('products') ||
      title.includes('tools')
    ) {
      return (
        <div className={classes.MegaMenu}>
          <div
            className={`${classes.MegaMenuWrapper} ${
              title.includes('blogs') ? classes.BlogMenuWrapper : ''
            }`}
          >
            <div className={classes.MenuContainer}>
              {title.includes('learn') ? <CategoryMenu /> : null}
              {title.includes('blogs') ? (
                <BlogNaviagtionContent contextData={contextData} />
              ) : null}
              {title.includes('products') ? <ProductsMenu /> : null}
              {title.includes('tools') ? <ToolsMenu /> : null}
            </div>
          </div>
        </div>
      );
    }

    return NavSubMenu(childrenLinks);
  };

  const handleNavItemClickEvent = () => {
    if (childrenLinks.length > 0) {
      if (navRef?.current) {
        const caretEle: HTMLElement = navRef.current?.lastChild;
        const nextEle: HTMLElement = navRef.current?.nextSibling;
        if (nextEle) {
          caretEle?.classList.toggle(classes.ToggleDropdownMenu);
          nextEle.classList.toggle(classes.ShowSubMenu);
        }
      }
    }
  };
  const title = link?.title?.toLowerCase();
  return (
    <li
      className={`${classes.NavItem} ${
        router.pathname === linkData.link.clickUrl ? classes.NavItemActive : ''
      } ${
        (title.includes('learn') ||
          title.includes('blogs') ||
          title.includes('products') ||
          title.includes('tools')) &&
        childrenLinks.length > 0
          ? classes.MegaSubMenu
          : ''
      }`}
      key={`NavItem__${keyIndex}`}
    >
      <div
        className={`flex justify-between items-center ${classes.NavItemContent}`}
        ref={navRef}
        onClick={handleNavItemClickEvent}
      >
        {NavLinkItem(link)}
        <NavCaret
          handleClickEvent={(event: any) => handleLinkClick(event, link)}
          linkArr={childrenLinks}
        />
      </div>
      {renderNavSubMenu(linkData)}
    </li>
  );
};

export default NavItem;
