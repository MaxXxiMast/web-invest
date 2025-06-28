import { handleExtraProps } from '../../../utils/string';
import styles from './UserKycStatus.module.css';

type Props = {
  message: string;
  className?: string;
};

const UserKycStatus = ({ message = '', className = '' }: Props) => {
  return (
    <div className={`flex ${styles.Wrapper} ${handleExtraProps(className)}`}>
      <span data-testid="kyc-icon" className={`icon-info ${styles.InfoIcon}`} />
      <span data-testid="kyc-message" className={styles.Text}>{message}</span>
    </div>
  );
};

export default UserKycStatus;
