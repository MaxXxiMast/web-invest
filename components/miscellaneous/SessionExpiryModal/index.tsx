import React, { useState, useEffect } from 'react';

import Image from '../../primitives/Image';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';

import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

import styles from './SessionExpiryModal.module.css';

type SessionExpiryProps = {
  open: boolean;
  onClose: () => void;
};

function SessionExpiryModal(props: SessionExpiryProps) {
  const [timer, setNewTime] = useState(5);
  const { onClose, open } = props;

  let timeoutId: number | null = null;

  const handleTimer = () => {
    setNewTime((prevTime) => {
      if (prevTime > 0) {
        return prevTime - 1;
      } else {
        clearInterval(timeoutId as any);
        onClose();
        return 0;
      }
    });
  };

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line
      (timeoutId as any) = setInterval(handleTimer, 1000);
    }
    return () => clearInterval(timeoutId as any);
  }, []);

  const renderDetails = () => {
    return (
      <div className="items-align-center-column-wise">
        <div className={styles.icon}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}new-website/sdi/delete_modal.svg`}
            alt="delete modal"
          />
        </div>

        <div className={styles.mainHeading}>Session Expired</div>

        <div className={styles.description}>
          Redirecting you to login page in {timer} seconds ...
        </div>
      </div>
    );
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={open}
      className={styles.PrivateLinkModal}
      cardClass={styles.PrivateLinkModalCard}
      drawerExtraClass={styles.PrivateLinkMobileDrawer}
      hideClose
    >
      {renderDetails()}
    </MaterialModalPopup>
  );
}

export default SessionExpiryModal;
