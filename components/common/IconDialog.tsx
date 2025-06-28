import classNames from 'classnames';
import Button, { ButtonType } from '../primitives/Button';
import GripDrawer from './Drawer';
import GripDialog from './Dialog';
import ArrowButton from '../primitives/ArrowButton';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

import { classes } from './IconDialogStyle';
import Image from '../primitives/Image';

type MyProps = {
  showDialog: boolean;
  iconUrl?: string;
  headingText: string;
  subHeadingText: string;
  onCloseDialog?: () => void;
  id: string;
  submitButtonText?: string;
  specialSubHeadingText?: string;
  onSubmit?: () => void;
  isLoadingButton?: boolean;
  classes?: Partial<{
    detailsContainer: any;
    modalContainerClass: any;
    modalContentClass: any;
  }>;
  hideCloseIcon?: boolean;
  children?: any;
  buttonType?: ButtonType.Inverted | ButtonType.NavMenu | ButtonType.Primary;
  isArrowButton?: boolean;
  hideBottomLine?: boolean;
  textAlign?:
    | 'start'
    | 'end'
    | 'left'
    | 'right'
    | 'center'
    | 'justify'
    | 'match-parent';
};

function IconDialog(props: MyProps) {
  const isMobile = useMediaQuery();

  const { textAlign } = props;
  const renderDetails = () => {
    return (
      <div
        className={`flex-column ${classNames(classes.dialogWrapper, {
          [props.classes?.detailsContainer]: Boolean(
            props.classes?.detailsContainer
          ),
          [classes?.modalContentClass]: Boolean(
            props.classes?.modalContentClass
          ),
          [classes.dialogDetailsContainer]: Boolean(props.hideCloseIcon),
        })}`}
      >
        {props.iconUrl ? (
          <Image 
            src={props.iconUrl} 
            className={classes.dialogIcon} 
            alt="icon"
            layout={'intrinsic'}
            width={72}
            height={72}
          />
        ) : null}
        <text className={classes.dialogMainTitle}>{props.headingText}</text>
        <text
          className={classes.dialogSubHeading}
          style={{ textAlign: textAlign || 'center' }}
        >
          {props.subHeadingText}{' '}
          <span className={classes.specialHeadingText}>
            {props.specialSubHeadingText || props.children}
          </span>
        </text>
        {props.isLoadingButton ? (
          props.isArrowButton ? (
            <ArrowButton
              ArrowrotateAngle="0"
              className={classes.connectNow}
              isAnimatedArrow={false}
              onClick={() => props?.onSubmit?.()}
              hideBottomLine={props?.hideBottomLine}
            >
              {props.submitButtonText || ''}
            </ArrowButton>
          ) : (
            <Button
              className={classNames(classes.submitButtonText)}
              onClick={() => props?.onSubmit?.()}
              variant={props?.buttonType || ButtonType.Primary}
            >
              {props.submitButtonText || ''}
            </Button>
          )
        ) : (
          <text className={classes.textButton} onClick={props.onSubmit}>
            {props.submitButtonText}
          </text>
        )}
      </div>
    );
  };

  const onCloseDialog = () => {
    props.onCloseDialog?.();
  };

  const renderMobile = () => {
    return (
      <GripDrawer
        showDrawer={props.showDialog}
        id={props.id}
        onCloseDrawer={onCloseDialog}
      >
        {renderDetails()}
      </GripDrawer>
    );
  };

  const renderDesktop = () => {
    return (
      <GripDialog
        id={props.id}
        mainDialogClass={classNames(props.classes?.modalContainerClass)}
        dialogContentClass={classNames(props.classes?.modalContentClass)}
        onClose={onCloseDialog}
        showDialog={props.showDialog}
        hideCloseIcon={props.hideCloseIcon}
      >
        {renderDetails()}
      </GripDialog>
    );
  };

  const renderChildren = () => {
    return isMobile ? renderMobile() : renderDesktop();
  };

  return renderChildren();
}

export default IconDialog;
