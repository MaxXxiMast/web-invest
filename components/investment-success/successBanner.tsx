import React from 'react';
import dompurify from 'dompurify';
import Image from '../primitives/Image';

import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../utils/string';

import styles from '../../styles/Investment/SuccessBanner.module.css';

type Props = {
  data?: any;
  className?: any;
};

const SuccessBanner = ({ data, className }: Props) => {
  const sanitizer = dompurify.sanitize;
  const isMobile = useMediaQuery();

  return (
    <div className={`${styles.mainContainer}`}>
      <div className="containerNew">
        <div>
          <div className={styles.messageContainer}>
            {isMobile ? (
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}${
                  data?.mobileIcon ?? data.icon
                }`}
                alt="Investment Success"
                layout='intrinsic'
                height={24}
                width={24}
              />
            ) : (
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}${data.icon}`}
                height={68}
                width={68}
                alt="Investment Success"
                layout="fixed"
              />
            )}

            <div className={`${styles.flexContainer} ${className}`}>
              <span className={styles.investedSuccessMessage}>
                {data?.label}
              </span>
              <span
                className={styles.investedSecondMessage}
                dangerouslySetInnerHTML={{
                  __html: sanitizer(data?.subLabel),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessBanner;
