import { trackEvent } from '../../utils/gtm';
import { getStrapiMediaS3Url } from '../../utils/media';
import { handleStringLimit } from '../../utils/string';
import { TestimonialCard } from './types';
import Image from '../primitives/Image';
import styles from './TestimonialCard.module.css';

type Props = {
  item: TestimonialCard;
};

const TestimonialCardComponent = ({ item }: Props) => {
  const profileImage = getStrapiMediaS3Url(item?.profileImage),
    name = item?.name,
    subTitle = item?.subTitle,
    socialMediaImage = getStrapiMediaS3Url(item?.socialMediaImage),
    content = item?.content,
    footerText = item?.footerText,
    socialMediaLink = item?.socialMediaUrl;

  const redirectToSocialMedia = () => {
    trackEvent('view_wall_of_trust', {
      url_clicked: socialMediaLink,
      testimonie_name: name,
    });
    if (socialMediaLink) {
      window.open(socialMediaLink, '_blank');
    }
  };
  return (
    <div className={styles.TestimonialCard} onClick={redirectToSocialMedia}>
      <div className="flex">
        <div className="flex">
          <div className={styles.ProfileImage}>
            <Image
              src={profileImage}
              alt={name}
              width={46}
              height={46}
              layout="fixed"
            />
          </div>
          <div className={styles.ProfileDetails}>
            <h4>{name}</h4>
            <h5>{subTitle}</h5>
          </div>
        </div>
        <div className={styles.CardSocial}>
          <Image
            src={socialMediaImage}
            alt="Social media"
            width={16}
            height={16}
            layout="fixed"
          />
        </div>
      </div>
      <div className={styles.TestimonialCardBody}>
        <p>{handleStringLimit(content || '', 64)}</p>
      </div>
      <div className={styles.TestimonialCardFooter}>
        <p>{footerText}</p>
      </div>
    </div>
  );
};

export default TestimonialCardComponent;
