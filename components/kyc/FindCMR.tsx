import React from 'react';
import { GRIP_INVEST_BUCKET_URL, handleExtraProps } from '../../utils/string';
import Image from '../primitives/Image';
import TooltipCompoent from '../primitives/TooltipCompoent/TooltipCompoent';
import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

const classes: any = getObjectClassNames({
  FindCMR: {
    display: 'flex',
    padding: 16,
    border: '1px solid var(--gripMercuryThree, #e6e6e6)',
    boxShadow: '0px 1px 3px rgba(96, 108, 128, 0.05)',
    borderRadius: 8,
    width: 262,
    flexShrink: 0,
    flexDirection: 'column',
    '> h3': {
      fontWeight: 700,
      marginBottom: 4,
    },
    [mediaQueries.desktop]: {
      top: -45,
      position: 'relative',
    },
    [mediaQueries.phone]: {
      width: '100%',
      marginTop: 16,
    },
  },
  BrokerList: {
    marginTop: 56,
    display: 'flex',
    gap: 12,
    [mediaQueries.phone]: {
      marginTop: 16,
    },
  },
  BrokerItem: {
    '> a': {
      display: 'block',
    },
  },
  OtherBroker: {
    fontWeight: 700,
    fontSize: 12,
    lineHeight: '24px',
    color: 'var(--gripBlue)',
    border: '1px solid rgba(0, 53, 124, 0.5)',
    boxShadow: '0px 1px 3px rgba(96, 108, 128, 0.05)',
    borderRadius: '46px',
    padding: '2px 12px',
    background: 'var(--gripWhite)',
    cursor: 'pointer',
  },
});

type Broker = {
  label: string;
  icon: string;
  id: string;
};

const BrokerArr: Broker[] = [
  {
    label: 'Zerodha',
    icon: `${GRIP_INVEST_BUCKET_URL}bonds/Zerodha.svg`,
    id: 'zerodha',
  },
  {
    label: 'Upstox',
    icon: `${GRIP_INVEST_BUCKET_URL}bonds/Upstocks.svg`,
    id: 'upstox',
  },
  {
    label: 'Groww',
    icon: `${GRIP_INVEST_BUCKET_URL}bonds/Groww.svg`,
    id: 'groww',
  },
];

type Props = Partial<{
  heading: string;
  subHeading: string;
  className: any;
  classStyles: Partial<{
    headingClass: any;
    subHeadingClass: any;
    brokerListClass: any;
  }>;
  handleOtherBrokerModal?: (id: string) => void;
}>;

const FindCMR = ({
  heading = 'Find your CMR/ CML',
  subHeading = 'Click on the logo of your broker to know where you can find the CMR/ CML',
  handleOtherBrokerModal = (id = '') => {},
  className = '',
  classStyles = {},
}: Props) => {
  return (
    <div className={`${classes.FindCMR} ${className}`}>
      <h3
        className={`TextStyle1 ${handleExtraProps(classStyles?.headingClass)}`}
      >
        {heading}
      </h3>
      <p
        className={`TextStyle1 ${handleExtraProps(
          classStyles?.subHeadingClass
        )}`}
      >
        {subHeading}
      </p>
      <div
        className={`${classes.BrokerList} ${handleExtraProps(
          classStyles?.brokerListClass
        )}`}
      >
        {BrokerArr.map((item: Broker) => {
          return (
            <div
              className={classes.BrokerItem}
              key={`${item.label}`}
              onClick={() => handleOtherBrokerModal(item.id)}
            >
              <TooltipCompoent toolTipText={item.label}>
                <Image
                  src={item.icon}
                  layout="fixed"
                  width={28}
                  height={28}
                  alt={item.label}
                />
              </TooltipCompoent>
            </div>
          );
        })}
        <button
          onClick={() => handleOtherBrokerModal('')}
          className={classes.OtherBroker}
        >
          Other
        </button>
      </div>
    </div>
  );
};

export default FindCMR;
