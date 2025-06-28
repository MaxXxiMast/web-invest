import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import Image from '../../primitives/Image';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { trackEvent } from '../../../utils/gtm';
// Genenric Modal
const GenericModal = dynamic(
  () => import('../../user-kyc/common/GenericModal'),
  {
    ssr: false,
  }
);

import styles from './KnowMore.module.css';

type KnowMoreProps = {
  innerPageData: any;
};

function KnowMore({ innerPageData }: KnowMoreProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { nonInvestedBanner = {} } = innerPageData ?? {};
  const isMobile = useMediaQuery();

  const handleModal = (value = false) => {
    if (router.pathname === '/discover') {
      trackEvent('quick_start_page_entry');
      router.push('product-detail/quick-start');
      return;
    }
    setShowModal(value);
  };

  const Points = () => {
    if (!nonInvestedBanner?.modalPoints) {
      return null;
    }
    return (
      <ul className={styles.list}>
        {nonInvestedBanner?.modalPoints?.map((point) => (
          <li
            key={point}
            dangerouslySetInnerHTML={{
              __html: point,
            }}
          />
        ))}
      </ul>
    );
  };

  return (
    <>
      <div
        className={`flex justify-between ${styles.TopContainer}`}
        onClick={() => handleModal(true)}
      >
        <div className={styles.MainContainer}>
          <div className={styles.HeadingContainer}>
            <div className={styles.MainHeading}>
              {nonInvestedBanner?.bannerTitle}
            </div>
            <div className={styles.SubHeading}>
              {nonInvestedBanner?.bannerDescription}
            </div>
          </div>
          <div className={styles.PlayNowContainer}>
            <div className={styles.WatchVideoText}>
              {nonInvestedBanner?.bannerCta}
            </div>
            <div className={styles.knowMoreVideoIcon}>
              {nonInvestedBanner?.rightIcon ? (
                <span className={nonInvestedBanner?.rightIcon}></span>
              ) : (
                <Image
                  layout={'fixed'}
                  width={16}
                  height={16}
                  src={`${GRIP_INVEST_BUCKET_URL}discovery/right-icon.svg`}
                  alt={'KnowMoreVideoIcon'}
                />
              )}
            </div>
          </div>
        </div>
        <div className={styles.ImageContainer}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}${
              nonInvestedBanner?.bannerImage ?? 'icons/NonInvestedMockup.svg'
            }`}
            width={124}
            height={110}
            alt="NonInvestedMockup"
          />
        </div>
      </div>
      <GenericModal
        showModal={showModal}
        title={nonInvestedBanner?.modalTitle ?? 'sell Bonds anytime'}
        Content={Points}
        hideIcon={true}
        hideClose={!isMobile}
        btnText="Okay! Understood"
        handleModalClose={() => handleModal()}
        handleBtnClick={() => handleModal()}
      />
    </>
  );
}

export default KnowMore;
