import { useState } from 'react';
import dynamic from 'next/dynamic';

import { VerticalStepper } from './VerticalStepper';
import Image from '../../primitives/Image';
import { Skeleton } from '@mui/material';

import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

import classes from './OrderJourney.module.css';

const VideoModalComponent = dynamic(
  () => import('../../primitives/VideoModalComponent/VideoModalComponent'),
  { ssr: false }
);

export const OrderJourneyComponent = ({
  videoURL,
  isAmo = false,
  isLoading,
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className={`${classes.OrderJourneyContainer}`}>
      <div className={classes.OrderJourneyHeader}>
        <div className={classes.OrderTitle}>Order Journey</div>
        {!isAmo && (
          <div
            className={classes.OrderWorks}
            onClick={() => setShowVideoModal(true)}
          >
            <div>How it Works? </div>
            <span className={classes.Playbtn}>
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}asset-details/WatchVideoIcon.svg`}
                alt="PlayIcon"
                width={16}
                height={16}
              />
            </span>
          </div>
        )}
      </div>
      <div>
        {isLoading ? (
          <Skeleton
            animation="wave"
            variant="rounded"
            height={400}
            width={'100%'}
          />
        ) : (
          <VerticalStepper />
        )}
        <div className={classes.awarenessContainer}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/Awareness.gif`}
            alt="InfoIcon"
            width={350}
            height={280}
            layout={'responsive'}
          />
        </div>
      </div>
      <VideoModalComponent
        videoLink={videoURL}
        showModal={showVideoModal}
        handleModalClose={() => setShowVideoModal(false)}
        showasDrawerMobile={true}
        autoPlayOnOpen={true}
      />
    </div>
  );
};
