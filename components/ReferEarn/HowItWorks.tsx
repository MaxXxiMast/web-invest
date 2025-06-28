import React from 'react';
import IconContentBox from './IconContentBox';
import styles from '../../styles/Referral/HowItWorks.module.css';
import { howItWorks } from './constant';
import { handleExtraProps } from '../../utils/string';

type Props = {
  className?: any;
};

const HowItWorks = ({ className }: Props) => {
  return (
    <div
      id={'HowItWorks'}
      className={`${styles.HowItWorks} ${handleExtraProps(className)} ${
        styles.ReferHowItWorks
      } slide-up`}
    >
      <div className="containerNew">
        <div className={`${styles.TitleBox} text-center`}>
          <h4 className="sectionSubtitle">How it works?</h4>
          <h3 className="sectionTitle">
            It’s really <span>simple</span>
          </h3>
        </div>
        <div className="titleSeparator"></div>
        <div className={styles.IconBoxList}>
          {howItWorks.map((item) => {
            return (
              <IconContentBox
                className={`${styles.IconContentBox}`}
                data={item}
                key={item?.id}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
