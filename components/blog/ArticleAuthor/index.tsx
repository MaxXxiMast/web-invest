import Image from '../../primitives/Image';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import ReadTime from '../ReadTime';

import { getStrapiMediaS3Url } from '../../../utils/media';
import { handleExtraProps } from '../../../utils/string';
import { AuthorModel } from '../../../utils/blog';

import classes from './ArticleAuthor.module.css';

dayjs.extend(utc);
dayjs.extend(timezone);

type Props = {
  authorData?: AuthorModel;
  showReadTime?: boolean;
  description?: any;
  className?: string;
  showTitleWithDot?: boolean;
};

const ArticleAuthor = ({
  authorData = new AuthorModel(),
  showReadTime = false,
  description = '',
  className = '',
  showTitleWithDot = false,
}: Props) => {
  return (
    <div className={`${classes.Wrapper} ${handleExtraProps(className)}`}>
      <div className={classes.Author}>
        {authorData?.image?.desktopUrl ? (
          <div className={classes.Image}>
            <Image
              src={getStrapiMediaS3Url(authorData?.image?.desktopUrl)}
              width={32}
              height={32}
              layout="fixed"
              alt={authorData?.image?.altText || authorData?.name}
              title={authorData?.image?.altText || authorData?.name}
            />
          </div>
        ) : null}
        {authorData?.name && (
          <span className={classes.Name}> {authorData?.name}</span>
        )}
      </div>
      {authorData?.image?.desktopUrl?.data?.attributes?.updatedAt ? (
        <>
          {showTitleWithDot ? <div className={classes.dot} /> : null}
          <div className={`TitleWithDot`}>
            {dayjs(
              authorData?.image?.desktopUrl?.data?.attributes?.updatedAt
            ).format('MMM DD, YYYY')}
          </div>
        </>
      ) : null}

      <ReadTime description={description} showReadTime={showReadTime} />
    </div>
  );
};

export default ArticleAuthor;
