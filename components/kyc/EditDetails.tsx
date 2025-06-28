import React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../redux';
import { trackEvent } from '../../utils/gtm';
import Button, { ButtonType } from '../primitives/Button';
import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';
import EmailUsDailog from './EmailUsDialog';
import { userData } from '../../redux/slices/user';

const classes: any = getObjectClassNames({
  button: {
    width: '127px !important',
    margin: '30px 0 !important',
    [mediaQueries.phone]: {
      margin: '16px 0 28px 0 !important',
    },
  },
  CKYCModalMain: {
    maxWidth: 400,
  },
  CKYCContentClass: {
    padding: '0px !important',
  },
  dialogContent: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '24px',
    color: 'var(--gripLuminousGrey)',
    fontFamily: 'var(--fontFamily) !important',
    '& > a': {
      textDecoration: 'underline',
      color: 'var(--gripBlue)',
    },
  },
});

type MyProps = {
  page: string;
  userData?: userData;
};

const EditDetails = (props: MyProps) => {
  const { page } = props;
  const [showDialog, setShowDailog] = React.useState(false);

  const onClickHandle = () => {
    setShowDailog(true);
    const { userID, emailID } = props.userData;
    trackEvent('Edit Kyc Details', {
      userID,
      emailID,
      page,
    });
  };

  return (
    <>
      <Button
        variant={ButtonType.Secondary}
        className={classes.button}
        onClick={onClickHandle}
      >
        Edit Details
      </Button>
      <EmailUsDailog
        showDialog={showDialog}
        onClickDialog={() => setShowDailog(false)}
        styles={classes}
      />
    </>
  );
};
const mapStateToProps = (state: RootState) => ({
  userData: state.user.userData,
});
const mapDispatchToProps = {};
const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(EditDetails);
