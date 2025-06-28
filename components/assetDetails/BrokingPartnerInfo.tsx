import React from 'react';

import Image from '../primitives/Image';
import MaterialModalPopup from '../primitives/MaterialModalPopup';

const styles = require('../../styles/BrokingPartnerInfo.module.css');

type Props = {
  logo: string;
  showConsent?: boolean;
  showLogo?: boolean;
};

const BrokingPartnerInfo = ({
  logo = '',
  showConsent = true,
  showLogo = true,
}: Props) => {
  const [showPersonalInfoModal, setShowPersonalInfoModal] =
    React.useState(false);

  /**
   * Personal Info modal click handlers
   */
  // const onPersonalInfoClick = () => setShowPersonalInfoModal(true);
  const closePersonalInfoModal = () => setShowPersonalInfoModal(false);

  // const renderConsentInformation = () => {
  //   return showConsent ? (
  //     <Text className={styles.BrokingPartnerInfoDisclaimerText}>
  //       {'By continuing, I consent to sharing my '}
  //       <span
  //         onClick={onPersonalInfoClick}
  //         className={styles.BrokingPartnerInfoDisclaimerLink}
  //       >
  //         Personal Information
  //       </span>
  //     </Text>
  //   ) : null;
  // };

  /**
   * Personal Info modal render
   */
  return (
    <div
      className={`flex ${styles.BrokingPartnerInfoContainer} ${
        !showConsent ? styles.WithoutConsent : ''
      }`}
    >
      {/* {renderConsentInformation()} */}
      {showLogo ? (
        <div className={`flex ${styles.BrokingPartnerInfo}`}>
          <div className={styles.BrokingPartnerInfoText}>
            Registered Broking Partner
          </div>
          <Image
            src={logo}
            alt={'GRIP broking logo'}
            layout={'fixed'}
            width={72}
            height={25}
          />
        </div>
      ) : null}
      {showConsent ? (
        <MaterialModalPopup
          showModal={showPersonalInfoModal}
          className={styles.ConsentSharingModal}
          handleModalClose={closePersonalInfoModal}
        >
          <div className={styles.ConsentHeader}>
            Information Sharing Consent
          </div>
          <div className={styles.ConsentDescription}>
            I understand that this order is being executed through Grip Broking
            Private Limited, a registered broker. I hereby give my consent for
            sharing of the following details between Grip Broking and Grip
            Invest
          </div>
          <ul className={styles.ConsentList}>
            <li>KYC Information</li>
            <li>Order Information</li>
            <li>Payment Information</li>
          </ul>
        </MaterialModalPopup>
      ) : null}
    </div>
  );
};

export default BrokingPartnerInfo;
