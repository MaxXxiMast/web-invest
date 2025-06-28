// NODE MODULES
import { useContext, useState } from 'react';

// Context
import { InvestmentOverviewPGContext } from '../../../contexts/investmentOverviewPg';

// Components
import AccountInfo from '../../investment-overview/account-info';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';

// Utils
import { trackEvent } from '../../../utils/gtm';
import { getPaymentOptionMessages } from '../../../utils/kyc';

//Skeleton
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// Styles
import styles from './BankDetails.module.css';

export default function UserBankDetails() {
  const { pageData, userKycDetails }: any = useContext(
    InvestmentOverviewPGContext
  );

  const [open, setOpen] = useState(false);

  const openBankDetails = () => {
    setOpen(true);
    trackEvent('Bank Account Clicked', {
      name_of_bank: userKycDetails?.bank?.bankName,
    });
  };

  const paymentOptionMessages = getPaymentOptionMessages(pageData);

  const renderAccountInfo = (id = '', showInfoIcon = true) => {
    if (!userKycDetails?.bank?.accountNumber)
      return (
        <div className={`flex-column gap-12 ${styles.skeleton}`} id={id}>
          <CustomSkeleton
            styles={{
              width: '80%',
              height: 16,
            }}
          />
          <CustomSkeleton
            styles={{
              width: '80%',
              height: 24,
            }}
          />
        </div>
      );
    return (
      <AccountInfo
        id={id}
        showCardTitle={false}
        bankAccNumber={userKycDetails?.bank?.accountNumber}
        bankName={userKycDetails?.bank?.bankName}
        className={`items-align-center-row-wise ${styles.InfoCard}`}
        bankOptional={{
          bankTitle: 'Investments will be only accepted from',
          isShowBankIcon: false,
        }}
      >
        {showInfoIcon ? (
          <span
            className={`icon-info ${styles.InfoIcon}`}
            onClick={openBankDetails}
          />
        ) : null}
      </AccountInfo>
    );
  };

  const renderDetails = () => {
    return (
      <div className={`flex-column ${styles.MainDetailsContainer}`}>
        <span className={styles.Heading}>Your registered bank account</span>
        {userKycDetails?.bank?.accountNumber
          ? renderAccountInfo('', false)
          : null}
        <span className={styles.AcceptanceText}>
          {paymentOptionMessages?.sebiMandatedPg}
        </span>
        <span className={styles.AcceptanceText}>
          {paymentOptionMessages?.supportTextPg}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.MainContainer}>
      {renderAccountInfo('accountInfoPGContainer')}
      <MaterialModalPopup
        isModalDrawer
        showModal={open}
        handleModalClose={() => setOpen(false)}
        className={styles.UserBankDetailsPopup}
      >
        {renderDetails()}
      </MaterialModalPopup>
    </div>
  );
}
