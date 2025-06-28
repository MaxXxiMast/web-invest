import React, { useContext, useState } from 'react';

// components
import InputFieldSet from '../../../common/inputFieldSet';

// context
import { GlobalContext } from '../../../../pages/_app';

// UTILS
import { trackEvent } from '../../../../utils/gtm';

// styles
import styles from './ReferralInput.module.css';

const ReferralInput = ({ reporting, disableReferral, updateReporting }) => {
  const { experimentsData = false }: any = useContext(GlobalContext);
  const [showReferralCode, setShowReferralCode] = useState(false);

  const handleReferralCode = () => {
    trackEvent('have_referral_code', {});
    setShowReferralCode(true);
  };

  if (!experimentsData?.showReferral) {
    return null;
  }
  return (
    <>
      {!showReferralCode && !reporting ? (
        <div className={styles.Referral}>
          Have a referral code?{' '}
          <span onClick={handleReferralCode}>Click here</span>
        </div>
      ) : (
        <div className={styles.referralDiv}>
          <InputFieldSet
            placeHolder="Referral Code (Optional)"
            label="Referral Code (Optional)"
            width={'100%'}
            type="text"
            disabled={disableReferral}
            onChange={updateReporting}
            value={reporting}
            className={'CompactInput'}
          />
        </div>
      )}
    </>
  );
};

export default ReferralInput;
