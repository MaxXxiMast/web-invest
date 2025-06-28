// NODE MODULES
import { PropsWithChildren } from 'react';

// Common Components
import Button, { ButtonType } from '../../../primitives/Button';
import Image from '../../../primitives/Image';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import StyledLink from '../StyledLink';
import LottieModal from './LottieModal';

// Contexts
import { useKycContext } from '../../../../contexts/kycContext';

// Utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../../utils/string';

// Styles
import classes from './GenericModal.module.css';

type Props = {
  showModal?: boolean;
  title?: any;
  subtitle?: string;
  Content?: any;
  icon?: string;
  lottieType?: string;
  btnText?: string;
  btnVariant?:
    | 'Primary'
    | 'PrimaryLight'
    | 'Secondary'
    | 'SecondaryLight'
    | 'Disabled';
  isModalDrawer?: boolean;
  hideClose?: boolean;
  className?: string;
  wrapperExtraClass?: string;
  BtnContainerExtraClass?: string;
  drawerExtraClass?: string;
  handleBtnClick?: () => void;
  handleModalClose?: () => void;
  hideIcon?: boolean;
  iconHeight?: number;
  iconWidth?: number;
  customIcon?: () => React.ReactNode;
  BtnSecVariant?: string;
  btnSecText?: string;
  handleSecBtnClick?: () => void;
  styledLink?: {
    title: string;
    onClick: () => void;
  };
  Footer?: any;
  isShowBackDrop?: boolean;
};

const GenericModal = ({
  showModal = false,
  title,
  subtitle,
  Content,
  icon = '',
  lottieType = '',
  btnText = '',
  btnVariant = 'Primary',
  isModalDrawer = true,
  hideClose = true,
  className = '',
  drawerExtraClass = '',
  handleBtnClick,
  handleModalClose,
  hideIcon = false,
  iconHeight = 56,
  iconWidth = 56,
  customIcon,
  BtnSecVariant = 'Primary',
  handleSecBtnClick,
  btnSecText = '',
  children,
  styledLink = null,
  Footer = null,
  wrapperExtraClass = '',
  BtnContainerExtraClass = '',
  isShowBackDrop = false,
}: PropsWithChildren<Props>) => {
  const { kycValues } = useKycContext();
  const isMobile = kycValues?.isMobile;

  const sizeIcon = isMobile ? 56 : 72;

  const renderIcon = () => {
    if (hideIcon) {
      return null;
    }

    return (
      customIcon?.() ?? (
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/${icon || 'scan.svg'}`}
          alt={'status_info'}
          width={iconWidth ? iconWidth : sizeIcon}
          height={iconHeight ? iconHeight : sizeIcon}
          layout="fixed"
        />
      )
    );
  };

  return (
    <MaterialModalPopup
      hideClose={hideClose}
      showModal={showModal}
      isModalDrawer={isModalDrawer}
      className={`${classes.Modal} ${handleExtraProps(className)}`}
      handleModalClose={handleModalClose}
      drawerExtraClass={`${handleExtraProps(drawerExtraClass)}`}
      isShowBackDrop={isShowBackDrop}
    >
      <div
        className={`flex-column ${classes.Wrapper} ${handleExtraProps(
          wrapperExtraClass
        )}`}
      >
        {lottieType ? LottieModal({ lottieType }) : renderIcon()}
        <h3>{title}</h3>
        {children}
        {subtitle && <p>{subtitle}</p>}
        {styledLink && (
          <StyledLink title={styledLink.title} onClick={styledLink.onClick} />
        )}
        {Content && <Content />}
        <div
          className={`${classes.BtnContainer} ${handleExtraProps(
            BtnContainerExtraClass
          )}`}
        >
          {btnText && (
            <Button
              width={'100%'}
              onClick={handleBtnClick}
              variant={ButtonType[btnVariant]}
            >
              {btnText}
            </Button>
          )}
          {btnSecText && (
            <Button
              width={'100%'}
              onClick={handleSecBtnClick}
              variant={ButtonType[BtnSecVariant]}
            >
              {btnSecText}
            </Button>
          )}
        </div>
        {Footer && <Footer />}
      </div>
    </MaterialModalPopup>
  );
};

export default GenericModal;
