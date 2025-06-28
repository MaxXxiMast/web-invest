import React from 'react';
import Image from 'next/image';

import { trackEvent } from '../../../utils/gtm';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import classes from './VideoComponent.module.css';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

type VideoModalProps = {
  videoLink: string;
  showModal: boolean;
  handleModalClose: () => void;
  showasDrawerMobile: boolean;
  autoPlayOnOpen: boolean;
};

const VideoModalComponent = dynamic<VideoModalProps>(
  () =>
    import('../VideoModalComponent/VideoModalComponent').then(
      (mod) => mod.default
    ),
  { ssr: false }
);

type Props = {
  link: any;
  className?: string;
  actionOverlayClassName?: string;
  showasDrawerMobile?: boolean;
  videoDuration?: any;
  videoTitle?: string;
  autoPlayOnOpen?: boolean;
  thumbnail?: string;
  playIconWidth?: number;
  playIconHeight?: number;
};

const VideoComponent = ({
  link,
  className = '',
  showasDrawerMobile = false,
  videoDuration = '',
  videoTitle = '',
  autoPlayOnOpen = true,
  thumbnail = '',
  playIconWidth = 32,
  playIconHeight = 32,
  actionOverlayClassName = '',
}: Props) => {
  const [videoObject, setVideoObject] = React.useState<any>({});
  const [showModal, setShowModal] = React.useState(false);
  const router = useRouter();

  // Use AbortController for the fetch request
  const abortController = new AbortController();

  const handleVideoDetails = () => {
    fetch(`https://noembed.com/embed?dataType=json&url=${link}`, {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((data) => setVideoObject(data))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          // Log other errors, if needed
          console.error('Error fetching video details:', error);
        }
      });
  };

  const onClickKnowMoreMobile = () => {
    const data = {
      url: router.pathname,
      videoLink: link,
    };

    trackEvent('View_Explainer_video', data);
    setShowModal(true);
  };

  const handleVideoTitle = () => {
    if (videoTitle && videoTitle.trim() !== '') {
      return videoTitle;
    }
    return videoObject?.title;
  };

  const handleVideoThumbnail = () => {
    if (thumbnail && thumbnail.trim() !== '') {
      return thumbnail;
    }
    return videoObject?.thumbnail_url;
  };

  React.useEffect(() => {
    handleVideoDetails();
    return () => {
      // Abort the ongoing fetch request when the component is unmounted
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link]); // Include 'link' in the dependency array to re-run the effect when 'link' changes

  if (!link || link.trim() === '') {
    return null;
  }

  return (
    <>
      <div
        className={`${classes.VideoComponent} ${handleExtraProps(className)}`}
        onClick={onClickKnowMoreMobile}
      >
        <Image
          src={handleVideoThumbnail() || ''}
          className={classes.VideoThumb}
          alt="VideoThumb"
          width={355}
          height={355}
        />
        <div
          className={`${classes.ActionOverlay} ${handleExtraProps(
            actionOverlayClassName
          )}`}
        >
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}commons/video-play.svg`}
            width={playIconWidth}
            height={playIconHeight}
            layout="fixed"
            alt="video-play"
          />
          <h4>{handleVideoTitle()}</h4>
          {videoDuration && <h4>{videoDuration}</h4>}
        </div>
      </div>

      {showModal && (
        <VideoModalComponent
          videoLink={link}
          showModal={showModal}
          handleModalClose={() => setShowModal(false)}
          showasDrawerMobile={showasDrawerMobile}
          autoPlayOnOpen={autoPlayOnOpen}
        />
      )}
    </>
  );
};

export default VideoComponent;
