import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';

import GripDrawer from '../Drawer';
import Image from '../../../design-systems/components/Image';
import GripDialog from '../Dialog';
import { classes } from './DialogModalStyle';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

type DialogModalProps = {
  id: string;
  showDialog: boolean;
  specialSubHeadingText: string;
  onCloseDialog: () => void;
  submitButtonText?: string;
  onSubmit?: () => void;
  headingText?: string;
  mobileHeadingText?: string;
  desktopClass?: Partial<{
    heading: any;
    title: any;
    content: any;
  }>;
  mobileClass?: Partial<{
    title: any;
    heading: any;
  }>;
  removeTitleBorder?: boolean;
  titleHeadURL?: string;
};

function DialogModal(props: PropsWithChildren<DialogModalProps>) {
  const {
    showDialog,
    headingText,
    submitButtonText,
    onSubmit,
    specialSubHeadingText,
    onCloseDialog,
    id,
    mobileHeadingText,
    children,
    titleHeadURL,
  } = props;
  const isMobile = useMediaQuery();

  const renderMobile = () => {
    return (
      <GripDrawer
        showDrawer={showDialog}
        id={id}
        onCloseDrawer={onCloseDialog}
        bottomDrawerClass={classes.bottomDrawerClass}
        closeContainerClass={classes.closeContainerClass}
        topDrawerClass={classes.topDrawerClass}
      >
        <div
          className={`flex-column ${classNames(
            classes.drawerHeading,
            props?.mobileClass?.heading
          )}`}
        >
          <div className={classes.topHeading}>{specialSubHeadingText}</div>
          <div className={classes.bottomHeading}>{mobileHeadingText}</div>
        </div>

        <div className={classes.contentContainer}>{children}</div>

        {submitButtonText ? (
          <div className={`flex ${classes.bottomDiv}`} onClick={onSubmit}>
            <div className={classes.investButton}>{submitButtonText}</div>
          </div>
        ) : (
          <></>
        )}
      </GripDrawer>
    );
  };

  const renderDesktop = () => {
    return (
      <GripDialog
        id={id}
        showDialog={showDialog}
        dialogTitleClass={classNames(classes.dialogTitle, {
          [props.desktopClass?.title]: props.desktopClass?.title,
          [classes.removeTitleBorder]: props?.removeTitleBorder,
        })}
        mainDialogClass={classNames(classes.consentMainDialog, {
          [props.desktopClass?.heading]: props?.desktopClass?.heading,
        })}
        dialogContentClass={classNames(
          classes.dialogContent,
          props?.desktopClass?.content
        )}
        extraTitleComponent={
          <div className="items-align-center-row-wise">
            {titleHeadURL ? (
              <Image
                src={titleHeadURL}
                className={classes.headingIcon}
                alt="headlogo"
              />
            ) : null}
            <div>
              <span className={classes.specialHeadingText}>
                {specialSubHeadingText}
              </span>{' '}
              {headingText}
            </div>
          </div>
        }
        bottomActionsClass={classes.bottomActionsClass}
        onClose={onCloseDialog}
      >
        {<>{children}</>}
      </GripDialog>
    );
  };

  const renderChildren = () => {
    return isMobile ? renderMobile() : renderDesktop();
  };
  return renderChildren();
}

export default DialogModal;
