// NODE MODULES
import { useEffect, useState } from 'react';

// Components
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';

// Utils
import {
  importCalendlyScript,
  removeCalendlyScript,
} from '../../../utils/ThirdParty/calendly';
import { trackEvent } from '../../../utils/gtm';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';

// Redux Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

// API
import { fetchLeadOwnerDetails } from '../../../api/user';

// Styles
import styles from './ContactAssetDetail.module.css';

type Props = {
  data?: any;
  className?: string;
  source: string;
  campaignName: string;
};
declare const window: any;

const ContactAssetDetail = (props: Props) => {
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const user = useAppSelector((state) => state.user?.userData);
  const [leadOwnerDetails, setLeadOwnerDetails] = useState({
    calendlyLink: '',
  });
  useEffect(() => {
    fetchLeadOwnerDetails('calendlyLink')
      .then((res) => {
        setLeadOwnerDetails(res);
      })
      .catch((err) => {
        console.log('error', err);
      });
    return () => {
      removeCalendlyScript();
    };
  }, []);

  const handleEmail = () => {
    const communicationType = 'Email';
    const url = `mailto:invest@gripinvest.in`;

    trackEvent('Reach Us', { type: communicationType });
    window.open(url, '_blank', 'noopener');
  };

  const loadCalendlyAndBookMeeting = () => {
    if (!calendlyLoaded) {
      importCalendlyScript()
        .then(() => {
          setCalendlyLoaded(true);
          bookMeeting(); // Open the widget after the script is loaded
        })
        .catch((error) => {
          console.error('Failed to load Calendly script:', error);
        });
    } else {
      bookMeeting();
    }
  };

  const bookMeeting = () => {
    const { firstName, lastName, emailID } = user;
    const prefill = {
      name: `${firstName} ${lastName}`,
      firstName: firstName,
      lastName: lastName,
      email: emailID,
    };
    let url = leadOwnerDetails.calendlyLink;
    if (props.campaignName && props.source) {
      url = `${leadOwnerDetails.calendlyLink}?utm_campaign=${props?.campaignName}&utm_source=${props?.source}`;
    }

    trackEvent('Book a Meeting');
    window.Calendly &&
      window.Calendly.initPopupWidget({
        url,
        prefill,
      });
  };

  return (
    <div
      className={`items-align-center-row-wise ${
        styles.ContactAssetDetail
      } ${handleExtraProps(props.className)}`}
    >
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}icons/ContactQNA.svg`}
        alt="ContactImage"
        width={80}
        height={80}
        layout="fixed"
      />
      <div className={`flex-column ${styles.ContactRight}`}>
        <h3>Could not find what you were looking for?</h3>
        <div className={`flex ${styles.ButtonContainer}`}>
          <Button className={styles.RightBtn} onClick={handleEmail}>
            Email Us
          </Button>
          <Button
            variant={ButtonType.Inverted}
            onClick={loadCalendlyAndBookMeeting}
            className={styles.RightBtn}
          >
            Schedule a Call
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactAssetDetail;
