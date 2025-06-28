import React from 'react';
import classes from './MegaMenuLinkItem.module.css';
import { handleExtraProps } from '../../../../utils/string';

export type MegaMenuLinkItemProps = {
  title?: string | any;
  shortDescription?: string | any;
  icon?: any;
  className?: string;
  isBgFilledIcon?: boolean;
  openInNewTab?: boolean;
  handleClick?: () => void;
  clickUrl?: string;
  children?: React.ReactNode;
  iconClassName?: string;
  subLinks?: {
    title: string;
    clickUrl: string;
  }[];
  [key: string]: unknown;
};

/**
 * Mega menu component
 * @param title Title
 * @param shortDescription Short desctiption
 * @param icon Icon
 * @param className Extra class name
 * @param isBgFilledIcon Show background filled icon
 * @param children Extra react node element
 */
const MegaMenuLinkItem: React.ForwardRefExoticComponent<
  React.RefAttributes<unknown> & MegaMenuLinkItemProps
> = React.forwardRef(
  (
    {
      title,
      shortDescription,
      className = '',
      icon,
      isBgFilledIcon,
      clickUrl = '#',
      openInNewTab = true,
      handleClick,
      children,
      iconClassName,
      subLinks = [],
      ...rest
    }: MegaMenuLinkItemProps,
    ref: any
  ) => {
    return (
      <div
        {...rest}
        className={`${handleExtraProps(className)} ${classes.container}`}
      >
        <a
          href={clickUrl}
          target={openInNewTab ? '_blank' : ''}
          rel={'noopener noreferrer'}
          onClick={handleClick}
          className={`flex items-center ${classes.MenuItem}`}
        >
          <div
            className={`${classes.ItemIcon} ${
              isBgFilledIcon ? classes.Filled : ''
            } ${iconClassName}`}
          >
            {icon}
          </div>
          <div className={classes.ItemContent}>
            {title ? (
              <h5>
                {title}{' '}
                {subLinks.length === 0 ? (
                  <span
                    className={`items-align-center-row-wise icon-caret-right ${classes.CaretRight}`}
                  />
                ) : null}
              </h5>
            ) : null}
            {shortDescription ? <p>{shortDescription}</p> : null}
          </div>
          {children}
        </a>
        <div className={`flex ${classes.subLinkContainer}`}>
          {subLinks.length
            ? subLinks.map((l) => (
                <a
                  href={l.clickUrl}
                  target={openInNewTab ? '_blank' : ''}
                  rel={'noreferrer'}
                  className={`flex items-center ${classes.subLink}`}
                  key={l.title}
                >
                  {l.title}{' '}
                  <span className={`icon-caret-right ${classes.CaretRight}`} />
                </a>
              ))
            : null}
        </div>
      </div>
    );
  }
);

MegaMenuLinkItem.displayName = 'MegaMenuLinkItem';

export default MegaMenuLinkItem;
