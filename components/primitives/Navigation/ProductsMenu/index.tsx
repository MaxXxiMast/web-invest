import React from 'react';

import Image from '../../Image';
import MegaMenuLinkItem from '../MegaMenuLinkItem';
import {
  ProductCategoryLinkArr,
  CategoriesLinkType,
  LeftSideLinkArr,
  RightSideLinkArr,
} from '../data';
import classes from './Products.module.css';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';

type Props = {
  className?: string;
  [key: string]: unknown;
};

const ProductsMenu: React.ForwardRefExoticComponent<
  React.RefAttributes<unknown> & Props
> = React.forwardRef(({ className = '', ...rest }: Props, ref: any) => {
  const renderCol = (linkArr: CategoriesLinkType[]) => {
    return linkArr.map((ele: CategoriesLinkType) => {
      return (
        <MegaMenuLinkItem
          key={`${ele.title}__title`}
          title={ele.title}
          clickUrl={ele.clickUrl}
          shortDescription={ele.shortDescription}
          openInNewTab={ele.openInNewTab}
          isBgFilledIcon={ele.isBgFilledIcon}
          icon={
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}${ele.icon}`}
              alt={ele.title}
              width={40}
              height={40}
              layout="fixed"
            />
          }
          subLinks={ele.subLinks || []}
        />
      );
    });
  };

  return (
    <div {...rest} className={`${classes.Row} ${className}`} ref={ref}>
      <div className={classes.MenuSection}>
        <h3 className={classes.SectionTitle}>Our Products</h3>
        <div className={classes.Col}>
          <div className={classes.ColLeft}>
            {renderCol(
              ProductCategoryLinkArr.filter((e) =>
                LeftSideLinkArr.includes(e.id)
              )
            )}
          </div>
          <div className={classes.ColRight}>
            {renderCol(
              ProductCategoryLinkArr.filter((e) =>
                RightSideLinkArr.includes(e.id)
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductsMenu.displayName = 'ProductsMenu';

export default ProductsMenu;
