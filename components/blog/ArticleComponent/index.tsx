import Image from '../../primitives/Image';
import Link from 'next/link';
import { createRef } from 'react';

import { handleExtraProps, handleStringLimit } from '../../../utils/string';
import { getStrapiMediaS3Url } from '../../../utils/media';
import { AuthorModel, ImageModel } from '../../../utils/blog';

import ReadTime from '../ReadTime';
import CategoryBadges from '../CategoryBadges';
import ArticleAuthor from '../ArticleAuthor';

import classes from './ArticleComponent.module.css';

/**
 * Function to render article title
 * @param title Title data
 * @param charCount character count to display
 * @returns returns html element of article title
 */
const renderBlogTitle = (
  title: any,
  charCount: number,
  titleClassName = ''
) => {
  if (!title) {
    return null;
  }
  return (
    <h3
      title={title}
      className={`${classes.Title} ${titleClassName}`}
      dangerouslySetInnerHTML={{
        __html: handleStringLimit(title, charCount),
      }}
    />
  );
};

/**
 * Function to get image element
 * @param imageObject Image data object
 * @returns returns image html element
 */
const renderArticleImg = (imageObject: any) => {
  if (Object.keys(imageObject).length === 0) {
    return null;
  }
  return (
    <Image
      src={getStrapiMediaS3Url(imageObject?.desktopUrl)}
      width={201}
      height={144}
      layout="fixed"
      alt={imageObject?.altText || 'Article Image'}
      title={imageObject?.altText || 'Article Image'}
      unoptimized={false}
      objectPosition={'top left'}
    />
  );
};

type Props = {
  link: string;
  title?: any;
  description?: any;
  image?: ImageModel;
  author?: AuthorModel;
  titleCharCount?: number;
  tagList?: any[];
  designVersion?: 'leftImage' | 'rightImage';
  className?: string;
  showReadTime?: boolean;
  showReadTimeAuthor?: boolean;
  handleClickEvent?: () => void;
  handleBadgeClick?: (badge: string) => void;
  titleClassName?: string;
};

const ArticleComponent = ({
  title = '',
  description = '',
  image = new ImageModel(),
  author = new AuthorModel(),
  link = '',
  titleCharCount = 35,
  tagList = [],
  className = '',
  showReadTimeAuthor = false,
  handleClickEvent = () => {},
  handleBadgeClick = () => {},
  titleClassName = '',
}: Props) => {
  const taglistRef = createRef();

  // PREVENT PARENT CLICK EVENT ON BADGE CLICK
  const clickEvent = (e: any) => {
    if (
      e.target === taglistRef.current ||
      (taglistRef.current as any)?.contains(e.target)
    ) {
      e.preventDefault();
    } else {
      handleClickEvent();
    }
  };

  const renderCardBody = () => {
    return (
      <>
        <div className={classes.Left}>
          <div className={classes.ImageWrapper}>{renderArticleImg(image)}</div>
        </div>
        <div className={classes.Right}>
          <ReadTime
            showReadTime
            description={description}
            className={classes.DesktopReadTime}
          />
          {renderBlogTitle(title, titleCharCount, titleClassName)}
          <ReadTime
            showReadTime
            description={description}
            className={classes.MobileReadTime}
          />
          <ArticleAuthor
            description={description}
            showReadTime={showReadTimeAuthor}
            authorData={author}
            className={classes.ArticleAuthorV1}
          />
          <CategoryBadges
            ref={taglistRef}
            tagList={tagList}
            handleClickEvent={(data) => handleBadgeClick(data)}
          />
        </div>
      </>
    );
  };

  return (
    <div className={handleExtraProps(className)}>
      <Link
        href={`/blog/${link}`}
        passHref
        target="_blank"
        onClick={clickEvent}
        className={`${classes.VersionOne} ${classes.FlexWrapper}`}
      >
        {renderCardBody()}
      </Link>
    </div>
  );
};

export default ArticleComponent;
