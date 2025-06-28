import React from 'react';

// Components
import Image from '../../../primitives/Image';
import Button from '../../../primitives/Button';
import StyledLink from '../../common/StyledLink';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';

// Styles
import classes from './ErrorPopup.module.css';

type ErrorPopupProps = {
  data: {
    title: string;
    icon: string;
    desc1: string;
    desc2?: string;
    styledLink?: {
      title: string;
      link: string;
    };
    btnText?: string;
  };
  handleBtnClick: () => void;
};

const ErrorPopup = ({ data, handleBtnClick = () => {} }: ErrorPopupProps) => {
  return (
    <div className={classes.container}>
      <div className={classes.errorContainer}>
        <div className="flex">
          <div className={classes.imageWrapper}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}${data.icon}`}
              alt="popup_blocked"
              height={24}
              width={24}
              layout="fixed"
            />
          </div>
          <div>
            <div className={classes.errorTitle}>{data.title}</div>
            <div className={classes.info}>{data.desc1}</div>
            {data.desc2 ? (
              <div className={classes.info}>{data.desc2}</div>
            ) : null}
          </div>
        </div>
        {data?.styledLink && (
          <StyledLink
            title={data.styledLink.title}
            onClick={() => window.open(data.styledLink.link, '_blank')}
          />
        )}
        <div className={classes.buttonGroup}>
          {data.btnText && (
            <Button
              width={'100%'}
              className={classes.primaryButton}
              onClick={handleBtnClick}
            >
              {data.btnText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
