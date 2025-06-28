import React from 'react';
import dynamic from 'next/dynamic';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../utils/string';
import { isMobile } from '../../utils/resolution';
import Button, { ButtonType } from '../primitives/Button';
import { numberToCurrency } from '../../utils/number';
import Image from '../primitives/Image';

import styles from '../../styles/Vault/TransactionPopup.module.css';

const MaterialModalPopup = dynamic(
  () => import('../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

const TransactionPopup = (props: any) => {
  const { txn } = props;
  const [showModal, setShowModal] = React.useState(true);
  return (
    <>
      <MaterialModalPopup
        handleModalClose={(res: boolean) => {
          setShowModal(res);
          props.onClose();
        }}
        showModal={showModal}
        isModalDrawer={isMobile()}
        className={` ${styles.mainPopup}`}
        cardClass={`${styles.cardClass}`}
        drawerExtraClass={styles.mobilepopup}
      >
        <div className={` ${styles.modalContainer}`}>
          <Image
            src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}vault/transactionFailed.svg`}
            width={72}
            height={72}
            alt="transactionFailed"
          />
          <div className={styles.textContainer}>
            <span className={styles.addMoneyText}>Add Money Failed :(</span>
            <span className={styles.transactionAmount}>
              &#8377; {numberToCurrency(txn.amount)}
            </span>
          </div>

          <Button
            variant={ButtonType.Inverted}
            width={'100%'}
            onClick={props?.retryClick}
          >
            Retry Adding
          </Button>
        </div>
      </MaterialModalPopup>
    </>
  );
};

export default TransactionPopup;
