import React from 'react';

import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

import IconDialog from '../common/IconDialog';

type MyProps = {
  showDialog: boolean;
  styles?: any;
  onClickDialog: () => void;
};
const EmailUsDailog = (props: MyProps) => {
  const { styles = {} } = props;

  return (
    <>
      <IconDialog
        classes={{
          modalContainerClass: styles.CKYCModalMain,
          modalContentClass: styles.CKYCContentClass,
        }}
        showDialog={props.showDialog}
        iconUrl={`${GRIP_INVEST_BUCKET_URL}commons/emailV2.svg`}
        headingText={'Email Us'}
        onSubmit={props.onClickDialog}
        specialSubHeadingText={''}
        onCloseDialog={props.onClickDialog}
        id="email-us"
        subHeadingText=""
        hideBottomLine
        submitButtonText={'OKAY'}
      >
        <span className={styles.dialogContent}>
          To update your details, reach out to us at{' '}
          <a
            href="mailto:dezerve-help@gripinvest.in"
            target={'_blank'}
            rel="noreferrer"
          >
            dezerve-help@gripinvest.in
          </a>{' '}
        </span>
      </IconDialog>
    </>
  );
};

export default EmailUsDailog;
