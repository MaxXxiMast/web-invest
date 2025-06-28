import React from 'react';
import Link from 'next/link';
import Image from '../Image';
import { handleExtraProps } from '../../../utils/string';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../../utils/appHelpers';

import styles from './BackBtn.module.css';

type Props = {
  isDirectLink?: boolean;
  className?: string;
  handleBackEvent?: any;
  extraImage?: string | null;
  backUrl?: string | null;
  shouldHandleAppBack?: boolean;
};

const BackBtn = ({
  isDirectLink = false,
  className,
  extraImage = null,
  handleBackEvent = () => {},
  backUrl = null,
  shouldHandleAppBack = false,
}: Props) => {
  const handleBackClickEvent = () => {
    if (
      isRenderedInWebview() &&
      window.history.length <= 1 &&
      shouldHandleAppBack
    ) {
      postMessageToNativeOrFallback('no_back', {});
    } else {
      handleBackEvent();
    }
  };

  return (
    <div className={`${styles.BackBtn} ${handleExtraProps(className)}`}>
      <span className={styles.BackArrow}>
        {isDirectLink ? (
          <Link href={backUrl ? backUrl : '#'} passHref prefetch={false}>
            <span
              className={`icon-arrow-left ${styles.BackArrowIcon}`}
              data-testid="arrow-icon"
            />
          </Link>
        ) : (
          <>
            <span className="cursor" onClick={handleBackClickEvent}>
              <span
                className={`icon-arrow-left ${styles.BackArrowIcon}`}
                data-testid="arrow-icon"
              />
            </span>
          </>
        )}
      </span>
      {extraImage && (
        <span className={styles.ExtraImage}>
          <Image width={150} height={46} src={extraImage} alt="Udaan" />
        </span>
      )}
    </div>
  );
};

export default BackBtn;
