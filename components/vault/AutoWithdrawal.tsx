import React, { useEffect } from 'react';
import Image from '../primitives/Image';
import ToggleSwitch from '../primitives/ToggleSwitch/ToggleSwitch';
import Link from 'next/link';
import styles from '../../styles/Vault/AutoWithdrawal.module.css';
import MaterialModalPopup from '../primitives/MaterialModalPopup';
import { isMobile } from '../../utils/resolution';
import Button, { ButtonType } from '../primitives/Button';
import TooltipCompoent from '../primitives/TooltipCompoent/TooltipCompoent';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

type Props = {
  className?: any;
  autoWithdrawl?: boolean;
  disabled?: boolean;
  onWithdrawlChange?: () => void;
  autoWithdrawlText?: string;
  getAutowithdrawErrorText?: () => string;
};

const AutoWithdrawal = ({
  className = '',
  autoWithdrawl = false,
  disabled = false,
  onWithdrawlChange,
  getAutowithdrawErrorText,
}: Props) => {
  const [withdraw, setWithdraw] = React.useState(false);
  const [showPopup, setShowPopup] = React.useState(false);
  const renderConfirmationText = () => {
    return (
      <MaterialModalPopup
        showModal={showPopup}
        isModalDrawer={isMobile()}
        handleModalClose={() => {
          setShowPopup(false);
        }}
        className={styles.popup}
      >
        <div className={styles.PopupContainer}>
          <div className={styles.WarningImage}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}commons/Warning.svg`}
              alt="Warning"
            />
          </div>
          <h3 className={`${styles.ModalTitle} Heading3`}>
            You are turning auto-withdrawal on
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant={ButtonType.Inverted}
              onClick={() => {
                setShowPopup(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onWithdrawlChange();
                setShowPopup(false);
              }}
            >
              OK
            </Button>
          </div>
        </div>
      </MaterialModalPopup>
    );
  };
  const handleAutoInvestToggle = () => {
    if (withdraw) onWithdrawlChange();
    else {
      setShowPopup(true);
    }
  };
  useEffect(() => {
    setWithdraw(autoWithdrawl);
  }, [autoWithdrawl]);
  return (
    <>
      <div className={`${styles.AutoWithdrawal} ${className}`}>
        <div className={styles.AutoWithdrawalInner}>
          <div className={styles.AutoWithdrawalRight}>
            <div className={styles.CardBottom}>
              <div className={styles.CardBottomLeft}>
                <span className="Heading4">
                  Auto Withdraw returns into your bank account
                </span>
                <ToggleSwitch
                  className={styles.ToggleSwitch}
                  checked={withdraw}
                  disabled={true}
                  handleChange={handleAutoInvestToggle}
                />
                <span className={styles.InfoIcon}>
                  <TooltipCompoent
                    toolTipText={`The money will be credited within 1 business day.`}
                  >
                    <span
                      className={`icon-info`}
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--gripBlue, #00357c)',
                      }}
                    />
                  </TooltipCompoent>
                </span>
              </div>
              <div className={styles.CardBottomRight}>
                <Link href={`https://www.gripinvest.in/faq#vaultQuestions-77`}>
                  Need Help?
                </Link>
              </div>
            </div>
            {disabled ? (
              <span className={styles.errorText}>
                {getAutowithdrawErrorText()}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {renderConfirmationText()}
    </>
  );
};

export default AutoWithdrawal;
