import Button, { ButtonType } from '../../../primitives/Button';
import Image from '../../../primitives/Image';

import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../../utils/string';
import { trackEvent } from '../../../../utils/gtm';

import styles from './ErrorCard.module.css';

type ErrorCardProps = {
  type?: 'error' | 'underVerification';
  data: Partial<{
    title: string;
    message: string;
    errorIcon: string;
  }>;
  contact?: Partial<{
    title: string;
    email: string;
    children?: React.ReactNode;
  }>;
  buttonText?: string;
  onClickButton?: () => void;
  buttonVariant?:
    | 'Primary'
    | 'Secondary'
    | 'Inverted'
    | 'Disabled'
    | 'PrimaryLight'
    | 'SecondaryLight';
  showBottomInfo?: boolean;
  showBtn?: boolean;
  icon?: string;
  extraMessage?: any;
  trackPayloadDetails?: Partial<{
    module: string;
    error_type: string;
    error_payload: any;
  }>;
  errorMessageCustomClassName?: string;
  contactTitleCustomClassName?: string;
  titleCustomClassName?: string;
};

const ErrorCard = ({
  type = 'error',
  data = {},
  contact = {},
  onClickButton,
  buttonText,
  buttonVariant = 'Primary',
  showBottomInfo = true,
  showBtn = true,
  icon = '',
  extraMessage = null,
  trackPayloadDetails = {},
  errorMessageCustomClassName = '',
  contactTitleCustomClassName = '',
  titleCustomClassName = '',
}: ErrorCardProps) => {
  const { title = '', message, errorIcon = '' } = data;
  const { title: contactTitle, email } = contact;

  const handleBtnClick = () => {
    trackEvent('error_cta_clicked', {
      ...trackPayloadDetails,
      error_heading: title,
      cta_text: buttonText,
    });

    onClickButton();
  };

  const parseErrorMessage = (message: any): string => {
    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message);
        return parsed.message || message;
      } catch (error) {
        console.error('Failed to parse error message:', error);
        return message;
      }
    }
    return message;
  };

  const displayMessage = message ? parseErrorMessage(message) : '';

  return (
    <div className={styles.failedWrap}>
      <div className={`${styles.failError} ${type}`}>
        <div className={`flex`}>
          <div className={styles.imgContainer}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}${
                icon
                  ? icon
                  : type === 'error'
                  ? 'icons/CloseRedCircleWhiteBackground.svg'
                  : 'icons/under_verification.svg'
              }`}
              alt="Failed"
              width={icon ? 20 : 40}
              height={icon ? 20 : 40}
              layout={'fixed'}
            />
          </div>
          <div className={`${styles.failContent} ${type}`}>
            {title ? (
              <span
                className={`${styles.failTitle} ${type} ${handleExtraProps(
                  titleCustomClassName
                )}`}
              >
                {title}
              </span>
            ) : (
              <span className={`${styles.failTitle}`}>
                <span>We are unable to verify your bank</span>
                <br />
                <span>details as per the information provided</span>
              </span>
            )}
            {message ? (
              <span className={`${styles.failSubTitle} ${type}`}>
                {displayMessage}
              </span>
            ) : null}

            {extraMessage ? (
              <span
                className={`${styles.failSubTitle} ${
                  styles.extraMessage
                } ${handleExtraProps(errorMessageCustomClassName)}`}
                dangerouslySetInnerHTML={{
                  __html: extraMessage,
                }}
              />
            ) : null}
            {errorIcon && (
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}${errorIcon}`}
                alt="error_icon"
                width={250}
                height={150}
                layout={'fixed'}
              />
            )}
          </div>
        </div>
        {showBtn && buttonText ? (
          <Button
            className={styles.failButton}
            width={'100%'}
            onClick={handleBtnClick}
            variant={ButtonType[buttonVariant]}
          >
            {buttonText}
          </Button>
        ) : null}
      </div>
      {showBottomInfo ? (
        <div className={`flex-column ${styles.ContactUsContainer}`}>
          <span
            className={`${styles.ContactTitle} ${handleExtraProps(
              contactTitleCustomClassName
            )}`}
          >
            {contactTitle}
          </span>
          {email ? (
            <span className={styles.ContactUs}>
              {`Contact us at`} <a href={`mailto:${email}`}>{email}</a>
            </span>
          ) : null}
          {contact?.children ?? null}
        </div>
      ) : null}
    </div>
  );
};

export default ErrorCard;
