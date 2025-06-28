import React, { useContext } from 'react';

// Primitives
import Button from '../../primitives/Button';
import Image from '../../primitives/Image';

// Contexts
import { PendingPgOrderContext } from '../../../pages/pg-confirmation';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// styles
import classes from './BottomBanner.module.css';

export const BottomBannerConfimationCentent = () => {
  const data = useContext(PendingPgOrderContext);

  const { redirectToPortfolio } = data ?? {};
  return (
    <div className={` flex ${classes.Container}`}>
      <div>
        <p>
          Track your growing investments and keep a tab on your past and future
          returns
        </p>
        <Button width={'auto'} onClick={redirectToPortfolio}>
          <div>View Portfolio</div>
        </Button>
      </div>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}icons/investmentGrowth.svg`}
        alt="investment"
        width={150}
        height={150}
        layout={'fixed'}
      />
    </div>
  );
};
