import React from 'react';
import dompurify from 'dompurify';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';

import Button from '../../../components/primitives/Button';

import  classes from './TermAndConditionsConsent.module.css';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

type MyProps = {
  heading: string;
  subHeading: string;
  values: string;
  onSubmit: () => void;
  type: string;
  showMobileDialog: boolean;
  onCloseDrawer: () => void;
  noteText?: string;
  onChange?: () => void;
  checkedItems?: string[];
};

function TermAndConditionsConsent(props: MyProps) {
  const isMobile = useMediaQuery();

  const sanitizer = dompurify.sanitize;
  // Split the &amp; seperated values in the
  const options = props.values.split('&amp;').map((value) => ({
    label: value,
    value: value,
  }));

  const renderContent = (type: string = '') => {
    switch (type) {
      case 'checkbox':
        return (
          <FormGroup>
            {options.map(({ value }, index) => {
              return renderCheckbox(value, index);
            })}
          </FormGroup>
        );
      case 'text':
        return (
          <div className='flex-column'>
            {options.map(({ value }, index) => {
              return renderText(value, index);
            })}
          </div>
        );
      default:
        return null;
    }
  };

  const renderForDesktop = () => (
    <div className={`flex-column ${classes.mainContainer}`}>
      <text className={classes.topHeading}>
        {props.heading}
        <span
          className={classes.bottomHeading}
        >{` (${props.subHeading})`}</span>
      </text>
      <div className={classes.scrollContainer}>
        <div className={`flex ${classes.consentDetailsContainer}`}>
          {renderContent(props?.type)}
        </div>
      </div>
      <div className='flex items-center'>
        <Button onClick={props.onSubmit}>Ok, I Understand</Button>

        {props.noteText ? (
          <text className={classes.noteContainer}>
            <span className={classes.noteHeading}>Note:</span> {props.noteText}
          </text>
        ) : null}
      </div>
    </div>
  );

  const renderCheckbox = (value: string, index: number) => {
    return (
      <FormControlLabel
        key={`tnc-checkbox-${index}`}
        value={value}
        control={
          <Checkbox
            className={classes.radioButton}
            checked={props.checkedItems?.includes(value)}
            onChange={props.onChange}
            classes={{
              root: classes.checkboxRoot,
            }}
            sx={{
              '&.Mui-checked': {
                color: '#00357c',
              },
            }}
          />
        }
        label={
          <text
            className={classes.contentText}
            dangerouslySetInnerHTML={{
              __html: sanitizer(value),
            }}
          />
        }
      />
    );
  };

  const renderText = (value: string, index: number) => {
    return (
      <text
        key={`tnc-text-${index}`}
        className={classes.contentText}
        dangerouslySetInnerHTML={{
          __html: sanitizer(value),
        }}
      />
    );
  };

  const renderForMobile = () => {
    return (
      <>
        <div className={classes.TermsContainer}>
          <div className={`flex-column ${classes.drawerHeading}`}>
            <text className={classes.topHeading}>{props.heading}</text>
            <text className={classes.bottomHeading}>{props.subHeading}</text>
          </div>
          <div className={classes.contentContainer}>
            {renderContent(props?.type)}
          </div>
          <div className={classes.bottomDiv}>
            <Button onClick={props.onSubmit}>Ok, I Understand</Button>
          </div>
        </div>
      </>
    );
  };

  const renderChildren = () => {
    return isMobile ? renderForMobile() : renderForDesktop();
  };

  return renderChildren();
}

export default TermAndConditionsConsent;
