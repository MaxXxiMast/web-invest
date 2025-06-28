// NODE MODULE
import { useRouter } from 'next/router';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';
import { getOverallDefaultKycStatus } from '../../../utils/discovery';
import { useAppSelector } from '../../../redux/slices/hooks';

// Components
import Button from '../../primitives/Button';
import Image from '../../primitives/Image';

// Styles
import classes from './ErrorStateHorizontal.module.css';

type Props = {
  showBtn?: boolean;
};

const ErrorStateHorizontal = ({ showBtn }: Props) => {
  const router = useRouter();
  const { default: userKycData = {} } = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );
  // GET UserID
  const userID = useAppSelector((state) => state?.user?.userData?.userID) || '';
  const kycConfigStatus =
    useAppSelector((state) => state?.user?.kycConfigStatus) || {};

  const handleBtnClick = () => {
    trackEvent('kyc_redirect', {
      page: 'profile',
      userID: userID,
      activeTab: 'nokyc',
    });
    router.push('/user-kyc');
  };

  const kycProfileKYCCheck = [
    'pan',
    'address',
    'bank',
    'depository',
    'other',
    'nominee',
  ];

  const showPromptCheckKYC = userKycData?.kycTypes?.filter((data) =>
    kycProfileKYCCheck?.includes(data?.name)
  );

  const kycStatus = getOverallDefaultKycStatus({
    default: {
      isFilteredKYCComplete: kycConfigStatus?.default?.isFilteredKYCComplete,
      kycTypes: showPromptCheckKYC,
    },
  });

  if (kycStatus === 'pending verification' || kycStatus === 'verified') {
    return null;
  }

  return (
    <div className={`flex-column ${classes.Wrapper}`}>
      <div className={classes.Icon}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/KycPendingProfile.svg`}
          alt="KYC Pending"
          width={72}
          height={72}
          layout="fixed"
        />
      </div>
      <div className={`flex-column ${classes.Content}`}>
        <h3>Please complete your KYC</h3>
        <h4>It will take just 60 seconds!</h4>
      </div>
      {showBtn && (
        <div className={classes.Button}>
          <Button width={146} onClick={handleBtnClick}>
            Let’s Do That
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorStateHorizontal;
