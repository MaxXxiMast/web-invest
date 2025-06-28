import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import Button, { ButtonType } from '../../../primitives/Button';
import Image from '../../../primitives/Image';

import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';

import styles from './NRIModal.module.css';

type NRIModalProps = {
  showModal: boolean;
  onCloseModal: () => void;
};

function NRIModal({ showModal, onCloseModal }: NRIModalProps) {
  const onClickExplore = () => {
    const url = `${window.location.origin}/assets#active#startupequity`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={showModal}
      hideClose
      cardClass={styles.ModalPopupCard}
      drawerExtraClass={styles.NRIModalDrawer}
    >
      <div className={`flex justify-between items-center ${styles.secondary}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/world-logo.svg`}
          width={64}
          height={64}
          layout="intrinsic"
          alt={'World Logo'}
        />
        <div className={styles.arrowContainer}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/orange-lock.svg`}
            width={32}
            height={32}
            layout="intrinsic"
            alt={'Lock'}
          />
        </div>
        <div className={styles.DebtMarketText}>Indian Debt Market</div>
      </div>
      <div>
        <span className={styles.HeadingText}>
          Unfortunately NRIs are not allowed to invest in the Indian Debt Market
        </span>
        <div className={`flex-column ${styles.SubHeadingText}`}>
          <span>
            Unfortunately under SEBI guidelines, NRIs are not currently allowed
            to invest in debt offerings. We are working to address this at the
            earliest.
          </span>
          <span>
            NRIs can invest in non-debt offerings like Startup Equity and
            Commercial Property on Grip.
          </span>
        </div>
      </div>
      <div className={`flex ${styles.ButtonsContainer}`}>
        <Button
          width={'100%'}
          variant={ButtonType.Inverted}
          className={styles.RightBtn}
          onClick={onClickExplore}
        >
          Explore NRI Approved Opportunities
        </Button>
        <Button
          variant={ButtonType.Primary}
          width={'100%'}
          onClick={onCloseModal}
          className={styles.RightBtn}
        >
          Please let me know once I can invest
        </Button>
      </div>
    </MaterialModalPopup>
  );
}
export default NRIModal;
