// NODE MODULES
import React, { useEffect, useRef } from 'react';

// CUSTOM COMPONENTS
import CloseLineIcon from '../../assets/CloseLineIcon';
import BodyRootWrapper from '../BodyRootWrapper';

// STYLESHEET
import styles from './MobileDrawer.module.css';

//UTILS
import { handleExtraProps } from '../../../utils/string';

type Props = {
  children?: any;
  className?: string;
  showFlyer?: boolean;
  handleDrawerClose?: (res: boolean) => void;
  backgroundColor?: string;
  hideClose?: boolean;
};

const MobileDrawer = ({
  children,
  className,
  showFlyer = false,
  handleDrawerClose,
  backgroundColor,
  hideClose = false,
}: Props) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ele = document.querySelector('#MODAL_BACKDROP');
    if (showFlyer) {
      document.body.classList.add('scroll-hidden');
    } else if (!document.body.contains(ele)) {
      document.body.classList.remove('scroll-hidden');
    }
  }, [showFlyer]);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      handleDrawerClose?.(false);
    }
  };

  return (
    <BodyRootWrapper>
      {showFlyer && (
        <div
          ref={backdropRef}
          className={`${styles.MobileFlyer} ${
            showFlyer ? 'visible' : 'hidden'
          }`}
          onClick={handleOutsideClick}
          id="MODAL_BACKDROP"
          onTouchMove={(e) => e.preventDefault()}
        >
          <div
            className={`${styles.MobileFlyerInner} ${handleExtraProps(
              className
            )}`}
            style={{ background: backgroundColor }}
          >
            {!hideClose && (
              <div
                className={`${styles.MobileCloseBtn}`}
                onClick={() => handleDrawerClose?.(false)}
              >
                <CloseLineIcon />
              </div>
            )}
            <div className={`${styles.MobileDrawerBody}`}>{children}</div>
          </div>
        </div>
      )}
    </BodyRootWrapper>
  );
};

export default MobileDrawer;
