// NODE MODULES
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

// Common Components
import Image from '../../primitives/Image';

// Contexts
import { ProfileContext } from '../../ProfileContext/ProfileContext';

// Redux Slice
import { RootState } from '../../../redux';

// UTILS
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import {
  getDiscoveryKycStatus,
  getOverallDefaultKycSteps,
} from '../../../utils/discovery';
import { trackEvent } from '../../../utils/gtm';

// Styles
import styles from './CompleteKYCNudge.module.css';

export default function CompleteKYCNudge() {
  const router = useRouter();
  const { userKycData } = useContext(ProfileContext) as any;
  const { userData, kycDetails = {} } = useSelector(
    (state: RootState) => state.user
  );

  const rfqKYCSteps = getOverallDefaultKycSteps({
    default: { kycTypes: userKycData },
  });

  const isRFQKYCComplete = rfqKYCSteps.completed === rfqKYCSteps.total;

  const handleOnClick = () => {
    trackEvent('kyc_redirect', {
      page: 'profile',
      userID: userData?.userID,
      activeTab: 'complete_kyc_nudge',
    });
    router.push('/user-kyc');
  };

  // When RFQ KYC is complete
  if (isRFQKYCComplete) return null;

  const isOldKYCComplete =
    getDiscoveryKycStatus(userData, kycDetails) === 'verified';

  const cta = isOldKYCComplete ? 'Re-KYC' : 'KYC';

  return (
    <div
      className={`items-align-center-row-wise ${styles.CompleteKYC}`}
      onClick={handleOnClick}
    >
      <div
        className={`items-align-center-row-wise ${styles.CompleteKYCDetails}`}
      >
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/check_kyc.svg`}
          width={44}
          height={44}
          alt="CompleteKYCIcon"
          layout="fixed"
        />
        <span>{`Complete your ${cta}`}</span>
      </div>
      <span className={`icon-caret-down ${styles.CaretRight}`}/>
    </div>
  );
}
