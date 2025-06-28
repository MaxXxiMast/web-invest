import React from 'react';
import { useRouter } from 'next/router';

import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

import { classes } from './HeaderStyle';

type Props = {
  pageName: string;
  goBack?: string;
  hideLine?: boolean;
  className?: any;
  id?: any;
  onClickBackButton?: () => void;
};

const Header = ({
  pageName,
  goBack,
  hideLine = false,
  className = '',
  id = '',
  onClickBackButton,
}: Props) => {
  const Router = useRouter();
  const isMobile = useMediaQuery();

  const onClickBack = () => {
    if (typeof onClickBackButton === 'function') {
      onClickBackButton?.();
      return;
    }

    goBack ? window.open(goBack, '_self') : Router.back();
  };

  const header = () => {
    return (
      <div
        id={id}
        className={`items-align-center-row-wise justify-start ${classes.mobileHeaderContainer} ${className}`}
      >
        <span
          className={`icon-arrow-left ${classes.pointer}`}
          style={{
            fontSize: 24,
            fontWeight: 700,
          }}
          onClick={onClickBack}
        />
        <div className={`flex ${classes.heading}`}> {pageName} </div>
      </div>
    );
  };
  const desktopHeader = () => {
    return (
      <div className={'flex-column containerNew'}>
        {header()}
        <div className={`${hideLine ? '' : classes.line} containerNew`} />
      </div>
    );
  };

  const renderChildren = () => {
    return isMobile ? header() : desktopHeader();
  };

  return renderChildren();
};

export default Header;
