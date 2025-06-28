import React, { ReactNode } from 'react';
import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';

import { handleExtraProps } from '../../../utils/string';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import CloseLineIcon from '../../assets/CloseLineIcon';

import styles from './MaterialModalPopup.module.css';
import useKeyboardVisibility from '../../../utils/customHooks/useKeyBoardVisibility';

type Props = {
  showModal: boolean;
  isModalDrawer?: boolean;
  className?: string;
  drawerExtraClass?: string;
  drawerRootExtraClass?: string;
  closeButtonClass?: string;
  closeOnOutsideClick?: boolean;
  closeIconSize?: number;
  showCloseBtn?: boolean;
  children?: ReactNode;
  cardStyles?: React.CSSProperties;
  cardClass?: string;
  mainClass?: string;
  backgroundColor?: string;
  hideClose?: boolean;
  handleModalClose?: (val: any) => any;
  bodyClass?: string;
  isShowBackDrop?: boolean;
  isKeyboardScroll?: boolean;
};

const MaterialModalPopup = ({
  showModal = false,
  isModalDrawer = false,
  handleModalClose = () => {},
  className = '',
  drawerExtraClass = '',
  drawerRootExtraClass,
  closeOnOutsideClick = true,
  children,
  closeButtonClass = '',
  showCloseBtn = true,
  closeIconSize = 20,
  cardStyles = {},
  cardClass = '',
  mainClass = '',
  backgroundColor = '',
  hideClose = false,
  bodyClass = '',
  isShowBackDrop = false,
  isKeyboardScroll = false,
}: Props) => {
  const isMobile = useMediaQuery();
  const { isKeyboardVisible, keyboardOffset } = useKeyboardVisibility();

  const handleCloseEvent = (reason: any) => {
    if (
      (reason !== 'backdropClick' && reason !== 'escapeKeyDown') ||
      closeOnOutsideClick
    ) {
      handleModalClose(false);
    }
  };

  const closeBtn = () => {
    if (!showCloseBtn) {
      return null;
    }
    return (
      <div
        className={`${styles.CloseBtn} ${
          styles.MobileCloseBtn
        } ${handleExtraProps(closeButtonClass)}`}
      >
        <span onClick={() => handleModalClose(false)}>
          <CloseLineIcon
            width={isMobile ? '12' : closeIconSize.toString()}
            height={isMobile ? '12' : closeIconSize.toString()}
          />
        </span>
      </div>
    );
  };

  const renderBody = () => {
    return (
      <div
        className={` ${isModalDrawer ? styles.DrawerCard : ''} ${mainClass}`}
      >
        <div
          className={`${className} ${styles.ModalPopupInner} ModalPopupInner`}
          style={{
            marginBottom:
              isKeyboardScroll && isKeyboardVisible ? keyboardOffset : 0,
          }}
        >
          <div
            className={`${styles.Card} Card ${cardClass} ${
              isModalDrawer ? drawerExtraClass : ''
            }`}
            style={{ background: backgroundColor, ...cardStyles }}
          >
            {!hideClose ? (
              <div className={styles.ModalHeader}>{closeBtn()}</div>
            ) : null}
            <div
              className={`${styles.ModalBody} ${handleExtraProps(bodyClass)}`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleRender = () => {
    if (isMobile && isModalDrawer) {
      return (
        <Drawer
          open={showModal}
          classes={{
            paper: `${styles.DrawerPaper}`,
            modal: `${styles.DrawerModal} ${handleExtraProps(
              drawerRootExtraClass
            )} ${isShowBackDrop ? styles.BackDropDialog : ''}`,
          }}
          anchor="bottom"
          onClose={() => handleModalClose(false)}
        >
          {renderBody()}
        </Drawer>
      );
    }

    return (
      <Dialog
        fullWidth
        open={showModal}
        onClose={(event, reason) => handleCloseEvent(reason)}
        classes={{
          paper: `${handleExtraProps(className)} ${styles.paper}`,
          root: `${styles.ModalRoot}`,
          container: `${isShowBackDrop ? styles.BackDropDialog : ''}`,
        }}
      >
        {renderBody()}
      </Dialog>
    );
  };

  return handleRender();
};

export default MaterialModalPopup;
