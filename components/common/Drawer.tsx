import React from 'react';
import Drawer from '@mui/material/Drawer';
import classNames from 'classnames';

import { getObjectClassNames } from '../utils/designUtils';

import CloseLineIcon from '../assets/CloseLineIcon';

const classes: any = getObjectClassNames({
  bottomDrawer: {
    borderRadius: '12px 12px 0 0',
    padding: 15,
    zIndex: '999999999 !important',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  backDiv: {
    border: '2px solid #EAEDF1',
    width: 62,
    borderRadius: 10,
    position: 'absolute',
    top: -30,
    left: '50%',
    transform: ' translateX(-50%)',
  },
  closeButton: {
    cursor: 'pointer',
    padding: '6px 0',
    right: 25,
    position: 'absolute',
    top: 5,
  },
  bottomDiv: {
    border: '2px solid var(--gripWhiteLilac, #f7f7fc)',
    width: 134,
    borderRadius: 10,
    display: 'flex',
    alignSelf: 'center',
    opacity: 0,
  },
  closeBtn: {
    position: 'absolute',
    top: -30,
    background: 'var(--gripWhiteLilac, #f7f7fc)',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    right: 0,
  },
  iconCross: {
    background: '#e7e6e8',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    fontSize: 22,
    fontWeight: 'bold',
    color: 'var(--gripLuminousDar,#282c3f)',
    span: {
      fontWeight: 600,
    },
  },
});

type MyProps = {
  showDrawer: boolean;
  id: string;
  onCloseDrawer: () => void;
  mainDrawerClass?: any;
  bottomDrawerClass?: any;
  closeContainerClass?: any;
  topDrawerClass?: any;
  hideClose?: boolean;
  children?: React.ReactElement | React.ReactElement[] | string;
};

const GripDrawer: React.FC<MyProps> = (props) => {
  return (
    <Drawer
      anchor={'bottom'}
      transitionDuration={400}
      open={props.showDrawer}
      classes={{
        paperAnchorBottom: classNames(
          classes.bottomDrawer,
          props?.mainDrawerClass ?? ''
        ),
      }}
      id={props.id}
    >
      <div className={`flex justify-center ${props.closeContainerClass}`}>
        <div
          id={`${props.id}-top`}
          className={classNames(classes.backDiv, props.topDrawerClass)}
          onClick={props.onCloseDrawer}
        />

        <div
          className={classNames(classes.closeBtn)}
          onClick={props.onCloseDrawer}
        >
          <CloseLineIcon />
        </div>

        {!props.hideClose ? (
          <div className={classes.closeButton} onClick={props.onCloseDrawer}>
            <span className={classes.iconCross}>
              <span className="icon-cross" />
            </span>
          </div>
        ) : null}
      </div>

      {props.children}

      <div
        id={`${props.id}-bottom`}
        className={classNames(classes.bottomDiv, props.bottomDrawerClass)}
        onClick={props.onCloseDrawer}
      />
    </Drawer>
  );
};

export default GripDrawer;
