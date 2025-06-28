// NODE MODULES
import React from 'react';

// Commpon Components
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import Image from '../../primitives/Image';
import Button, { ButtonType } from '../../primitives/Button';

// Utils
import { handleExtraProps } from '../../../utils/string';

// Styles
import styles from './GenericIconModal.module.css';

type BtnDetailsProps = {
  onClick: () => void;
  label: string;
  isLoading?: boolean;
};

type GenericIconModalProps = React.PropsWithChildren<{
  open: boolean;
  heading: string;
  subHeading: string;
  hideSecondary?: boolean;
  primaryBtnDetails: BtnDetailsProps;
  secondaryBtnDetails?: BtnDetailsProps;
  iconUrl?: string;
  classes?: Partial<{
    primaryBtnClass: string;
    modalClass: string;
    subHeadingClass: string;
  }>;
  hideClose?: boolean;
  onClose?: () => void;
}>;

function GenericIconModal(props: GenericIconModalProps) {
  const {
    open,
    children,
    hideSecondary = false,
    heading,
    subHeading,
    primaryBtnDetails,
    secondaryBtnDetails,
    iconUrl,
    classes,
    hideClose = false,
    onClose,
  } = props;

  const renderDetails = () => {
    return (
      <div
        className={`flex-column items-center justify-center ${styles.Container}`}
      >
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt="Warning"
            width={56}
            height={48}
            layout="fixed"
          />
        ) : null}

        <p className={styles.mainHeading}>{heading}</p>
        <p
          className={`${styles.description} ${handleExtraProps(
            classes?.subHeadingClass
          )}`}
        >
          {subHeading}
        </p>

        <Button
          width={'100%'}
          variant={ButtonType.Primary}
          className={handleExtraProps(classes?.primaryBtnClass)}
          onClick={primaryBtnDetails.onClick}
          isLoading={primaryBtnDetails.isLoading}
        >
          {primaryBtnDetails.label}
        </Button>
        {!hideSecondary ? (
          <Button
            width={'100%'}
            variant={ButtonType.Secondary}
            onClick={secondaryBtnDetails?.onClick}
          >
            {secondaryBtnDetails?.label}
          </Button>
        ) : null}
        {children}
      </div>
    );
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={open}
      className={`${styles.PrivateLinkModal} ${handleExtraProps(
        classes?.modalClass
      )}`}
      cardClass={styles.PrivateLinkModalCard}
      drawerExtraClass={styles.PrivateLinkMobileDrawer}
      hideClose={hideClose}
      handleModalClose={() => onClose?.()}
    >
      {renderDetails()}
    </MaterialModalPopup>
  );
}

export default GenericIconModal;
