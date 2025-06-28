//components
import RMCard from '../../../common/RMCard';

//hooks
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';

//styles
import styles from './BookCall.module.css';

type Props = {
  showInMobile?: boolean;
};

const PortfolioBookCall = ({ showInMobile = true }: Props) => {
  const isMobile = useMediaQuery('(max-width: 992px)');

  if (!showInMobile && isMobile) {
    return null;
  }

  return (
    <div className={styles.container}>
      <RMCard />
    </div>
  );
};

export default PortfolioBookCall;
