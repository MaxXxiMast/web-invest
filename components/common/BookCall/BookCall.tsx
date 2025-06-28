import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// components
import Image from '../../primitives/Image';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import {
  importCalendlyScript,
  removeCalendlyScript,
} from '../../../utils/ThirdParty/calendly';
import { trackEvent } from '../../../utils/gtm';

// api
import { fetchLeadOwnerDetails } from '../../../api/user';

// styles
import styles from './BookCall.module.css';

type Props = {
  userData: any;
  light: boolean;
  className?: string;
  header?: string;
};

const IconButton = ({
  isWhatsapp = false,
  light,
  onWhatsappClick,
  loadCalendlyAndBookMeeting,
}) => {
  const mainText = isWhatsapp ? 'Start a Chat' : 'Book a Call';
  const icon = isWhatsapp ? 'whatsapp.svg' : 'BookACall.svg';
  return (
    <div
      className={`${styles.BookACallButton} ${
        isWhatsapp ? 'whatsapp' : 'bookACall'
      } ${light ? styles.extraPadding : ''}`}
      onClick={isWhatsapp ? onWhatsappClick : loadCalendlyAndBookMeeting}
    >
      <Image
        width={16}
        height={16}
        layout={'fixed'}
        src={`${GRIP_INVEST_BUCKET_URL}discovery/${icon}`}
        alt={'book-a-call'}
      />
      <div>{mainText}</div>
    </div>
  );
};

const getRMDetails = ({ light, leadOwnerDetails }) => (
  <div
    className={`flex items-center ${
      light ? styles.RMDetailsContainerLight : styles.RMDetailsContainer
    }`}
  >
    {leadOwnerDetails?.imageUrl ? (
      <Image
        className={styles.RMImage}
        width={63}
        height={63}
        layout={'fixed'}
        alt={'relationshipManagerImage'}
        src={leadOwnerDetails?.imageUrl}
      />
    ) : null}
    <div className={styles.RMDetails}>
      <div className={styles.RMName}>
        {`${leadOwnerDetails?.firstName} ${leadOwnerDetails?.lastName}`}
      </div>
      <div className={styles.RMDesignation}>Relationship Manager, Grip</div>
    </div>
  </div>
);

const BookCall = (props: Props) => {
  const router = useRouter();
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const bookaCallHeading = 'Need help with anything Grip?';
  const bookACallText =
    'Your dedicated Relationship Manager is just a message away.';

  const [isLoading, setIsLoading] = useState(true);

  const [leadOwnerDetails, setLeadOwnerDetails] = useState({
    calendlyLink: '',
    imageUrl: '',
    firstName: '',
    lastName: '',
    mobileNo: '',
  });

  useEffect(() => {
    fetchLeadOwnerDetails('firstName,lastName,calendlyLink,mobileNo,imageUrl')
      .then((res) => {
        setLeadOwnerDetails(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log('error', err);
      });
    return () => {
      removeCalendlyScript();
    };
  }, []);

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

  const onBookWM = () => {
    const { firstName, lastName, emailID, userID } = props.userData;
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
      window?.['Calendly'] &&
        window?.['Calendly'].initPopupWidget({
          url,
          prefill,
        });
    }
  };

  const onWhatsappClick = () => {
    const { mobileNo } = leadOwnerDetails;
    let url = `https://api.whatsapp.com/send?phone=91${Number(mobileNo)}`;
    // TODO: Check if we need event
    // trackEvent('Reach Us', { type: 'whatsapp' });
    window.open(url, '_blank', 'noopener');
  };

  if (isLoading) return <CustomSkeleton className={styles.skeleton} />;

  return (
    <div
      className={`${handleExtraProps(props.className)} ${
        props.light ? styles.CallCardContainerLight : styles.CallCardContainer
      }`}
    >
      {props.light ? (
        <p className={styles.CardHeaderTextLight}>
          {props?.header
            ? props?.header
            : 'We are happy to assist you with your queries and concerns'}
        </p>
      ) : (
        <>
          <div className={styles.CardHeaderText}>{bookaCallHeading}</div>
          <div className={styles.CardSubHeaderText}>{bookACallText}</div>
        </>
      )}
      {getRMDetails({ light: props.light, leadOwnerDetails })}
      <div className={styles.BookCallDetailsContainer}>
        {IconButton({
          isWhatsapp: false,
          light: props.light,
          onWhatsappClick,
          loadCalendlyAndBookMeeting,
        })}
        {IconButton({
          isWhatsapp: true,
          light: props.light,
          onWhatsappClick,
          loadCalendlyAndBookMeeting,
        })}
      </div>
    </div>
  );
};

export default BookCall;
