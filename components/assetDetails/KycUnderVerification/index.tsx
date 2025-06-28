import Image from '../../primitives/Image';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import classes from './KycUnderVerification.module.css';

function KYCUnderVerificationSideBar() {
  return (
    <div className={`items-align-center-row-wise ${classes.mainContainer}`}>
      <div>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}dealsV2/kyc_under_verification.svg`}
          width={24}
          height={24}
          layout="fixed"
          alt='kyc under verification image'
        />
      </div>
      <div className={classes.text}>
        Your KYC is under verification, you will be able to invest in this deal
        as it gets verified.
      </div>
    </div>
  );
}

export default KYCUnderVerificationSideBar;
