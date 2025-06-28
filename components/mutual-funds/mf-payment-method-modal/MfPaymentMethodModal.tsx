import React, { useEffect } from 'react';
import Link from 'next/link';

// COMPONENTS
import BackBtn from '../../primitives/BackBtn/BackBtn';
import Button from '../../primitives/Button';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import RadioGroupCustom from '../../primitives/RadioGroup';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
import Image from '../../primitives/Image';

// REDUX
import { setMfData } from '../redux/mf';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';

// UTILS
import { PaymentMethods } from '../utils/types';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// STYLES
import classes from './MfPaymentMethodModal.module.css';

type MfPaymentMethodModalProps = {
  title?: string;
  footerBtnText?: string;
};

const MfPaymentMethodModal = ({
  title = 'Select Payment Method',
  footerBtnText = 'Confirm',
}: MfPaymentMethodModalProps) => {
  const dispatch = useAppDispatch();

  const {
    selectedPaymentMethod = 'upi',
    showPaymentMethodModal,
    availablePaymentMethods = [],
    bankDetails = {},
  } = useAppSelector((state) => (state as any)?.mfConfig ?? {});

  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethods>(
    selectedPaymentMethod
  );

  useEffect(() => {
    setPaymentMethod(selectedPaymentMethod);
  }, [selectedPaymentMethod]);

  const handleRadioChange = (event: any) => {
    setPaymentMethod(event.target.value);
  };

  const handleBackClick = () => {
    dispatch(
      setMfData({
        showPaymentMethodModal: false,
      })
    );
  };

  const handleConfirmClick = (val: PaymentMethods) => {
    dispatch(
      setMfData({
        selectedPaymentMethod: val,
        showPaymentMethodModal: false,
      })
    );
  };

  useEffect(() => {
    setMfData({
      selectedPaymentMethod: availablePaymentMethods?.[0]?.value,
    });
  }, [availablePaymentMethods]);

  const renderModalContent = () => {
    const isButtonDisabled =
      availablePaymentMethods.length === 0 || !selectedPaymentMethod;

    return (
      <div className={`flex-column ${classes.PaymentMethodModal}`}>
        <div className={classes.Header} id="mfPaymentMethodModalHeader">
          <BackBtn handleBackEvent={handleBackClick} className={classes.Back} />
          <h3 className={`text-center ${classes.Title}`}>{title}</h3>
        </div>
        <div className={classes.Body} id="mfPaymentMethodModalBody">
          {paymentMethod === 'upi' ? (
            <p
              className={`text-center ${classes.Text}`}
              data-testid="bankDetails"
            >
              Pay using{' '}
              <span>
                {bankDetails?.bankName?.slice(0, 4)} **
                {bankDetails?.accountNo?.slice(-4)}
              </span>{' '}
              <TooltipCompoent
                toolTipText={'test'}
                linkClass={classes.Tooltip}
                placementValue="bottom"
              >
                <span className={`icon-info ${classes.Icon}`} />
              </TooltipCompoent>
            </p>
          ) : null}
          <div className={`flex-column ${classes.PaymentMethodList}`}>
            {availablePaymentMethods?.length ? (
              <RadioGroupCustom
                row
                aria-label="paymentMethods"
                name="paymentMethods"
                options={availablePaymentMethods}
                value={paymentMethod}
                id="paymentMethods"
                classes={{
                  root: classes.RadioGroup,
                }}
                handleChangeEvent={handleRadioChange}
                labelRootClass={classes.RadioLabelRoot}
                radioClass={classes.RadioBtn}
              />
            ) : (
              <p
                className={`text-center ${classes.NoPaymentMethod}`}
                data-testid="noPaymentMethod"
              >
                No payment method found...
              </p>
            )}
          </div>
        </div>

        <p className={`${classes.footerTerms} ${classes.HideInDesktop}`}>
          By proceeding, I agree to the{' '}
          <Link
            href={'/legal#termsAndConditions'}
            target="_blank"
            prefetch={false}
            data-testid="redirection-link"
            className={classes.linkStyle}
          >
            Terms and Conditions
          </Link>
          , <br />
          <Link
            href={'/legal#privacy'}
            target={'_blank'}
            prefetch={false}
            data-testid="redirection-link"
            className={classes.linkStyle}
          >
            Tax Implications & Risks Involved
          </Link>
        </p>

        <div className={classes.Footer} id="mfPaymentMethodModalFooter">
          <Button
            style={{
              width: '100%',
            }}
            onClick={() => {
              handleConfirmClick(paymentMethod);
            }}
            disabled={isButtonDisabled}
            data-testid="confirmPayment"
          >
            {footerBtnText}
          </Button>
        </div>

        <p className={`${classes.footerTerms} ${classes.HideInMobile}`}>
          By proceeding, I agree to the{' '}
          <Link
            href={'/legal#termsAndConditions'}
            target="_blank"
            prefetch={false}
            data-testid="redirection-link"
            className={classes.linkStyle}
          >
            Terms and Conditions
          </Link>
          , <br />
          <Link
            href={'/legal#privacy'}
            target={'_blank'}
            prefetch={false}
            data-testid="redirection-link"
            className={classes.linkStyle}
          >
            Tax Implications & Risks Involved
          </Link>
        </p>
        <p className={classes.paymentNse}>
          Payments are securely enabled via
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/nse-logo.svg`}
            alt="nse-logo"
            layout="fixed"
            width={32}
            height={18}
          />
        </p>
      </div>
    );
  };

  return (
    <MaterialModalPopup
      hideClose
      showModal={showPaymentMethodModal}
      isModalDrawer
      mainClass={classes.Modal}
    >
      {renderModalContent()}
    </MaterialModalPopup>
  );
};
export default MfPaymentMethodModal;
