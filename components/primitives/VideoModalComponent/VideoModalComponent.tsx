import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';

import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import Image from '../Image';
import VideoPlayerComponent from '../VideoPlayerComponent/VideoPlayerComponent';
import { isMobile } from '../../../utils/resolution';
import styleClasses from './VideoModalComponent.module.css';

type Props = {
  videoLink: string;
  showModal: boolean;
  showasDrawerMobile?: boolean;
  autoPlayOnOpen?: boolean;
  className?: string;
  closeOnOutsideClick?: boolean;
  handleModalClose?: () => void;
};

const VideoModalComponent = ({
  videoLink = '',
  showModal = false,
  showasDrawerMobile = false,
  handleModalClose = () => {},
  autoPlayOnOpen = true,
  className = '',
  closeOnOutsideClick = false,
}: Props) => {
  const handleCloseEvent = (reason: any) => {
    if (
      (reason !== 'backdropClick' && reason !== 'escapeKeyDown') ||
      closeOnOutsideClick
    ) {
      handleModalClose();
    }
  };

  const closeBtn = (className?: string) => {
    return (
      <div
        className={`${styleClasses.ModalClose} ${handleExtraProps(className)}`}
      >
        <span onClick={handleModalClose}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}commons/close.svg`}
            width={20}
            height={20}
            layout="fixed"
            alt="close-icon"
          />
        </span>
      </div>
    );
  };

  const renderVideoComponent = (className?: string) => {
    return (
      <div
        className={`${styleClasses.VideoPlayer} ${handleExtraProps(className)}`}
      >
        <VideoPlayerComponent videoLink={videoLink} autoPlay={autoPlayOnOpen} />
      </div>
    );
  };

  const handleRender = () => {
    if (isMobile() && showasDrawerMobile) {
      return (
        <Drawer
          open={showModal}
          classes={{
            paper: styleClasses.DrawerPaper,
          }}
          anchor="bottom"
          onClose={handleModalClose}
        >
          {closeBtn(styleClasses.DrawerClose)}
          {renderVideoComponent(styleClasses.VideoWrapper)}
        </Drawer>
      );
    }
    return (
      <Dialog
        fullWidth
        open={showModal}
        onClose={(event, reason) => handleCloseEvent(reason)}
        classes={{
          root: `${handleExtraProps(className)}`,
          paper: styleClasses.paper,
        }}
        data-testid="video-modal"
      >
        {closeBtn()}
        {renderVideoComponent()}
      </Dialog>
    );
  };

  if (!videoLink || videoLink?.trim() === '') {
    return null;
  }

  return handleRender();
};

export default VideoModalComponent;
