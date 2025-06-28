import React from 'react';
import dynamic from 'next/dynamic';

import Image from '../../Image';
import MegaMenuLinkItem from '../MegaMenuLinkItem';
import {
  CategoriesLinkArr,
  CategoriesLinkType,
  LeftSideLinkArr,
  categoryVideoData,
} from '../data';
import classes from './CategoryMenu.module.css';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';

const VideoComponent = dynamic(
  () => import('../../VideoComponent/VideoComponent'),
  {
    ssr: false,
  }
);

type Props = {
  className?: string;
  [key: string]: unknown;
};

const CategoryMenu: React.ForwardRefExoticComponent<
  React.RefAttributes<unknown> & Props
> = React.forwardRef(({ className = '', ...rest }: Props, ref: any) => {
  const aboutUsLink = CategoriesLinkArr.filter((e) => e.id === 'about-us')[0];

  // NOSONAR: This line is commented for future use
  // const transparencyLink = CategoriesLinkArr.filter(
  //   (e) => e.id === 'transparency'
  // )[0];

  return (
    <div {...rest} className={`${classes.Row} ${className}`} ref={ref}>
      <div className={classes.MenuSection}>
        <h3 className={classes.SectionTitle}>Our Products</h3>
        <div className={classes.Col}>
          <div className={classes.ColLeft}>
            {/* Filter left side links from all links array */}
            {CategoriesLinkArr.filter((e) =>
              LeftSideLinkArr.includes(e.id)
            )?.map((ele: CategoriesLinkType) => {
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
                      width={ele.id === 'faqs' ? 20 : 40}
                      height={ele.id === 'faqs' ? 20 : 40}
                      layout="fixed"
                    />
                  }
                  className={ele.id === 'faqs' ? classes.TopBorder : ''} //Top border class
                />
              );
            })}
          </div>
          <div className={classes.ColRight}>
            <VideoComponent
              link={categoryVideoData.url}
              thumbnail={categoryVideoData.thumbnail}
              videoDuration={categoryVideoData.duration}
              videoTitle={categoryVideoData.title}
              className={classes.ProductVideo}
            />
          </div>
        </div>
      </div>
      <div className={classes.MenuSection}>
        <h3 className={classes.SectionTitle}>About</h3>
        <div className={classes.Col}>
          <div className={classes.ColLeft}>
            <MegaMenuLinkItem
              title={aboutUsLink.title}
              clickUrl={aboutUsLink.clickUrl}
              shortDescription={aboutUsLink.shortDescription}
              openInNewTab={aboutUsLink.openInNewTab}
              isBgFilledIcon={aboutUsLink.isBgFilledIcon}
              icon={
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}${aboutUsLink.icon}`}
                  alt={aboutUsLink.title}
                  width={15}
                  height={18}
                  layout="fixed"
                />
              }
            />
          </div>
          {/* <div className={classes.ColRight}>
            <MegaMenuLinkItem
              title={transparencyLink.title}
              clickUrl={transparencyLink.clickUrl}
              shortDescription={transparencyLink.shortDescription}
              openInNewTab={transparencyLink.openInNewTab}
              isBgFilledIcon={transparencyLink.isBgFilledIcon}
              icon={
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}${transparencyLink.icon}`}
                  alt={transparencyLink.title}
                  width={20}
                  height={16}
                />
              }
            />
          </div> */}
        </div>
      </div>
    </div>
  );
});

CategoryMenu.displayName = 'CategoryMenu';

export default CategoryMenu;
