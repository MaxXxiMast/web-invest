// NODE MODULES
import React, { PropsWithChildren } from 'react';

// Components
import Button from '../../primitives/Button';
import Image from '../../primitives/Image';

// Utils
import {
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';

// Styles
import styles from './BottomSwitch.module.css';

type BottomSwitchProps = {
  nextStep: () => [string, () => void, boolean];
  gotoAssets: () => void;
  showSkipButton?: boolean;
  showForwardIcon?: boolean;
  className?: string;
};

const BottomSwitch = (props: PropsWithChildren<BottomSwitchProps>) => {
  const [text = '', handler, loading] = props?.nextStep();
  const { showSkipButton = true, showForwardIcon = true } = props;

  return (
    <div
      className={`${styles.Container} ${handleExtraProps(props?.className)}`}
    >
      {showSkipButton ? (
        <span className={styles.skipText} onClick={props.gotoAssets}>
          Skip for Now
        </span>
      ) : null}

      <Button
        className={styles.RedeemBtn}
        width={showSkipButton ? 'max-content' : '100%'}
        onClick={handler}
        isLoading={loading}
      >
        {!loading ? (
          <div className="items-align-center-row-wise">
            {text}
            {showForwardIcon ? (
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/forwardIcon.svg`}
                width={20}
                height={20}
                layout="fixed"
                alt="forwardicon"
              />
            ) : null}
          </div>
        ) : (
          <></>
        )}
      </Button>
      {props?.children}
    </div>
  );
};

export default BottomSwitch;
