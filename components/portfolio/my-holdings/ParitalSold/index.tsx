import React from 'react';

// components
import Image from '../../../primitives/Image';
import Transaction from '../../../portfolio-holdings/transactionAndReturns/Transaction';

// utils
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';

// styles
import styles from './MyHoldings.module.css';

const PartialSold = ({ show = false, securityID, assetName }) => {
  const [showTransactionModal, setShowTransactionModal] = React.useState(false);
  const isMobile = useMediaQuery();
  if (!show) {
    return null;
  }
  return (
    <>
      <div
        className={`${styles.partialSold} flex items-center`}
        data-testid="MyHoldingsPartialSold"
        onClick={() => {
          setShowTransactionModal(true);
        }}
      >
        <Image
          src={
            'https://s3.ap-south-1.amazonaws.com/gripinvest.in/icons/coin.svg'
          }
          alt="coin"
          width={isMobile ? 20 : 12}
          height={isMobile ? 20 : 12}
          layout="intrinsic"
        />
        <span>Partially Sold</span>
      </div>
      {showTransactionModal && (
        <Transaction
          showModal={showTransactionModal}
          setShowModal={setShowTransactionModal}
          securityID={securityID}
          assetName={assetName}
        />
      )}
    </>
  );
};

export default PartialSold;
