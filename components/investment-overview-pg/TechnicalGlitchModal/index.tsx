import React from 'react';
import dynamic from 'next/dynamic';

// components
import Image from '../../primitives/Image';
import Button from '../../primitives/Button';

// utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// styles
import styles from './TechnicalGlitchModal.module.css';

const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

const TechnicalGlitchModal = ({
  showModal = false,
}: {
  showModal: boolean;
}) => {
  return (
    <MaterialModalPopup
      showModal={showModal}
      isModalDrawer={true}
      className={`justify-center`}
      cardClass={styles.modalCard}
      hideClose={true}
    >
      <div className="flex justify-center">
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/warning-red.svg`}
          alt="Technical Glitch"
          width={60}
          height={60}
          layout="intrinsic"
        />
      </div>
      <h3 className={styles.header}>Order Processing Failed</h3>
      <p className={styles.description}>
        There seems to be a technical glitch with our payment partner. Please
        retry again.
      </p>
      <Button
        width="100%"
        onClick={() => {
          window.location.reload();
        }}
      >
        Go Back
      </Button>
    </MaterialModalPopup>
  );
};

export default TechnicalGlitchModal;
