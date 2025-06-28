import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import Image from '../../primitives/Image';

import styles from './KYILoader.module.css';

export default function KYILoader() {
  return (
    <div className={styles.MainContainer}>
      <div className={`flex-column ${styles.LoaderContainer}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}asset-details-content/kyi.gif`}
          alt="KYI Investor"
          width={290}
          height={92}
          layout={'fixed'}
        />
        <span>Analysing your answers..</span>
      </div>
    </div>
  );
}
