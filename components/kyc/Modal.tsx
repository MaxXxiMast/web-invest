import desktopStyles from '../../styles/ProfileKYC.module.css';
import Image from '../primitives/Image';
import mobileStyles from '../../styles/ProfileKYCMobile.module.css';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

type ModalProps = {
  data: any;
  closeModal: () => void;
  showModal: boolean;
  isBottomModal?: boolean;
  children?: any;
  className?: any;
};

const Modal = (props: ModalProps) => {
  const isMobile = useMediaQuery();
  const { data, isBottomModal, closeModal, showModal, children, className } =
    props;
  const styles = isMobile ? mobileStyles : desktopStyles;
  return (
    <>
      <div
        onClick={closeModal}
        className={`${styles.modalContainer}`}
        style={{
          opacity: showModal ? 0.15 : 0,
          transform: showModal ? 'scale(1)' : 'scale(0.8)',
          zIndex: showModal ? 10 : -1,
        }}
      />
      {children}
      {!isBottomModal ? (
        <div
          className={`${styles.modal} ${className}`}
          style={{
            opacity: showModal ? 1 : 0,
            transform: showModal ? 'scale(1)' : 'scale(0.1)',
            zIndex: showModal ? 11 : -1,
          }}
        >
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}${data?.icon}`}
            layout={'fixed'}
            width={72}
            height={72}
            alt='datalogo'
          />
          <div className={styles.modalTitle}>{data?.title}</div>
          <div className={styles.modalSubtitle}>{data?.subTitle}</div>
        </div>
      ) : null}
      {isBottomModal && !isMobile ? (
        <div
          className={styles.bottomModal}
          style={{
            opacity: showModal ? 1 : 0,
            transform: showModal ? 'scale(1)' : 'scale(0.1)',
            zIndex: showModal ? 11 : -1,
          }}
        >
          <Image
            src={data?.icon}
            layout={'fixed'}
            width={40}
            height={40}
            alt="datalogo"
          />
          <div className={styles.bottomContent}>
            <div style={{ marginTop: 0 }} className={styles.modalTitle}>
              {data?.title}
            </div>
            <div className={styles.modalSubtitle}>{data?.subTitle}</div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Modal;
