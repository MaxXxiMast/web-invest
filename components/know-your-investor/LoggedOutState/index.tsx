// NODE MODULES
import { useRouter } from 'next/router';
import Cookie from 'js-cookie';

// Components
import GenericModal from '../../user-kyc/common/GenericModal';
import Image from '../../primitives/Image';

// utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Styles
import styles from './LoggedOutState.module.css';

type LoggedOutStateProps = {
  openModal: boolean;
};

export default function LoggedOutState({ openModal }: LoggedOutStateProps) {
  const router = useRouter();

  const handleModalClick = () => {
    Cookie.set('redirectTo', '/persona-results');
    router.push('/login');
  };

  return (
    <GenericModal
      hideIcon
      hideClose
      showModal={openModal}
      handleBtnClick={handleModalClick}
      title="You are one step away to Know your Personality"
      btnText="Signup/Login to Unlock"
      wrapperExtraClass={styles.ModalWrapper}
      isShowBackDrop
    >
      <div className={`items-align-center-row-wise ${styles.BoxContainer}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}asset-details-content/kyi.gif`}
          alt="KYI Investor"
          width={290}
          height={92}
          layout={'fixed'}
        />
      </div>
    </GenericModal>
  );
}
