import React from 'react';
import { StepsArrModal } from '../../../utils/kyc';
import { useKycContext } from '../../../contexts/kycContext';

import classes from './Sidebar.module.css';

type SidebarProps = {
  stepsArr: StepsArrModal[];
};

const isMobile = () =>
  typeof window !== 'undefined' && window.innerWidth <= 767;

const LayoutSidebar = ({ stepsArr = [] }: SidebarProps) => {
  const { kycActiveStep } = useKycContext();

  if (stepsArr.length === 0) {
    return null;
  }

  return (
    <div className={`${classes.Sidebar} flex-column`} id="LAYOUT_SIDEBAR">
      <ul>
        {stepsArr.map((ele: StepsArrModal, index: number) => {
          return (
            <React.Fragment key={ele.id}>
              <li
                className={`flex items-center ${
                  index === kycActiveStep ? classes.Active : ''
                } ${index < kycActiveStep ? classes.Complete : ''}`}
                key={`${ele?.id}`}
              >
                <div className={`flex items-center ${classes.ItemContent}`}>
                  <span className={classes.Circle}>
                    {index < kycActiveStep ? (
                      <span className="icon-tick" />
                    ) : null}
                  </span>
                  {isMobile() ? ele?.mobileLabel : ele?.dekstopLabel}
                </div>
              </li>
              {!isMobile() && index < stepsArr.length - 1 ? (
                <li
                  className={classes.Seperator}
                  key={`seperator__${ele.id}`}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default LayoutSidebar;
