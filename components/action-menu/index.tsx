'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Menu, MenuItem } from '@mui/material';

// COMPONENTS
import SellOrderModal from '../portfolio-holdings/sell-order-modal/SellOrderModal';
import MoreInfo from '../portfolio-holdings/MoreInfo';

// STYLES (CSS module)
import styles from './ActionMenu.module.css';

// UTILS
import { getObjectClassNames } from '../utils/designUtils';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { actionMenuOptions, formatDateToReadable } from './utils';
import Image from '../primitives/Image';
import Transaction from '../portfolio-holdings/transactionAndReturns/Transaction';
import { trackEvent } from '../../utils/gtm';

//REDUX
import { useAppSelector } from '../../redux/slices/hooks';

const GenericModal = dynamic(() => import('../user-kyc/common/GenericModal'), {
  ssr: false,
});

const classes: any = getObjectClassNames({
  menuPaper: {
    width: '220px',
    boxShadow: '0px 5px 6px 0px #2C2E390F',
    maxHeight: 230,
    borderRadius: 8,
    padding: '8px',
    border: '1px solid var(--gripWhiteLilac, #F7F7FC)',
  },
  menuItemRoot: {
    width: '100%',
    height: '42px',
    padding: '12px',
    marginBottom: '2px',
    '&&:hover': {
      fontWeight: 600,
      backgroundColor: 'var(--gripPorcelain,  #F7F8F9) !important',
    },
    '&.Mui-selected': {
      backgroundColor: 'transparent !important',
      fontWeight: 500,
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'var(--gripPorcelain,  #F7F8F9) !important',
      fontWeight: 600,
    },
    '&.Mui-focusVisible': {
      backgroundColor: 'transparent !important',
    },
    color: 'var(--gripWealthText, #696B74)',
    fontWeight: 500,
    borderRadius: 4,
    fontSize: 12,
    lineHeight: '14px',
    cursor: 'pointer',
  },
  menuList: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
  },
});

interface ActionMenuProps {
  type: string;
  securityID?: number;
  lockInDate?: string | null;
  logo?: string;
  orderID?: number;
  transactionLogo?: string;
  units?: number;
  filter?: string;
  maturityDate?: string;
  orderType?: string;
  activeProduct?: string;
  assetName?: string | number;
  xirr?: number;
  dealType?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  type,
  securityID,
  lockInDate,
  logo,
  orderID,
  transactionLogo,
  units,
  filter,
  maturityDate,
  orderType,
  activeProduct,
  assetName = '',
  xirr,
  dealType,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sellModalOpen, setSellModalOpen] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showTransactionModal, setShowTransactionModal] = React.useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  const [sellExpectedPayout, setSellExpectedPayout] = useState<boolean>(false);
  const userID = useAppSelector((state) => state.user.userData.userID);

  const sellOrderData = {
    securityID: securityID,
    logo: logo,
    xirr: xirr,
  };

  const getMenuOptions = () => {
    if (type === 'transactions') {
      return actionMenuOptions.filter(({ id }) => id === 4);
    }

    if (filter === 'past') {
      return actionMenuOptions.filter(({ id }) => [2, 4].includes(id));
    }
    if (activeProduct === 'SDIs') {
      return actionMenuOptions.filter(({ id }) => id !== 1);
    }

    return actionMenuOptions;
  };

  const menuOptions = getMenuOptions();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (type === 'holdings') {
      trackEvent('validate_lockin_period', {
        user_id: userID,
        lockin_period_days: lockInDate
          ? `${Math.ceil(
              (new Date(lockInDate).getTime() - new Date().getTime()) /
                (1000 * 3600 * 24)
            )} days`
          : '0 days',
        security_id: securityID,
      });
    }
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isOptionDisabled = (optionName: string): boolean => {
    if (optionName === 'Sell Units') {
      if (lockInDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eligibleDate = new Date(lockInDate);
        eligibleDate.setHours(0, 0, 0, 0);

        return eligibleDate > today;
      }
    }
    return false;
  };

  const getSellButtonText = (optionName: string): string => {
    if (optionName === 'Sell Units') {
      if (lockInDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eligibleDate = new Date(lockInDate);
        eligibleDate.setHours(0, 0, 0, 0);

        if (eligibleDate > today) {
          return `Sell Units (${formatDateToReadable(lockInDate)})`;
        }
      }
    }
    return optionName;
  };

  const handleMenuItemClick = (option: {
    id: number;
    name: string;
    disabled?: boolean;
    availableAfter?: string;
  }) => {
    handleMenuClose();
    if (option?.id === 1) {
      if (!isOptionDisabled('Sell Units')) {
        setSellModalOpen(true);
      }
    } else if (option?.id === 2) {
      setShowTransactionModal(true);
    } else if (option?.id === 4) {
      setMoreInfoOpen(true);
    }
  };

  const handleSellModalClose = () => {
    setSellModalOpen(false);
  };

  const handleMoreInfoModalClose = () => {
    setMoreInfoOpen(false);
  };

  const handlePlaceSellRequest = (units: number, showYellowText: boolean) => {
    setSellExpectedPayout(showYellowText);
    setSellModalOpen(false);
    setShowSuccessModal(true);
  };

  return (
    <div>
      <div className={styles.verticalDotsContainer} onClick={handleMenuOpen}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/vertical-dots.svg`}
          alt="vertical-dots"
          height={15}
          width={10}
          className={styles.verticalDots}
          layout="intrinsic"
        />
      </div>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        classes={{ paper: classes.menuPaper, list: classes.menuList }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {menuOptions.map((option) => (
          <MenuItem
            key={`${option.id}}`}
            onClick={() => handleMenuItemClick(option)}
            disabled={isOptionDisabled(option.name)}
            classes={{ root: classes.menuItemRoot }}
            disableRipple
          >
            <div>
              <div>
                {isOptionDisabled(option.name)
                  ? getSellButtonText(option.name)
                  : option.name}
              </div>
            </div>
          </MenuItem>
        ))}
      </Menu>

      <SellOrderModal
        showModal={sellModalOpen}
        onClose={handleSellModalClose}
        data={sellOrderData}
        onPlaceSellRequest={handlePlaceSellRequest}
        units={units}
        maturityDate={maturityDate}
      />

      <MoreInfo
        showModal={moreInfoOpen}
        onClose={handleMoreInfoModalClose}
        securityID={securityID}
        logo={logo}
        orderID={orderID}
        transactionLogo={transactionLogo}
        units={units}
        orderType={orderType}
        activeProduct={activeProduct}
        dealType={dealType}
      />

      <Transaction
        showModal={showTransactionModal}
        setShowModal={setShowTransactionModal}
        securityID={securityID}
        assetName={assetName}
      />

      <GenericModal
        showModal={showSuccessModal}
        title={'Sell Request Received'}
        subtitle={
          sellExpectedPayout
            ? 'Our team will reach out to you within 24 working hours.'
            : 'We are matching you with buyers shortly. Check your Email for updates!'
        }
        icon={'check-circle.svg'}
        btnText="Okay"
        handleBtnClick={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default ActionMenu;
