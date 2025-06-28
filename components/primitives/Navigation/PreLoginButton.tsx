import Button, { ButtonType } from '../Button';
import ReferEarnBtn from './ReferEarnBtn';
import classes from './Navigation.module.css';

type Props = {
  showLogoutBtn?: boolean;
  showLoginBtn?: boolean;
  handleLoginSignupClick?: () => void;
  handleLogoutClick?: () => void;
  showReferral?: boolean;
};

const PreLoginButton = ({
  showLogoutBtn = false,
  showLoginBtn = true,
  handleLoginSignupClick = () => {},
  handleLogoutClick = () => {},
  showReferral = false,
}: Props) => {
  const RenderButtons = () => {
    const openReferPage = () => {
      window.open(`/referral`, '_self');
    };
    if (showLogoutBtn) {
      return (
        <Button
          variant={ButtonType.Secondary}
          onClick={handleLogoutClick}
          compact
          width={'auto'}
        >
          Log Out
        </Button>
      );
    }
    if (showLoginBtn) {
      return (
        <>
          {showReferral ? (
            <ReferEarnBtn handleBtnClickEvent={openReferPage} />
          ) : null}
          <Button
            compact
            width={'auto'}
            variant={ButtonType.SecondaryLight}
            onClick={handleLoginSignupClick}
            className={classes.HideInMobile}
          >
            Login
          </Button>
          <Button
            compact
            variant={ButtonType.Secondary}
            width={'auto'}
            onClick={handleLoginSignupClick}
            className={classes.HideInMobile}
          >
            Sign Up
          </Button>
          {/* MOBILE LOGIN BUTTONS */}
          <Button
            onClick={handleLoginSignupClick}
            variant={ButtonType.Inverted}
            width={'100%'}
            compact
            className={classes.HideInDesktop}
          >
            Login / Sign Up
          </Button>
        </>
      );
    }
    return null;
  };
  return (
    <div className={`${classes.PreLoginWidgets} flex_wrapper`}>
      {RenderButtons()}
    </div>
  );
};

export default PreLoginButton;
