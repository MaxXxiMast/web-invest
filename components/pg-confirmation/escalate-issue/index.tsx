import React, { useContext, useState } from 'react';

// components
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';
import PoweredByGrip from '../../primitives/PoweredByGrip';

// utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { isGCOrder } from '../../../utils/gripConnect';

// api
import { escalatePaymentIssue } from '../../../api/user';

// context
import { PendingPgOrderContext } from '../../../pages/pg-confirmation';

// styles
import styles from './EscalateIssue.module.css';

const EscalateIssue = () => {
  const [showModal, setShowModal] = useState(false);
  const {
    transactionID,
    isFdOrder,
    redirectToAssetDetail,
    redirectToAssetAggrement,
  } = useContext(PendingPgOrderContext);

  const isGC = isGCOrder();

  const escalate = async () => {
    try {
      await escalatePaymentIssue(transactionID);
      setShowModal(true);
    } catch (error) {
      console.error('Error while escalating issue', error);
    }
  };

  return (
    <>
      <div className={isGC ? styles.GCButtonContainer : ''}>
        <div
          className={`flex justify-between items-center ${styles.container}`}
        >
          <span>Money debited from your account?</span>
          <Button
            variant={ButtonType.Secondary}
            onClick={escalate}
            className={styles.escalateButton}
          >
            Escalate
          </Button>
        </div>
        {isGC ? (
          <div className={styles.GCPoweredContainer}>
            <PoweredByGrip />
          </div>
        ) : null}
      </div>
      <MaterialModalPopup
        showModal={showModal}
        isModalDrawer={true}
        className={`justify-center`}
        cardClass={styles.modalCard}
        hideClose={true}
      >
        <div className="flex justify-center">
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/check-circle.svg`}
            width={60}
            height={60}
            layout="intrinsic"
            alt="Check Circle Icon"
          />
        </div>
        <h4 className={styles.heading}>Your issue has been escalated.</h4>
        <p className={styles.info}>
          An email has been initiated to our Payment Gateway partner. In case
          your money was debited, it will be refunded to you by the Payment
          Gateway in the next 5-6 business days.
        </p>
        <Button
          width={'100%'}
          className={styles.cta}
          onClick={isFdOrder ? redirectToAssetDetail : redirectToAssetAggrement}
        >
          Back to Checkout
        </Button>
      </MaterialModalPopup>
    </>
  );
};

export default EscalateIssue;
