import React from 'react';
import QuestionIcon from '../../components/assets/static/assetList/QuestionIcon.svg';
import { getObjectClassNames } from '../utils/designUtils';
import Image from '../primitives/Image';

type Props = {
  className?: any;
  data?: any;
  handleOnSubmit?: () => void;
};

const classes: any = getObjectClassNames({
  HowItWorks: {},
  CardHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  ImageIcon: {
    width: '40px',
    height: '40px',
    background: 'var(--gripWhiteLilac, #f7f7fc)',
    borderRadius: '8px',
    marginRight: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Label: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '28px',
    color: 'var(--gripLuminousDark)',
  },
  CardHeaderLeft: {},
  CarsBody: {
    padding: '20px 0',
    p: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '24px',
      color: '#555770',
      margin: 0,
      a: {
        textDecoration: 'underline',
        color: 'var(--gripBlue)',
      },
    },
  },
  CardFooter: {
    color: 'var(--gripBlue)',
    fontWeight: 800,
    fontSize: 12,
    lineHeight: '24px',
    textTransform: 'uppercase',
    textAlign: 'center',
    span: {
      cursor: 'pointer',
    },
  },
});

const HowItWorks = ({
  className = '',
  data,
  handleOnSubmit = () => {},
}: Props) => {
  return (
    <div className={classes.HowItWorks}>
      <div className={classes.CardHeader}>
        <span className={classes.ImageIcon}>
          <Image 
            src={QuestionIcon.src} 
            alt="RupeesIcon"
            width={25}
            height={25}
            layout={'intrinsic'}
          />
        </span>
        <span className={classes.Label}>How it Works?</span>
      </div>
      <div className={classes.CarsBody}>
        <p>
          Pre-tax returns are compared with Pre-tax fixed deposit {'  '}
          <a
            href="https://www.bankbazaar.com/fixed-deposit/hdfc-fixed-deposit-rate.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            returns of HDFC bank
          </a>{' '}
          of similar tenure.
        </p>
      </div>
      <div className={classes.CardFooter}>
        <span onClick={() => handleOnSubmit()}>Okay</span>
      </div>
    </div>
  );
};

export default HowItWorks;
