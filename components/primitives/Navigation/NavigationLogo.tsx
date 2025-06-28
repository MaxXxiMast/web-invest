// NODE MODULES
import React, { useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

// Contexts
import { GlobalContext } from '../../../pages/_app';

// Utils
import {
  GripBlogLogo,
  GripLogo,
  innerPagesMobileHeaderRouteNameMapping,
} from '../../../utils/constants';
import { getStrapiMediaS3Url } from '../../../utils/media';
import { useAppSelector } from '../../../redux/slices/hooks';
import { isUserLogged } from '../../../utils/user';

// Styles
import classes from './Navigation.module.css';

const NavigationLogo = () => {
  const tokenexpired = useAppSelector((state) => state.sessionExpiry.show);
  const isLoggedIn = isUserLogged() || tokenexpired;
  const router = useRouter();
  const isBlogPage = router.pathname.includes('blog');
  const pageTxt =
    innerPagesMobileHeaderRouteNameMapping[window.location.pathname];
  const isHavePageTxt = Boolean(pageTxt && pageTxt.trim() !== '');

  const { logo, BlogLogo }: any = useContext(GlobalContext);

  const LogoUrl = getStrapiMediaS3Url(logo) || GripLogo;
  const BlogLogoUrl = getStrapiMediaS3Url(BlogLogo) || GripBlogLogo;

  const handleLogoURL = () => {
    if (isBlogPage) {
      return BlogLogoUrl || GripBlogLogo;
    }
    return LogoUrl || GripLogo;
  };

  const handleLogoClick = () => {
    if (isBlogPage) {
      window.open('/blog', '_self');
    } else {
      window.open(isLoggedIn ? '/discover' : '/', '_self');
    }
  };

  return (
    <div className={classes.LogoWrapper}>
      <div
        className={`${classes.Logo} ${isBlogPage ? classes.BlogLogo : ''} ${
          isHavePageTxt ? classes.HideInMobile : ''
        }`}
        onClick={handleLogoClick}
      >
        <Image
          src={handleLogoURL()}
          layout="fixed"
          width={isBlogPage ? 140 : 90}
          height={isBlogPage ? 36 : 31}
          alt="Grip Logo"
          title="Grip Invest: Best Alternative Investment Platform in India"
        />
      </div>
      {isHavePageTxt && (
        <span
          className={`${classes.RouteText} ${
            !isLoggedIn ? classes.HideInMobile : ''
          }`}
        >
          {pageTxt}
        </span>
      )}
    </div>
  );
};

export default React.memo(NavigationLogo);
