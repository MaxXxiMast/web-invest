import Button, { ButtonType } from '../primitives/Button';

import styles from '../../styles/ApplyNow.module.css';

type Props = {
  data?: any;
  className?: any;
};

const ApplyNow = ({ data, className }: Props) => {
  return (
    <div className={`${styles.applyNowMain} ${className} slide-up`}>
      <div className="containerNew">
        <div
          className={`${styles.applyNowBox} slide-up flex justify-between items-center`}
        >
          <div className={`${styles.applyNowLeft} flex items-center`}>
            <div className={`${styles.organicSeedlingContent} `}>
              <span className={styles.referUnit}>
                <span className="icon-refer-rupees" />
              </span>
              <div>
                <h5>{data?.title}</h5>
                <h6>{data?.subTitle}</h6>
              </div>
            </div>
          </div>
          <div className={styles.applyNowRight}>
            <Button
              onClick={data?.button?.onClick}
              width={140}
              variant={ButtonType.Primary}
            >
              {data?.button?.label}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyNow;
