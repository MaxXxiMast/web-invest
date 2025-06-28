import { useRouter } from 'next/router';
import CircularProgress from '@mui/material/CircularProgress';

import MaterialModalPopup from '../../primitives/MaterialModalPopup';

import styles from './RedirectionPaymentPopup.module.css';

type RedirectionPaymentPopupProps = {
  mainHeadingText: string;
  subHeadingText?: string;
  redirectURL?: string;
};

export default function RedirectionPaymentPopup({
  mainHeadingText = '',
  subHeadingText = 'Please do not hit back or refresh button',
  redirectURL = '',
}: RedirectionPaymentPopupProps) {
  const progessStyles = {
    size: 63,
    thickness: 3,
  };

  const router = useRouter();

  const onClickRedirect = () => {
    router.push(redirectURL);
  };

  return (
    <MaterialModalPopup
      showModal
      hideClose
      isModalDrawer
      className={styles.PopupInner}
      drawerExtraClass={styles.PopupInner}
    >
      <div className={styles.circularProgressContainer}>
        <CircularProgress
          variant="determinate"
          size={progessStyles.size}
          thickness={progessStyles.thickness}
          value={100}
          className={styles.circularProgressDeterminate}
        />
        <CircularProgress
          variant="indeterminate"
          size={progessStyles.size}
          thickness={progessStyles.thickness}
          disableShrink
          className={styles.circularProgressInDeterminate}
          classes={{
            circle: styles.circularProgressInDeterminateCircle,
          }}
        />
      </div>
      <div className={styles.mainHeadingText}>{mainHeadingText}</div>
      <div className={styles.subHeadingText}>{subHeadingText}</div>
      {redirectURL ? (
        <div className={`${styles.subHeadingText} ${styles.redirectURL}`}>
          <span onClick={onClickRedirect}>Click here</span>{' '}
          {`if redirect doesn't happen`}
        </div>
      ) : null}
    </MaterialModalPopup>
  );
}
