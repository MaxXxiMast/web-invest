import ReferNowBannerCard from './ReferNowBannerCard';

//Utils
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL_WITHOUT_INNER } from '../../utils/string';
import { isGCOrder } from '../../utils/gripConnect';

//Styles
import styles from '../../styles/Referral/BannerSection.module.css';

type Props = {
  data?: any;
};

// Standalone Components
const HeaderText = () => (
  <h1>
    Refer & <span className={styles.NewPrice}>Earn</span>
  </h1>
);

const SubHeaderText = () => {
  const isGC = isGCOrder();
  return (
    <p className={styles.SubHeader}>
      {isGC
        ? 'Share the secret to secure, fixed-income returns with your friends.'
        : 'Enjoying Grip? Now share the secret to high-yield, fixed returns with friends'}
    </p>
  );
};

const SubHeaderPoints = () => (
  <ul className={`${styles.BulletPoints}`}>
    <li className={` ${styles.SubHeader}`}>
      Earn 100% of the brokerage amount on their investments
    </li>
    <li className={`${styles.SubHeader}`}>
      Not just once, but earn on every investment made in the first 6 months{' '}
    </li>
  </ul>
);

const BannerSection = ({ data }: Props) => {
  const {
    backgroundUrl = `${GRIP_INVEST_GI_STRAPI_BUCKET_URL_WITHOUT_INNER}BannerBg.svg`,
  } = data || {};

  return (
    <div
      className={`${styles.BannerSectionMain} ${styles.ReferEarnBanner}`}
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundColor: '#fff',
        backgroundSize: 'cover',
        backgroundPosition: 'bottom center',
      }}
    >
      <div className={`${styles.containerNew}`}>
        <div className={`${styles.BannerSection} flex`}>
          <div className={`${styles.BannerLeft}`}>
            <HeaderText />
            <SubHeaderText />
            <SubHeaderPoints />
          </div>

          <div className={`${styles.BannerRight}`} id="ReferralInputBox">
            <ReferNowBannerCard
              data={{
                user: data?.user,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerSection;
