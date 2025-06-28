import { useState } from 'react';

//Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

//Components
import IconDialog from '../../common/IconDialog';
import { ButtonType } from '../../primitives/Button';
import BackBtn from '../../primitives/BackBtn/BackBtn';

//Redux
import { useDispatch } from 'react-redux';
import { setCkycOpenedStatus } from '../../../redux/slices/assets';

// Styles
import styles from './CkycDialog.module.css';

const CkycDialog = ({
  showCKYCDialog = false,
  onClickDialog = (val: boolean) => {},
}) => {
  const dispatch = useDispatch();

  const [showLearnMore, setShowLearnMore] = useState(false);

  const updateCKYCStatus = () => {
    dispatch(setCkycOpenedStatus(true));
  };

  return (
    <>
      <IconDialog
        classes={{
          modalContainerClass: styles.CKYCModalMain,
          modalContentClass: styles.CKYCContentClass,
        }}
        showDialog={showCKYCDialog}
        iconUrl={`${GRIP_INVEST_BUCKET_URL}dealsV2/additional-kyc-warning.svg`}
        headingText={'CKYC Needed'}
        submitButtonText={`Learn More`}
        onSubmit={() => {
          updateCKYCStatus();
          onClickDialog(false);
          setShowLearnMore(true);
        }}
        specialSubHeadingText={''}
        onCloseDialog={() => {
          onClickDialog(false);
          updateCKYCStatus();
        }}
        id="additional-ckyc-drawer"
        isLoadingButton
        buttonType={ButtonType.Inverted}
        subHeadingText=""
        isArrowButton
        hideBottomLine
        textAlign={'left'}
      >
        <span className={styles.dialogContent}>
          Unfortunately, you will not be able to complete your investment
          journey with the AIF because you are not registered yet with the
          Central Know Your Customer (“CKYC”) authorities. Our team will reach
          out to you separately to assist you with the CKYC registration
          formalities. You’ll be able to resume your investment journey once the
          CKYC registration process is complete. You may also contact us at{' '}
          <a
            href="mailto:invest@gripinvest.in"
            target={'_blank'}
            rel="noreferrer"
          >
            invest@gripinvest.in
          </a>{' '}
          if you have any questions.
        </span>
      </IconDialog>
      {showLearnMore && (
        <div className={`IRRModalMain ${showLearnMore ? 'visible' : 'hidden'}`}>
          <div className={styles.IRRModalInner}>
            <div className={styles.Card}>
              <div
                className={styles.MobileClose}
                onClick={() => {
                  setShowLearnMore(false);
                  onClickDialog(true);
                }}
              ></div>
              <div className={styles.CardInner}>
                <div className={styles.CardHeader}>
                  <div className={styles.CardHeaderLeft}>
                    <span
                      className={styles.BackIcon}
                      onClick={() => {
                        setShowLearnMore(false);
                        onClickDialog(true);
                      }}
                    >
                      <BackBtn />
                    </span>
                    <span className={styles.Label}>
                      What is CKYC and why is this required?
                    </span>
                  </div>
                  <div className={styles.CardHeaderRight}>
                    <span
                      className={styles.CloseBtn}
                      onClick={() => {
                        setShowLearnMore(false);
                      }}
                    >
                      <span className={`icon-cross ${styles.CloseIcon}`} />
                    </span>
                  </div>
                </div>
                <div className={styles.CardBody}>
                  CKYC refers to Central KYC (Know Your Customer), an initiative
                  of the Government of India. The aim of this initiative is to
                  have a structure in place which allows investors to complete
                  their KYC only once before interacting with various entities
                  across the financial sector. CKYC is managed by CERSAI
                  (Central Registry of Securitization Asset Reconstruction and
                  Security Interest of India), which is authorized by the
                  Government of India to function as the Central KYC Registry
                  (CKYCR). CKYCR acts as a centralized repository of KYC records
                  of investors in the financial sector with uniform KYC norms
                  and inter-usability of the KYC records across the sector.
                </div>
                <div className={styles.CardFooter}>
                  <span onClick={() => setShowLearnMore(false)}>OKAY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CkycDialog;
