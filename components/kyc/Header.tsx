import desktopStyles from '../../styles/ProfileKYC.module.css';
import Image from '../primitives/Image';
import mobileStyles from '../../styles/ProfileKYCMobile.module.css';
import { getObjectClassNames } from '../utils/designUtils';

import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { mediaQueries } from '../utils/designSystem';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

const classes: any = getObjectClassNames({
  backButton:{
    fontSize: '24px',
    marginLeft: '10px',
  },
  backIcon: {
    cursor: 'pointer',
    [mediaQueries.phone]: {
      position: 'absolute',
      display: 'flex',
      height: '100%',
      alignItems: 'center',
      left: 0,
    },
  },
});

const Header = ({
  data,
  onBackClick,
  onHintsClick,
  step,
  contentData = [],
  hideBackButton,
}: any) => {
  const isMobile = useMediaQuery();
  const styles = isMobile ? mobileStyles : desktopStyles;
  const stepCount =
    step > contentData?.length - 1 ? contentData?.length : step + 1;
  return (
    <div className={`${styles.headerContainer}`}>
      {!hideBackButton ? (
        <div className={classes.backIcon} onClick={onBackClick}>
          <span className={`icon-arrow-left ${classes.backButton}`} />
        </div>
      ) : null}

      <div className={styles.headerTitle}>{data?.title}</div>
      <div onClick={onHintsClick} className={styles.hints}>
        <Image
          width={20}
          height={20}
          src={`${GRIP_INVEST_BUCKET_URL}commons/BulbIcon.svg`}
          layout={'fixed'}
          alt="BulbIcon"
        />
        <div className={styles.hintTitle}>{data?.hints?.title}</div>
      </div>
      <div className={styles.stepCountContainer}>
        <div
          className={styles.stepHeader}
        >{`Step ${stepCount}/${contentData?.steps?.length}`}</div>
      </div>
    </div>
  );
};

export default Header;
