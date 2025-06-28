// NODE MODULES
import { useEffect, useState } from 'react';

// Components
import InputFieldSet from '../../common/inputFieldSet';
import Image from '../Image';
import MaterialModalPopup from '../MaterialModalPopup';
import Button from '../Button';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Styles
import styles from './PasswordProtectedPopup.module.css';

type PasswordProtectedPopupProps = {
  showPopup: boolean;
  onSubmit: (password: string) => void;
  hideCloseButton?: boolean;
  handleModalClose?: () => void;
};

export default function PasswordProtectedPopup({
  showPopup,
  onSubmit,
  hideCloseButton = true,
  handleModalClose = () => {},
}: PasswordProtectedPopupProps) {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!showPopup) {
      setPassword('');
    }
  }, [showPopup]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e?.target?.value);
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      hideClose={hideCloseButton}
      handleModalClose={handleModalClose}
      showModal={showPopup}
      className={`${styles.PasswordProtectedPopup}`}
    >
      <div className={`flex-column items-center`}>
        <div
          className={`items-align-center-row-wise justify-center ${styles.ImageContainer}`}
        >
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}commons/password_protected.svg`}
            alt="Password Protected"
            width={28}
            height={28}
            layout="fixed"
          />
        </div>
        <span className={styles.Heading}>
          Please enter the password of the file you just uploaded
        </span>
        <InputFieldSet
          label="Enter Password"
          inputId="password"
          type="text"
          onChange={handleChange}
          value={password}
          inputContainerClassName={styles.InputFieldSetPassword}
        />
        <Button width={'100%'} onClick={() => onSubmit(password)}>
          Confirm
        </Button>
      </div>
    </MaterialModalPopup>
  );
}
