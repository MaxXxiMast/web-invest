//NODE MODULES
import Link from 'next/link';

//COMPONENTS
import MaterialModalPopup from '../primitives/MaterialModalPopup';
import Image from '../primitives/Image';
import Button, { ButtonType } from '../primitives/Button';

//UTILS
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

//STYLES
import styles from './AppDownloadModal.module.css';

const AppDownloadModal = ({ showModal, onClose }) => {
  const isMobile = useMediaQuery();
  const handleModalClose = () => {
    onClose?.();
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={showModal}
      className={styles.modalPopup}
      drawerExtraClass={styles.drawer}
      handleModalClose={handleModalClose}
      closeButtonClass={styles.closeButton}
    >
      <div className={`flex items-center justify-center ${styles.OuterDiv}`}>
        {!isMobile ? (
          <div className={`flex-column items-center justify-center`}>
            <div
              className={`flex-column items-center justify-center ${styles.Heading}`}
            >
              <span>Marketplace is available</span>
              <span>only on Grip App</span>
            </div>
            <div className={styles.ImageDiv}>
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}icons/gripDesktopDownload.svg`}
                alt="grip-download"
                layout="intrinsic"
                width={400}
                height={250}
                className={styles.AppDownloadImage}
              />
            </div>
          </div>
        ) : (
          <div className={`flex-column items-center justify-center`}>
            <div className={styles.ImageMobileDiv}>
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}icons/gripMobileDownload.svg`}
                alt="grip-download"
                layout="intrinsic"
                width={350}
                height={250}
                className={styles.AppDownloadImage}
              />
            </div>
            <div
              className={`flex-column items-center justify-center ${styles.Heading2}`}
            >
              <span>Marketplace is available</span>
              <span>only on Grip App</span>
            </div>
            <Link
              target={'_blank'}
              href="https://gripinvest.app.link/Website_Nav_Bar"
              className={`${styles.ButtonDiv}`}
            >
              <Button
                className={`${styles.PrimaryButton}`}
                variant={ButtonType.Primary}
              >
                Download to View Deal
              </Button>
            </Link>
          </div>
        )}
      </div>
    </MaterialModalPopup>
  );
};

export default AppDownloadModal;
