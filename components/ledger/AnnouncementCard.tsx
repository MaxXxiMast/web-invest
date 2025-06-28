import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import Image from '../primitives/Image';
import styles from '../../styles/Ledger/Announcement.module.css';
import Button, { ButtonType } from '../primitives/Button';
type AnnouncementProps = {
  heading: string;
  subHeading: string;
  buttonName: string;
  onButtonClick: () => void;
  isWideCard?: boolean;
};
export const AnnouncementCard = (props: AnnouncementProps) => {
  const { heading, subHeading, buttonName, onButtonClick, isWideCard } = props;
  return (
    <>
      <div className={styles.announcementContainer}>
        <div className={isWideCard ? 'flex_wrapper' : ''}>
          <div className={styles.contentWrapper}>
            <div className={styles.heading}>
              {' '}
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}ledger/announcement.svg`}
                alt="announcement"
                layout={'fixed'}
                width={9}
                height={9}
                className={styles.announcementImage}
              />{' '}
              Announcement
            </div>
            <div className={styles.header}>{heading}</div>
            <div className={styles.subHeading}>{subHeading}</div>
          </div>
          <Button
            className={styles.button}
            variant={ButtonType.Secondary}
            onClick={onButtonClick}
          >
            {buttonName}
          </Button>
        </div>
      </div>
    </>
  );
};
