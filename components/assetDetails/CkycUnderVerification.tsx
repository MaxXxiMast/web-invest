import React from 'react';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { getObjectClassNames } from '../utils/designUtils';
import Image from '../primitives/Image';

const classes: any = getObjectClassNames({
  mainContainer: {
    borderRadius: '0px 0px 8px 8px',
    padding: ' 16px 24px',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid var(--gripLightStroke)',
  },
  imageContainer: {
    height: 24,
    width: 24,
    marginRight: 8,
  },
  text: {
    fontWeight: 400,
    fontSize: 12,
    lineHeight: '20px',
    color: '#7C8696',
    ' & > span': {
      color: 'var(--gripBlue)',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
  boldText: {
    fontWeight: 800,
  },
});
type MyProps = {
  showLearnMore: (val: boolean) => void;
};

function CKYCUnderVerificationSideBar(props: MyProps) {
  return (
    <div className={`flex ${classes.mainContainer}`}>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}dealsV2/kyc_under_verification.svg`}
        className={classes.imageContainer}
        alt="kyc verification image"
        width={24}
        height={24}
        layout={'intrinsic'}
      />
      <div className={classes.text}>
        You’re not CKYC verified, hence according to SEBI mandate you’re not
        allowed to invest&nbsp;
        <span onClick={() => props.showLearnMore(true)}> Learn More</span>.
      </div>
    </div>
  );
}

export default CKYCUnderVerificationSideBar;
