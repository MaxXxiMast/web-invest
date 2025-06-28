import React from 'react';
import RHP from 'react-html-parser';
import QuestionIcon from '../../components/assets/static/assetList/QuestionIcon.svg';

import Image from '../primitives/Image';
import MaterialModalPopup from '../primitives/MaterialModalPopup';

import { getObjectClassNames } from '../utils/designUtils';
import { mediaQueries } from '../utils/designSystem';

type PopupProps = {
  heading: string;
  data: string;
  handleOnSubmit: () => void;
  onCloseModal: () => void;
  isHTMLData?: boolean;
  className?: string;
};

const classes: any = getObjectClassNames({
  CardHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  ImageIcon: {
    width: '40px',
    height: '40px',
    background: 'var(--gripWhiteLilac, #f7f7fc)',
    borderRadius: '8px',
    marginRight: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Label: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '28px',
    color: 'var(--gripLuminousDark)',
  },
  CarsBody: {
    padding: '20px 0',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '24px',
    color: '#555770',
    margin: 0,
    a: {
      textDecoration: 'underline',
      color: 'var(--gripBlue)',
    },
  },
  CardFooter: {
    color: 'var(--gripBlue)',
    fontWeight: 800,
    fontSize: 12,
    lineHeight: '24px',
    textTransform: 'uppercase',
    textAlign: 'center',
    span: {
      cursor: 'pointer',
    },
  },
  closeButtonClass: {
    [mediaQueries.nonPhone]: {
      top: '30px !important',
    },
  },
  drawerClass: {
    [mediaQueries.phone]: {
      bottom: 0,
      transition: 'bottom 100ms',
    },
  },
});

const Popup = (props: PopupProps) => {
  const {
    heading,
    data,
    handleOnSubmit = () => {},
    isHTMLData = false,
    onCloseModal,
    className = '',
  } = props;
  const renderDetails = () => {
    return (
      <div className={classes.HowItWorks}>
        <div className={classes.CardHeader}>
          <span className={classes.ImageIcon}>
            <Image src={QuestionIcon.src} alt="QuestionIcon" />
          </span>
          <span className={classes.Label}>{heading}</span>
        </div>
        <div className={classes.CarsBody}>{isHTMLData ? RHP(data) : data}</div>
        <div className={classes.CardFooter}>
          <span onClick={() => handleOnSubmit()}>Okay</span>
        </div>
      </div>
    );
  };

  return (
    <MaterialModalPopup
      showModal
      isModalDrawer
      handleModalClose={onCloseModal}
      closeButtonClass={classes.closeButtonClass}
      drawerExtraClass={classes.drawerClass}
      className={className}
    >
      {renderDetails()}
    </MaterialModalPopup>
  );
};

export default Popup;
