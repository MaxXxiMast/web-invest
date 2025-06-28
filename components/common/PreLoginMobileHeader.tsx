import React from 'react';
import Button, { ButtonType } from '../primitives/Button';
import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';
import Image from '../primitives/Image';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import BackBtn from '../primitives/BackBtn/BackBtn';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

const classes: any = getObjectClassNames({
  Header: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid var(--gripMercuryThree, #e6e6e6)',
    [mediaQueries.desktop]: {
      display: 'none',
    },
  },
  MobileLogo: {
    margin: '0 auto',
    '> div ': {
      padding: '0 !important',
    },
    img: {
      maxHeight: 28,
    },
  },
  LogoutBtn: {
    minWidth: 75,
    button: {
      padding: '4px 12px',
      maxHeight: 34,
    },
  },
  BackBtn: {
    minWidth: 75,
  },
});

type Props = {
  isLoggedIn?: boolean;
  handleLogoutClick?: () => void;
  handleBackClick?: () => void;
};

const PreLoginMobileHeader = ({
  isLoggedIn = false,
  handleLogoutClick = () => {},
  handleBackClick = () => {},
}: Props) => {
  const isMobile = useMediaQuery();

  const renderHeader = () => {
    return (
      <div className={classes.Header}>
        <div className={classes.BackBtn}>
          <BackBtn handleBackEvent={handleBackClick} shouldHandleAppBack />
        </div>
        <div
          className={classes.MobileLogo}
          onClick={() => {
            window.open('/', '_self', 'noopener');
          }}
        >
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}commons/logo.svg`}
            alt="Logo"
            layout={'fixed'}
            width={70}
            height={28}
          />
        </div>
        <div className={classes.LogoutBtn}>
          {isLoggedIn && (
            <Button
              variant={ButtonType.Secondary}
              onClick={handleLogoutClick}
              compact
              width={'auto'}
            >
              Log Out
            </Button>
          )}
        </div>
      </div>
    );
  };

  return isMobile ? renderHeader() : null;
};

export default PreLoginMobileHeader;
