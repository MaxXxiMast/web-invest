// Utils
import {
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Common Components
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';

// Styles
import classes from './Footer.module.css';

type FooterProps = {
  showMsg?: boolean;
  footerLinkText?: string;
  showButtons?: boolean;
  footerLinkJSX?: JSX.Element;
  isFooterBtnDisabled?: boolean;
  handleBtnClick?: () => void;
  isLoading?: boolean;
  renderOnlyButton?: boolean;
  subLink?: string;
  SubLinkClick?: () => void;
  isSubLinkDisable?: boolean;
  className?: string;
  CustomComponent?: React.FC;
};

const LayoutFooter = ({
  showMsg = true,
  footerLinkText = 'Verify and Proceed',
  isFooterBtnDisabled = false,
  showButtons = true,
  isLoading = false,
  handleBtnClick,
  renderOnlyButton = false,
  subLink = '',
  SubLinkClick,
  isSubLinkDisable = false,
  footerLinkJSX = null,
  className = '',
  CustomComponent = null,
}: FooterProps) => {
  const isMobile = useMediaQuery('(max-width: 992px)');

  const handleFooterBtnClick = () => {
    if (!isFooterBtnDisabled) {
      handleBtnClick?.();
    }
  };

  const renderButton = () => (
    <div className={`flex-column ${classes.ButtonContainer}`}>
      <Button
        width={'auto'}
        isLoading={!!isLoading}
        className={`${classes.Proceed} ${
          isFooterBtnDisabled ? classes.Disabled : ''
        }`}
        onClick={handleFooterBtnClick}
        disabled={Boolean(isFooterBtnDisabled)}
      >
        {footerLinkJSX ? (
          footerLinkJSX
        ) : (
          <>
            <span>{footerLinkText}</span>
            <Image
              src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/forwardIcon.svg`}
              width={20}
              height={20}
              alt="Arrow"
              layout="fixed"
            />
          </>
        )}
      </Button>
      {subLink ? (
        <Button
          variant={ButtonType.BorderLess}
          onClick={SubLinkClick}
          compact
          width={'auto'}
          className={isSubLinkDisable ? classes.DisableSubLink : ''}
        >
          {subLink}
        </Button>
      ) : null}
    </div>
  );

  if (!isMobile && renderOnlyButton) return renderButton();

  return (
    <>
      <div
        className={`flex-column ${classes.Footer} ${handleExtraProps(
          className
        )}`}
      >
        {CustomComponent && <CustomComponent />}
        {showButtons ? (
          <div
            className={`flex items-center ${classes.ProceedWrapper} ${
              !showMsg ? classes.NoBg : ''
            }`}
          >
            {showMsg ? (
              <span className={`${classes.Disclaimer} DisclaimerKYCFooter`}>
                By proceeding, you are giving consent to fetch your address
                details and share with KYC registration agencies.
              </span>
            ) : null}
            {renderButton()}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default LayoutFooter;
