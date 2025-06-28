import React, { useEffect } from 'react';
import NumberFormat from 'react-number-format';

import MaterialModalPopup from '../primitives/MaterialModalPopup';
import Button, { ButtonType } from '../primitives/Button';
import { isMobile } from '../../utils/resolution';
import { useAppSelector } from '../../redux/slices/hooks';
import { getKYCDetailsFromConfig } from '../user-kyc/utils/helper';

import styles from '../../styles/Vault/WithdrawlModal.module.css';

const DEFAULT_TEXT = 'Are you sure?';
type Props = {
  showModal?: boolean;
  withdrawamount?: string | number;
  handleModalClose?: (val: boolean) => any;
  onWithDrawClick?: (cb?: any) => void;
  confirmWithdrawalAmount?: () => [x: boolean, y: string];
  handleValueChange?: () => void;
  onChange?: (e: string | number) => void;
  withdrawlText?: string;
};

const WithdrawlModal = ({
  showModal = false,
  handleModalClose,
  onWithDrawClick,
  confirmWithdrawalAmount,
  withdrawamount,
  onChange,
  withdrawlText = DEFAULT_TEXT,
}: Props) => {
  const [buttonDisabled, setButtonDisable] = React.useState({
    value: false,
    msg: '',
  });

  const kycConfigStatus = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );

  const bankDetails = getKYCDetailsFromConfig(
    kycConfigStatus,
    'bank'
  ) as Record<string, string>;

  useEffect(() => {
    if (withdrawamount !== null && withdrawamount !== '') {
      const timeoutId = setTimeout(() => checkWithdrawAmount(), 200);
      return () => clearTimeout(timeoutId);
    }
    if (withdrawamount === '') setButtonDisable({ value: true, msg: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawamount]);

  const checkWithdrawAmount = () => {
    const [result, msg] = confirmWithdrawalAmount();
    setButtonDisable({ value: !result, msg: msg });
  };
  const [showPopup, setShowPopup] = React.useState(false);
  const [loading, setloading] = React.useState(false);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          <span className={styles.popUpFirstRow}>{withdrawlText}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant={ButtonType.Inverted}
              onClick={() => {
                setShowPopup(false);

                handleModalClose(true);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setloading(true);

                onWithDrawClick(() => setloading(false));
                setShowPopup(false);

                handleModalClose(true);
              }}
              isLoading={loading}
            >
              Yes
            </Button>
          </div>
        </div>
      </MaterialModalPopup>
    );
  };
  const checkButtonResponse = () => {
    if (!buttonDisabled.value) setShowPopup(true);
  };
  return (
    <>
      <MaterialModalPopup
        handleModalClose={(res: boolean) => handleModalClose(res)}
        showModal={showModal}
        isModalDrawer
        className={styles.mainPopup}
      >
        <div className={styles.ModalHeader}>
          <h4 className="Heading5">
            <span className={styles.WithdrawIcon}>
              <span className={`icon-rupees2 ${styles.RupeesIcon}`} />
            </span>{' '}
            Withdraw
          </h4>
        </div>
        <div className={styles.ModalBody}>
          <div className={styles.Note}>
            <p className="TextStyle2">
              <span>
                <strong>How much you want to withdraw?</strong>
              </span>
            </p>
          </div>
          <NumberFormat
            thousandSeparator
            thousandsGroupStyle="lakh"
            inputMode={'numeric'}
            prefix={'₹ '}
            placeholder="Enter Amount"
            className={styles.withdrawAmount}
            onValueChange={(values: any) => onChange(values.value)}
            value={withdrawamount}
            autoFocus={true}
          />
          {buttonDisabled.value ? (
            <span className={styles.errorText}>{buttonDisabled.msg}</span>
          ) : null}
          <div className={styles.BankAccountDetails}>
            <h3 className="TextStyle1">
              <span className={`icon-bank ${styles.BankIcon}`} /> Your verified
              bank Account
            </h3>
            <ul>
              <li>
                <span>Account Number</span>
                <span>{bankDetails?.accountNumber}</span>
              </li>
              <li>
                <span>IFSC</span>
                <span>{bankDetails?.ifscCode?.toUpperCase()}</span>
              </li>
            </ul>
          </div>

          <div className={styles.Note}>
            <div className="TextStyle2">
              <p>
                <strong>Note:</strong>
              </p>
              <ul>
                <li>
                  For security, all withdrawals are approved by a Trusteeship
                </li>
                <li>Withdrawal can take up to 2 business days</li>
                <li>Withdrawal Hours: Mon-Fri, 9:30AM - 3:00PM IST</li>
                <li>
                  Saturdays, Sundays and National holidays will not be business
                  day as applicable
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.ModalFooter}>
          <Button
            className={styles.WithdrawBtn}
            onClick={checkButtonResponse}
            disabled={buttonDisabled.value}
          >
            Withdraw
          </Button>
        </div>
      </MaterialModalPopup>
      {renderConfirmationText()}
    </>
  );
};

export default WithdrawlModal;
