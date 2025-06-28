import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// components
import Image from '../../primitives/Image';
import Button, { ButtonType } from '../../primitives/Button';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// redux
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { setLeadOwner } from '../../../redux/slices/portfoliosummary';

// api
import { fetchLeadOwnerDetails } from '../../../api/user';

// utils
import { trackEvent } from '../../../utils/gtm';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { wealthDetails } from '../../user-profile/utils/wealth';
import { copy } from '../../../utils/customHooks/useCopyToClipBoard';
import {
  importCalendlyScript,
  removeCalendlyScript,
} from '../../../utils/ThirdParty/calendly';

// styles
import styles from './RMCard.module.css';

const IconButton = ({ isWhatsapp = false, onWhatsappClick, setRotate }) => {
  const mainText = isWhatsapp ? 'Start a Chat' : 'Contact Details';
  return (
    <div
      className={`${styles.BookACallButton} ${
        isWhatsapp ? 'whatsapp' : 'bookACall'
      }`}
      onClick={isWhatsapp ? onWhatsappClick : () => setRotate(true)}
    >
      <span
        className={`${isWhatsapp ? 'icon-whatsapp' : 'icon-caret-right'} ${
          styles.RMCardIcon
        }`}
      />
      <div>{mainText}</div>
    </div>
  );
};

const rmDetails = ({ leadOwnerDetails }) => (
  <div className={`flex ${styles.rmDetailsContainer}`}>
    <Image
      layout={'intrinsic'}
      src={leadOwnerDetails?.imageUrl ?? ``}
      alt="rm-profile-pic"
      className={styles.rmProfilePic}
    />
    <div className={styles.rmDetails}>
      <p className={styles.name}>
        {`${leadOwnerDetails?.firstName} ${leadOwnerDetails?.lastName}`}
      </p>
      <p className={styles.designation}>
        {leadOwnerDetails?.designation ?? 'Relationship Manager'}
      </p>
      {leadOwnerDetails?.yoe ? (
        <p className={styles.exp}>{leadOwnerDetails?.yoe}+ Years Experience</p>
      ) : null}
      {leadOwnerDetails?.investments ? (
        <p className={styles.exp}>
          {leadOwnerDetails?.investments}+ Investments Enabled
        </p>
      ) : null}
    </div>
  </div>
);

const renderContactOptions = ({
  contactOptions,
}: {
  contactOptions: {
    icon: string;
    label: string;
    action: () => void;
    actionType: string;
  }[];
}) =>
  contactOptions.map((option) => (
    <div
      key={`action-${option?.label}`}
      className={`flex items-center justify-between ${styles.contactOption}`}
      onClick={option.action}
    >
      <div className="flex items-center">
        <Image
          width={30}
          height={30}
          layout={'intrinsic'}
          src={`${GRIP_INVEST_BUCKET_URL}icons/${option.icon}`}
          alt={option.label}
        />
        <span className={styles.contactOptionLabel}>{option.label}</span>
      </div>
      <Image
        width={20}
        height={20}
        layout={'intrinsic'}
        src={`${GRIP_INVEST_BUCKET_URL}icons/${
          option.actionType === 'copy' ? 'copy-2' : 'chevron-right'
        }.svg`}
        alt={'chevron-right'}
      />
    </div>
  ));

