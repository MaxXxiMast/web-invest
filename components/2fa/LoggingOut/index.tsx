import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import Image from '../../primitives/Image';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';

import styles from './LoggingOut.module.css';

export default function LoggingOut() {
  return (
    <MaterialModalPopup
      isModalDrawer
      hideClose
      showModal={true}
      className={styles.LoggingOut}
    >
      <div className={`flex-column items-center  ${styles.Container}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}commons/sad_laptop_face.svg`}
          width={72}
          height={72}
          layout="fixed"
          alt="sad laptop face"
        />
        <div className={`flex-column ${styles.InnerContainer} `}>
          <span className={styles.Heading}>Logging out</span>
          <span className={styles.SubHeading}>
            2 factor authentication attempts exceeded. Please initiate login
            again
          </span>
          <p className={styles.Progressing}>
            Redirecting you to login screen{' '}
            <span className={styles.wave}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </span>
          </p>
        </div>
      </div>
    </MaterialModalPopup>
  );
}
