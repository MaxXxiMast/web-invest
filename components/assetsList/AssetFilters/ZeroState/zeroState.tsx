// Components
import Button, { ButtonType } from '../../../primitives/Button';
import Image from '../../../primitives/Image';

// UTILS
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../../utils/string';

// STYLES
import styles from './zeroState.module.css';
import { isMobile } from '../../../../utils/resolution';

type MyProps = {
  header?: string;
  subHeader?: string;
  customButtonText1?: string;
  customButtonText2?: string;
  customButtonAction1?: () => void;
  customButtonAction2?: () => void;
  className?: string;
  customHeaderClassName?: string;
  showIcon?: boolean;
  buttonClassName1?: string;
  buttonClassName2?: string;
};
const ZeroState = ({
  header = 'No Data',
  subHeader = 'please try again later',
  customButtonText1,
  customButtonText2,
  customHeaderClassName,
  customButtonAction1,
  customButtonAction2,
  showIcon = false,
  className,
  buttonClassName1,
  buttonClassName2,
}: MyProps) => {
  return (
    <div
      className={`flex-column ${styles.containerDiv} ${handleExtraProps(
        className
      )}`}
      data-testid="zeroStateContainer"
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
      <div className={`flex ${styles.buttonContainer}`}>
        {customButtonText1 ? (
          <Button
            className={`${styles.actionButton} ${handleExtraProps(
              buttonClassName1
            )}`}
            variant={ButtonType.PrimaryLight}
            onClick={customButtonAction1}
            width={isMobile ? 141 : 150}
          >
            {customButtonText1}
          </Button>
        ) : null}

        {customButtonText2 ? (
          <Button
            className={`${styles.actionButton} ${handleExtraProps(
              buttonClassName2
            )}`}
            variant={ButtonType.Primary}
            onClick={customButtonAction2}
            width={isMobile ? 141 : 150}
          >
            {customButtonText2}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default ZeroState;
