import React from 'react';
import Button, { ButtonType } from '../primitives/Button';
import styles from '../../styles/Vault/WithdrawlModal.module.css';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import Image from '../primitives/Image';

type Props = {
  handleClose: () => void;
  handleOkay: () => void;
};

const FirstTimeInvestmentModal = ({ handleOkay, handleClose }: Props) => {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.WarningImage}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}commons/Warning.svg`}
          alt="Warning"
        />
      </div>
      <span className={styles.heading}>
        Once you add money to your vault, withdrawal is allowed only after your
        first successful investment.{' '}
      </span>
      <div className={styles.buttonContainer}>
        <Button variant={ButtonType.Inverted} onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleOkay}>Okay</Button>
      </div>
    </div>
  );
};

export default FirstTimeInvestmentModal;
