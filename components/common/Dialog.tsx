import React from 'react';
import classNames from 'classnames';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { getObjectClassNames } from '../utils/designUtils';
import { mediaQueries } from '../utils/designSystem';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

const classes: any = getObjectClassNames({
  dialogCloseIcon: {
    color: 'var(--gripGullGrey, #99A5B9)',
    fontSize: 24,
    cursor: 'pointer',
  },
  mainDialog: {
    boxShadow: '0px 8px 26px rgba(0, 0, 0, 0.08)',
    borderRadius: 16,
  },
  dialogTitle: {
    justifyContent: 'flex-end',
    display: 'flex',
    [mediaQueries.phone]: {
      padding: 16,
    },
    [mediaQueries.nonPhone]: {
      padding: '24px 24px 0px 24px',
    },
  },
  CloseIcon: {
    color: 'var(--gripLuminousDark, #282c3f)',
    fontSize: 30,
  },
});

type MyProps = {
  showDialog: boolean;
  onClose?: () => void;
  dialogTitleClass?: any;
  extraTitleComponent?: JSX.Element;
  mainDialogClass?: any;
  dialogActionComponent?: () => JSX.Element;
  bottomActionsClass?: any;
  dialogContentClass?: any;
  showDefaultClose?: boolean;
  closeIconClass?: any;
  hideCloseIcon?: boolean;
  children: JSX.Element;
  id: string;
};

const GripDialog: React.FC<MyProps> = (props) => {
  const isMobile = useMediaQuery();
  return (
    <Dialog
      id={props.id}
      open={props.showDialog}
      classes={{
        paper: classNames(classes.mainDialog, {
          [props?.mainDialogClass]: props?.mainDialogClass,
        }),
      }}
      maxWidth={false}
      fullScreen={isMobile}
    >
      <DialogTitle
        classes={{
          root: classNames(classes.dialogTitle, {
            [props?.dialogTitleClass]: props?.dialogTitleClass,
          }),
        }}
      >
        {props?.extraTitleComponent}
        {!props.hideCloseIcon ? (
          <span
            className={classNames(classes.dialogCloseIcon, {
              [props.closeIconClass]: props?.closeIconClass,
            })}
            style={
              props.showDefaultClose
                ? { position: 'absolute', top: 16, right: 16 }
                : {}
            }
            onClick={props.onClose}
          >
            <span className={`icon-cross ${classes.CloseIcon}`} />
          </span>
        ) : null}
      </DialogTitle>
      <DialogContent className={props?.dialogContentClass}>
        {props.children}
      </DialogContent>
      {props?.dialogActionComponent ? (
        <DialogActions
          classes={{
            root: props?.bottomActionsClass,
          }}
        >
          {props?.dialogActionComponent?.() ?? null}
        </DialogActions>
      ) : null}
    </Dialog>
  );
};

export default GripDialog;
