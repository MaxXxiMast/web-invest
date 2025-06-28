// NODE MODULES
import { useContext, useState } from 'react';
import dynamic from 'next/dynamic';

// Utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
  maskString,
} from '../../../utils/string';
import { isGCOrder } from '../../../utils/gripConnect';

// Components
import ProfileImage from '../../primitives/Navigation/ProfileImage';
import Image from '../../primitives/Image';
import PoweredByGrip from '../../primitives/PoweredByGrip';

// Contexts
import { InvestmentOverviewPGContext } from '../../../contexts/investmentOverviewPg';

// Styles
import styles from './PGHeader.module.css';

type PGHeaderProps = {
  className?: string;
  onClickBack: () => void;
};

// Dynamic imports for popup
const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

export default function PGHeader({ className, onClickBack }: PGHeaderProps) {
  const [showModal, setShowModal] = useState(false);
  const { userKycDetails }: any = useContext(InvestmentOverviewPGContext);

  const userName = userKycDetails?.bank?.accountName,
    dematNo = maskString(
      `${userKycDetails?.depository?.dpID}${userKycDetails?.depository?.clientID}`
    ),
    panNo = maskString(userKycDetails?.pan?.panNumber);

  const renderDetail = (label = '', icon = '') => {
    return (
      <div
        className={`items-align-center-row-wise ${styles.AccountInfoContent}`}
      >
        {icon ? (
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}${icon}`}
            width={16}
            height={16}
            layout="fixed"
            alt="Icon"
          />
        ) : null}
        <div className={styles.AccountInfoText}>{label}</div>
      </div>
    );
  };

  const renderAccountInfo = () => {
    return (
      <div
        className={`items-align-center-row-wise ${styles.AccountInfo}`}
        onClick={() => setShowModal(true)}
      >
        <ProfileImage size={16} />
        <span id="accountInfoText">Account Info</span>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}homev3/ArrowRight.svg`}
          width={16}
          height={16}
          layout="fixed"
          className={styles.Arrow}
          alt={'Arrow'}
        />
      </div>
    );
  };

  return (
    <>
      <div
        className={`flex ${styles.Container} ${handleExtraProps(className)}`}
      >
        <div className={`items-align-center-row-wise ${styles.Header}`}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}commons/BackArrow.svg`}
            width={15}
            height={15}
            layout="fixed"
            alt="Back Arrow"
            onClick={onClickBack}
          />
          <span>Checkout</span>
        </div>
        {isGCOrder() ? <PoweredByGrip /> : renderAccountInfo()}
      </div>
      <MaterialModalPopup
        isModalDrawer
        showModal={showModal}
        handleModalClose={() => setShowModal(false)}
      >
        <div className={styles.AccountInfoTitle}>Account Info</div>
        <div
          className={`items-align-center-row-wise ${styles.ProfileContainer}`}
        >
          <ProfileImage size={25} />
          <div className={styles.AccountInfoText}>
            <span>{userName || ''}</span>
          </div>
        </div>
        {renderDetail(`PAN${panNo}`, 'icons/pan.svg')}
        {renderDetail(`DEMAT${dematNo}`, `icons/bag.svg`)}
      </MaterialModalPopup>
    </>
  );
}
