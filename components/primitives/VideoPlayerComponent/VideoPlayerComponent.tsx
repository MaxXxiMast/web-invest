import React, { Ref } from 'react';
import ReactPlayer from 'react-player';

type Props = {
  videoLink: string;
  autoPlay?: boolean;
  height?: number;
};

const VideoPlayerComponent = ({
  videoLink = '',
  autoPlay = false,
  height = 200,
}: Props) => {
  const reactPlayerRef: Ref<any> = React.useRef(null);

  React.useEffect(() => {
    if (autoPlay) {
      setTimeout(() => {
        if (reactPlayerRef && reactPlayerRef.current) {
          reactPlayerRef?.current?.handleClickPreview();
        }
      }, 100);
    }
  }, [autoPlay]);

  if (!videoLink || videoLink?.trim() === '') {
    return null;
  }

  return (
    <ReactPlayer
      width="100%"
      height={height}
      light
      controls
      url={videoLink}
      playing={true}
      ref={reactPlayerRef}
    />
  );
};

export default VideoPlayerComponent;
