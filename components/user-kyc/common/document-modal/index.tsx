// NODE MODULES
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Common Components
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import Button from '../../../primitives/Button';
import Image from '../../../primitives/Image';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import { trackEvent } from '../../../../utils/gtm';

// Styles
import classes from './DocumentModal.module.css';

const steps = [
  {
    header: 'PAN Card',
    subHeader: 'To verify your identity',
  },
  {
    header: 'Bank Details',
    subHeader: 'To verify your banking details',
  },
  {
    header: 'Demat Account Number',
    subHeader: 'To transfer securities when you invest on Grip',
  },
];

type Props = {
  isShowModal?: boolean;
  handleModalClose?: () => void;
};

export default function KycDocumentModal({
  isShowModal = false,
  handleModalClose,
}: Props) {
  // GET UserID
  const { userID = '' } = useSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );

  useEffect(() => {
    if (isShowModal) {
      trackEvent('pre_kyc_doc_required_popup', {
        userID: userID,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MaterialModalPopup
      handleModalClose={handleModalClose}
      showModal={isShowModal}
      className={classes.DocumentPopupContainer}
      drawerExtraClass={classes.DocumentPopupDrawer}
      isModalDrawer
    >
      <div>
        <div className={classes.ProfileImage}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/handy-documents.svg`}
            width={100}
            height={100}
            alt="Shield"
          />
        </div>
        <p className={classes.DocumentPopupHeader}>
          Please keep the following handy
        </p>
        <p className={classes.DocumentPopupSubHeader}>
          As required by SEBI, each investor must complete their KYC before
          investing. You’ll need to upload documents listed below to complete
          your KYC
        </p>
        <ul className={classes.list}>
          {steps.map((item) => {
            return (
              <li key={item.header}>
                <p className={classes.DocumnentPopupTitle}>{item.header}</p>
                <p className={classes.DocumnentPopupSubTitle}>
                  {item.subHeader}
                </p>
              </li>
            );
          })}
        </ul>
        <div className={`flex items-center ${classes.DocumentCertifiedLine}`}>
          <span className={`icon-shield-user ${classes.ShieldImage}`} />
          <p className={classes.DocumentCertifiedLineText}>
            All your data is secured by our ISO certified processes
          </p>
        </div>

        <Button className={classes.PopupConfirm} onClick={handleModalClose}>
          Start KYC
        </Button>
        <p className={classes.DocumentPopupFooter}>
          It will take just 2 mins from here
        </p>
      </div>
    </MaterialModalPopup>
  );
}
