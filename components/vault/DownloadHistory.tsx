import React from 'react';
import Button from '../primitives/Button';
import styles from '../../styles/Vault/DownloadHistory.module.css';

const DownloadHistory = () => {
  const [timePeriod, setTimePeriod] = React.useState(3);

  return (
    <div className={styles.DownloadHistory}>
      <div className={styles.CardHeader}>
        <h4 className="Heading4">Download</h4>
      </div>
      <div className={styles.CardBody}>
        <div className={styles.TimePeriodContainer}>
          <h6 className="TextStyle2">Choose Time Period</h6>
          <div className={styles.TimePeriodList}>
            <div
              onClick={() => setTimePeriod(3)}
              className={`${styles.TimePeriodItem} ${
                timePeriod === 3 ? 'Active' : ''
              }`}
            >
              Last 3 Months
            </div>
            <div
              onClick={() => setTimePeriod(6)}
              className={`${styles.TimePeriodItem} ${
                timePeriod === 6 ? 'Active' : ''
              }`}
            >
              Last 6 Months
            </div>
          </div>
        </div>
        <div className={styles.Separator}>
          <span className="Line"></span>
          <span>OR</span>
        </div>
        <div className={styles.DateSelector}>
          <div className={styles.DatePickerEle}>
            <input type={`text`} placeholder="Start Date" autoComplete="off" />
            <span className={`icon-visualise-returns ${styles.CalendarIcon}`} />
          </div>
          <div className={styles.DatePickerEle}>
            <input type={`text`} placeholder="End Date" autoComplete="off" />
            <span className={`icon-visualise-returns ${styles.CalendarIcon}`} />
          </div>
        </div>
      </div>
      <div className={styles.CardFooter}>
        <Button className={styles.ContinueBtn}>Continue</Button>
      </div>
    </div>
  );
};

export default DownloadHistory;
