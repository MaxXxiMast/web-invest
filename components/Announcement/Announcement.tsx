// NODE MODULES
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

// Common Components
import MaterialModalPopup from '../primitives/MaterialModalPopup';
import Image from '../primitives/Image';
import Button, { ButtonType } from '../primitives/Button';

// Utils
import {
  AnnouncementChangePoints,
  AnnouncementNonChangePoints,
  AnnouncementPoints,
} from '../../utils/kyc';
import { trackEvent } from '../../utils/gtm';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

// Styles
import classes from './Announcement.module.css';

interface AnnouncementModalProps {
  showAnnouncementModal?: boolean;
  setShowAnnouncementModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

const renderChangesOnMe = (props) => {
  return (
    <div className={classes.Modal}>
      <p className={classes.Title}>What changes for me?</p>
      <div>
        <div className="items-align-center-row-wise">
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/GreenCheckCircle.svg`}
            alt="Tick"
            width={24}
            height={24}
            layout={'fixed'}
          />
          <p className={classes.PointsHeader}> What has changed</p>
        </div>
        <ul className={classes.CirclePoints}>
          {AnnouncementChangePoints.map((item) => {
            return (
              <li key={item.id}>
                <p> {item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <p className={classes.HorizontalLine}></p>

      <div>
        <div className="items-align-center-row-wise">
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/GrayCloseCircle.svg`}
            alt="Close"
            width={24}
            height={24}
            layout={'fixed'}
          />
          <p className={classes.PointsHeader}> What has NOT changed</p>
        </div>
        <ul className={classes.CirclePoints}>
          {AnnouncementNonChangePoints.map((item) => {
            return (
              <li key={item.id}>
                <p> {item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        width={'100%'}
        variant={ButtonType.Primary}
        className={classes.Kycbtn}
        onClick={() => props?.proceedToReKYC?.()}
      >
        Proceed to Re-KYC
      </Button>
    </div>
  );
};

const renderAnnouncement = (props) => {
  return (
    <div className={classes.Modal}>
      <div className="items-align-center-row-wise">
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/AnnouncementSpeaker.svg`}
          alt="InfoIcon"
          width={12}
          height={12}
          layout={'fixed'}
        />
        <p className={classes.Header}>Announcement</p>
      </div>
      <p className={classes.Title}>
        Investments on Grip are now at lower ticket sizes with smoother and more
        secure payments
      </p>
      <div className={`items-align-center-row-wise ${classes.FlagContainer}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/TwoWeatherStars.svg`}
          alt="InfoIcon"
          width={14}
          height={14}
          layout={'fixed'}
        />
        <p className={classes.Flag}>What’s New?</p>
      </div>
      <ul className={classes.BulletPoints}>
        {AnnouncementPoints.map((item) => {
          return (
            <li key={item.id} className={`items-align-center-row-wise`}>
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}${item.icon}`}
                alt={item?.lable}
                width={24}
                height={24}
                layout={'fixed'}
              />
              <p>
                <strong>{item?.lable}</strong>: {item?.text}
              </p>
            </li>
          );
        })}
      </ul>
      <p className={classes.Line}></p>
      <p className={classes.Disclaimer}>
        These features are being enabled per updated SEBI OBPP guidelines. The
        same guidelines also make it mandatory for all existing users to
        complete a few additional KYC steps before making new investments. We
        promise to make this as smooth as possible
        <br />
        <br />
        Your returns on investments made before 4th Oct 2023 will remain
        unaffected
      </p>
      <div className={classes.Footer}>
        <Button
          width={'100%'}
          variant={ButtonType.Secondary}
          onClick={() => props?.handleChangesModal?.()}
        >
          What changes for me?
        </Button>
        <Button
          width={'100%'}
          variant={ButtonType.Primary}
          onClick={() => props?.proceedToReKYC?.()}
        >
          Proceed to Re-KYC
        </Button>
      </div>
    </div>
  );
};

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  showAnnouncementModal = false,
  setShowAnnouncementModal,
}) => {
  const [showChangesOnMe, setShowChangesOnMe] = useState(false);
  const router = useRouter();

  // GET UserID
  const { userID = '' } = useSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );

  useEffect(() => {
    if (showChangesOnMe) {
      trackEvent('pre_kyc_invested_user_popup', {
        page: router.pathname,
        userID: userID,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModal = () => {
    setShowAnnouncementModal(false);
    setShowChangesOnMe(false);
  };

  const handleChangesModal = () => {
    setShowChangesOnMe(true);
  };

  const proceedToReKYC = () => {
    handleModal();
    trackEvent('kyc_redirect', {
      page: 'announcement_popup',
      userID: userID,
    });

    router.push('/user-kyc');
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={showAnnouncementModal}
      handleModalClose={handleModal}
      drawerExtraClass={classes.PopupDrawer}
      className={classes.AnnouncementModal}
    >
      {showChangesOnMe
        ? renderChangesOnMe({ proceedToReKYC })
        : renderAnnouncement({ handleChangesModal, proceedToReKYC })}
    </MaterialModalPopup>
  );
};

export { AnnouncementModal as Announcement };
