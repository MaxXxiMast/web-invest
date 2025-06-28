import React from 'react';
import Cookie from 'js-cookie';
import styles from '../../styles/ApplyNow.module.css';
import Button, { ButtonType } from '../primitives/Button';
import Image from '../primitives/Image';
import { useRouter } from 'next/router';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../utils/string';

type Props = {
  data?: any;
  className?: any;
  showButton?: boolean;
  isLoggedIn?: boolean;
};

const ReferralProgramBreakBanner = ({
  data,
  className,
  showButton = true,
  isLoggedIn = false,
}: Props) => {
  const router = useRouter();
  const handleRedirect = () => {
    let redirectURL = data?.button?.clickUrl;
    if (!isLoggedIn) {
      Cookie.set('redirectTo', '/referral-dashboard');
      redirectURL = '/login';
    }

    router.push(redirectURL);
  };
  return (
    <div className={`${styles.referralBreakMain} ${className} slide-up`}>
      <div className={'containerNew'}>
        <div
          className={`${styles.referralBreakBoxWithoutButton} slide-up flex justify-between items-center `}
        >
          <div className={`${styles.applyNowLeft} $ flex items-center`}>
            <div
              className={`${styles.organicSeedlingContent} ${''}
               `}
            >
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/BannerIcon.svg`}
                alt={`OrganicSeedling`}
                layout={'fixed'}
                width={'80'}
                height={'80'}
              />
              <div className={''}>
                <h5>{data?.title}</h5>
                <h6>{data?.subTitle}</h6>
              </div>
            </div>
          </div>
          {showButton ? (
            <div className={styles.applyNowRight}>
              <Button
                onClick={handleRedirect}
                width={160}
                variant={ButtonType.Primary}
              >
                {data?.button?.label}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ReferralProgramBreakBanner;
