// Components
import Button, { ButtonType } from '../primitives/Button';
import Image from '../primitives/Image';

// UTILS
import { GRIP_INVEST_BUCKET_URL, handleExtraProps } from '../../utils/string';
import { isMobile } from '../../utils/resolution';

// STYLES
import styles from '../../styles/NoData.module.css';

type MyProps = {
  header?: string;
  subHeader?: string;
  customButtonText?: string;
  customButtonAction?: () => void;
  className?: string;
  buttonType?: ButtonType;
  customHeaderClassName?: string;
  showIcon?: boolean;
  buttonClassName?: string;
};
const NoData = ({
  header = 'No Data',
  subHeader = 'please try again later',
  customButtonText,
  customButtonAction,
  buttonType,
  customHeaderClassName,
  showIcon = true,
  className,
  buttonClassName,
}: MyProps) => {
  return (
    <div
      className={`${styles.containerDiv} ${handleExtraProps(className)}`}
      data-testid="noDataContainer"
    >
      {showIcon ? (
        <Image
          alt="no data"
          src={`${GRIP_INVEST_BUCKET_URL}icons/noData.svg`}
          width={72}
          height={72}
          layout="fixed"
        />
      ) : null}
      {header.length ? (
        <div
          className={`${styles.header} ${handleExtraProps(
            customHeaderClassName
          )}`}
        >
          {header}
        </div>
      ) : null}
      <div className={styles.subHeader}>{subHeader}</div>
      {customButtonText ? (
        <Button
          className={`${styles.actionButton} ${handleExtraProps(
            buttonClassName
          )}`}
          variant={
            buttonType
              ? buttonType
              : isMobile()
              ? ButtonType.NavMenu
              : ButtonType.Primary
          }
          onClick={customButtonAction}
        >
          {customButtonText}
        </Button>
      ) : null}
    </div>
  );
};

export default NoData;
