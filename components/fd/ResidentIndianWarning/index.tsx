import React from 'react';

// COMPONENTS
import MaterialModalPopup from '../../primitives/MaterialModalPopup';

// UTILS
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// STYLES
import styles from './ResidentIndianWarning.module.css';
import Image from '../../primitives/Image';

interface Props {
  showModal: boolean;
  setModal: (value: boolean) => void;
}

const ResidentIndianWarning = ({ showModal, setModal }: Props) => {
  return (
    <MaterialModalPopup
      showModal={showModal}
      isModalDrawer
      className={styles.container}
      handleModalClose={() => setModal(false)}
    >
      <div className="flex justify-center">
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/GripWarningTriangle.svg`}
          alt="GripWarningTriangle"
          height={60}
          width={60}
          layout="intrinsic"
        />
      </div>
      <h1 className={styles.message}>
        Only those who are resident of India are allowed to invest in FD
      </h1>
    </MaterialModalPopup>
  );
};

export default ResidentIndianWarning;
