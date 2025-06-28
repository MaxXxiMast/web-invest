import React from 'react';
import { connect } from 'react-redux';
import {
  GRIP_INVEST_BUCKET_URL,
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
} from '../../utils/string';
import Image from '../primitives/Image';
import { getObjectClassNames } from '../utils/designUtils';
import MaterialModalPopup from '../primitives/MaterialModalPopup';
import Button, { ButtonType } from '../primitives/Button';
import { mediaQueries } from '../utils/designSystem';
import { getDocumentStatus } from '../assetDetails/utils';
import { RootState } from '../../redux';
import { setSelected } from '../../redux/slices/assets';

const classes: any = getObjectClassNames({
  DiwaliModal: {
    padding: 0,
    overflow: 'hidden',
    maxWidth: 400,
    margin: '0 auto',
    width: 'auto',
    img: {
      maxWidth: '100%',
      position: 'relative !important',
      width: 'auto !important',
      height: 'auto !important',
    },
    '.CloseBtn': {
      zIndex: 1,
    },
  },

  WithImage: {
    position: 'relative',
    lineHeight: 0,
    span: {
      padding: '0 !important',
    },
  },
  SubmitCTA: {
    width: '100% !important',
    padding: '0 5px !important',
    position: 'absolute',
    zIndex: 1,
    bottom: 20,
    maxWidth: 'calc(100% - 45px)',
    left: '50%',
    transform: 'translateX(-50%)',
    span: {
      fontSize: 13,
      span: {
        verticalAlign: 'middle',
        marginLeft: '5px !important',
      },
    },
  },
  CloseBtn: {
    [mediaQueries.phone]: {
      top: 15,
      right: 10,
      background: 'transparent',
    },
  },
});

const statusArr = ['Pending', 'Rejected'];

const DiwaliJackpotModal = (props: any) => {
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setShowModal(true);
    }, 2000);
  }, []);

  const handleModalBtnClick = () => {
    props.setSelected({
      financeProductType: 'Bonds',
    });
    window.open('kyc', '_self', 'noopener');
  };

  const handleCMRCheck = () => {
    return statusArr.includes(
      getDocumentStatus(props?.userData?.kycDetails, 'depository')
    );
  };

  const handleModalClose = () => {
    setShowModal(false);
    localStorage.setItem('isDiwaliModalClose', 'true');
  };

  return (
    <MaterialModalPopup
      cardClass={classes.DiwaliModal}
      mainClass={classes.CardInner}
      isModalDrawer={false}
      showModal={showModal}
      drawerExtraClass={classes.DiwaliModal}
      handleModalClose={handleModalClose}
      closeButtonClass={classes.CloseBtn}
    >
      <div className={classes.DiwaliModal}>
        <div className={classes.WithImage}>
          {handleCMRCheck() ? (
            <>
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}miscellaneous/popup.png`}
                alt="Diwali Jackpot"
              />
              <Button
                className={`flex justify-center items-center ${classes.SubmitCTA}`}
                variant={ButtonType.Primary}
                onClick={handleModalBtnClick}
              >
                <>
                  Add your Demat Account details
                  <Image
                    src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/forwardIcon.svg`}
                    width={20}
                    height={20}
                    layout={'fixed'}
                    alt="forwardIcon"
                  />
                </>
              </Button>
            </>
          ) : (
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}miscellaneous/popup-2.png`}
              alt="Diwali Jackpot"
            />
          )}
        </div>
      </div>
    </MaterialModalPopup>
  );
};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  setSelected,
};

export default connect(mapStateToProps, mapDispatchToProps)(DiwaliJackpotModal);
