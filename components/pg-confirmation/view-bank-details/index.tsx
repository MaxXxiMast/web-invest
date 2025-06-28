import React, { useContext, useEffect, useState } from 'react';

// components
import Image from '../../primitives/Image';
import GenericModal from '../../user-kyc/common/GenericModal';
import RenderBankDetailModalUI from '../../common/BankDetailsModalUI';

// utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// context
import { PendingPgOrderContext } from '../../../pages/pg-confirmation';

// apis
import { getPaymentType } from '../../../api/payment';

// styles
import styles from './ViewBankDetails.module.css';

const ViewBankDetails = () => {
  const [showModal, setShowModal] = useState(false);
  const [neftDetails, setNeftDetails] = useState({});

  const {
    assetID,
    principalAmount,
    transactionID,
    orderSettlementDate,
    amount,
  } = useContext(PendingPgOrderContext);

  useEffect(() => {
    const getNeftDetails = async () => {
      try {
        const data = await getPaymentType(
          assetID,
          Math.round(Number(principalAmount)),
          transactionID
        );
        setNeftDetails(data?.NSE?.offline?.details);
      } catch (error) {
        console.log('error', error);
      }
    };
    assetID && principalAmount && transactionID && getNeftDetails();
  }, [assetID, principalAmount, transactionID]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div
        className={`flex justify-between items-center ${styles.container}`}
        onClick={openModal}
      >
        <div className="flex_wrapper">
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/bank.svg`}
            alt="Bank"
            width={25}
            height={25}
            layout="intrinsic"
          />
          <span className={styles.header}>Add Beneficiary Account</span>
        </div>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/chevron-right.svg`}
          alt="Arrow Right"
          width={25}
          height={25}
          layout="intrinsic"
        />
      </div>
      <GenericModal
        showModal={showModal}
        hideIcon={true}
        hideClose={false}
        handleModalClose={closeModal}
      >
        <RenderBankDetailModalUI
          neftDetails={neftDetails}
          settlementDate={orderSettlementDate}
          totalPayableAmount={amount}
        />
      </GenericModal>
    </>
  );
};

export default ViewBankDetails;