const flipCard = ({
  rotate,
  leadOwnerDetails,
  onWhatsappClick,
  setRotate,
  contactOptions,
}) => (
  <div className={styles.flipCard}>
    <div className={`${styles.flipCardInner} ${rotate ? styles.rotate : ''}`}>
      <div className={`${styles.flipCardFront} flex-column justify-between`}>
        <div>
          <p className={styles.heading}>YOUR RELATIONSHIP MANAGER</p>
          {rmDetails({ leadOwnerDetails })}
        </div>
        <div>
          {IconButton({ isWhatsapp: true, onWhatsappClick, setRotate })}
          {IconButton({ isWhatsapp: false, onWhatsappClick, setRotate })}
        </div>
      </div>
      <div className={`${styles.flipCardBack} flex-column`}>
        <div className="flex items-center justify-between">
          <p className={styles.heading}>YOUR RELATIONSHIP MANAGER</p>
          <Image
            width={20}
            height={20}
            layout={'intrinsic'}
            src={`${GRIP_INVEST_BUCKET_URL}icons/cross-grey-bg.svg`}
            alt={'close'}
            onClick={() => setRotate(false)}
            className={styles.closeIcon}
          />
        </div>
        <div className={`flex-column justify-between ${styles.backBody}`}>
          <div className={styles.contactOptionsContainer}>
            {renderContactOptions({ contactOptions })}
          </div>
          <Button
            className="flex_wrapper"
            onClick={() => setRotate(false)}
            variant={ButtonType.Secondary}
            width={'100%'}
          >
            <Image
              width={20}
              height={20}
              layout={'intrinsic'}
              src={`${GRIP_INVEST_BUCKET_URL}icons/chevron-right.svg`}
              alt={'back-arrow'}
              className={styles.backArrow}
            />
            <span>Back</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const renderProfileView = ({
  leadOwnerDetails,
  contactOptions,
  onWhatsappClick,
  setRotate,
}) => (
  <div>
    <p className={styles.heading}>YOUR RELATIONSHIP MANAGER</p>
    <div className={`flex ${styles.profileView}`}>
      <div className={styles.rmDetailsProfile}>
        {rmDetails({ leadOwnerDetails })}
      </div>
      <div className={styles.contactDetailsProfile}>
        {renderContactOptions({ contactOptions })}
      </div>
    </div>
    <div className={styles.whatsappButtonContainerProfile}>
      {IconButton({ isWhatsapp: true, onWhatsappClick, setRotate })}
    </div>
    <div className={styles.noteWrap}>
      <span className={`${styles.subTitle} ${styles.subStyle}`}>Note:</span>
      <span className={`${styles.subTitle}`}>
        {wealthDetails.wealthNoteText}
      </span>
    </div>
  </div>
);

const RMCard = ({ isProfile = false }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [rotate, setRotate] = useState(false);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const { leadOwner: leadOwnerDetails } = useAppSelector(
    (state) => state?.portfolioSummary
  );

  const [isLoading, setIsLoading] = useState(true);

  const userData = useAppSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );

  const { NSE: uccStatus = {} } = useAppSelector(
    (state) => state.user?.uccStatus
  );

  const loadCalendlyAndBookMeeting = () => {
    if (!calendlyLoaded) {
      importCalendlyScript()
        .then(() => {
          setCalendlyLoaded(true);
          onBookWM(); // Open the widget after the script is loaded
        })
        .catch((error) => {
          console.error('Failed to load Calendly script:', error);
        });
    } else {
      onBookWM();
    }
  };

  const getLeadOwner = async () => {
    try {
      if (!leadOwnerDetails) {
        const res = await fetchLeadOwnerDetails(
          'firstName,lastName,calendlyLink,mobileNo,email,imageUrl,designation,yoe,investments'
        );
        dispatch(setLeadOwner(res));
      }
    } catch (err) {
      console.log('error', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getLeadOwner();

    return () => {
      removeCalendlyScript();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBookWM = () => {
    const { firstName, lastName, emailID, userID } = userData;
    const prefill = {
      name: `${firstName} ${lastName}`,
      firstName: firstName,
      lastName: lastName,
      email: emailID,
    };
    const url = `${leadOwnerDetails.calendlyLink}?utm_campaign=profile&utm_source=${userID}`;

    trackEvent('Click_book_a_call', {
      url: router.pathname,
    });
    if (window?.['Calendly']) {
      window?.['Calendly'].initPopupWidget({
        url,
        prefill,
      });
    }
  };

  const onWhatsappClick = () => {
    const { mobileNo } = leadOwnerDetails;
    let url = `https://api.whatsapp.com/send?phone=91${Number(mobileNo)}`;
    window.open(url, '_blank', 'noopener');
  };

  const contactOptions =
    uccStatus.status === 'active'
      ? [
          {
            icon: 'video-call.svg',
            label: 'Schedule a Call',
            action: loadCalendlyAndBookMeeting,
            actionType: 'custom',
          },
          {
            icon: 'mail.svg',
            label: leadOwnerDetails?.email ?? '',
            action: () =>
              copy(leadOwnerDetails?.email ?? '', 'Copied to clipboard!'),
            actionType: 'copy',
          },
          {
            icon: 'phone-call.svg',
            label: leadOwnerDetails?.mobileNo ?? '',
            action: () =>
              copy(leadOwnerDetails?.mobileNo ?? '', 'Copied to clipboard!'),
            actionType: 'copy',
          },
        ]
      : [
          {
            icon: 'video-call.svg',
            label: 'Schedule a Call',
            action: loadCalendlyAndBookMeeting,
            actionType: 'custom',
          },
        ];

  if (isLoading) return <CustomSkeleton className={styles.skeleton} />;

  return isProfile
    ? renderProfileView({
        leadOwnerDetails,
        contactOptions,
        onWhatsappClick,
        setRotate,
      })
    : flipCard({
        rotate,
        leadOwnerDetails,
        onWhatsappClick,
        setRotate,
        contactOptions,
      });
};

export default RMCard;
