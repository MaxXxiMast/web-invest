import React from 'react';
import classNames from 'classnames';
import RHP from 'react-html-parser';
import CircularProgress from '@mui/material/CircularProgress';

import type { getFormValues, onChangeFuncs } from './types';

import Image from '../primitives/Image';

import InputFieldSet from '../common/inputFieldSet';
import UploadButton from '../common/UploadButton';
import Radio from '../common/Radio';
import TextArea from '../common/TextArea';
import GripSelect from '../common/GripSelect';

import mobileStyles from '../../styles/KYCFormMobile.module.css';
import desktopStyles from '../../styles/KYCForm.module.css';

import { KYC_FILE_TYPES } from '../../utils/kyc';
import { GRIP_INVEST_BUCKET_URL, capitalize } from '../../utils/string';

import { dinNo, hideFields } from '../../pages_utils/others';

import { kycFormClasses as classes } from './formClasses';
import TooltipCompoent from '../primitives/TooltipCompoent/TooltipCompoent';
import { inputWithInfoIcon } from './constants';
import EditDetails from './EditDetails';
import FindCMR from './FindCMR';
import Popup from '../common/Popup';
import Button, { ButtonType } from '../primitives/Button';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

type KYCForm = {
  step: number;
  data: any;
  onChangeFunctions: onChangeFuncs;
  getFormValues: getFormValues;
  formError: string;
  isMultipleForms: boolean;
  showEditDetails?: boolean;
  id: string;
  handleOtherBrokerModal?: (id: string) => void;
  className?: string;
};

const Form = (props: KYCForm) => {
  const isMobile = useMediaQuery();
  const [showhintModal, setShowHintModal] = React.useState({
    title: '',
    content: '',
  });

  const {
    step,
    data,
    onChangeFunctions,
    getFormValues,
    formError,
    isMultipleForms,
    showEditDetails = false,
    id,
    className = '',
  } = props;
  const styles = isMobile ? mobileStyles : desktopStyles;

  const getOnChange = (id: string) => {
    return onChangeFunctions?.[id];
  };

  const getValues = (id: string) => {
    return getFormValues(id);
  };

  const renderComponents = (formField: any, hideDetails: string[] = []) => {
    const isPreData = data?.isPreData;
    const isCMR = step === 4;
    const isOthersDetails = step === 3;
    const width = isOthersDetails ? '60%' : '100%';
    return (
      <>
        <div
          className={`flex ${classNames(
            classes.fields,
            formField?.fieldLayoutClass,
            {
              [classes.otherDetails]: isOthersDetails,
              [classes.cmrFieldsPre]: isCMR && isPreData,
            }
          )}`}
          style={{
            width: isMobile ? '100%' : width,
          }}
        >
          {formField?.fields?.map((field: any) => {
            if (hideDetails?.includes(field?.id))
              return <React.Fragment key={`kyc-form-feild${field?.id}`} />;
            switch (field?.type) {
              case 'Upload':
                return (
                  <React.Fragment key={`kyc-form-feild${field?.id}`}>
                    {renderUploadField(field)}
                  </React.Fragment>
                );
              case 'Input':
                return field?.id === 'tin' ? (
                  <React.Fragment key={`kyc-form-feild${field?.id}`}>
                    {renderTinNumber(field)}
                  </React.Fragment>
                ) : (
                  <React.Fragment key={`kyc-form-feild${field?.id}`}>
                    {renderInputField(field)}
                  </React.Fragment>
                );
              case 'Select':
                return (
                  <React.Fragment key={`kyc-form-feild${field?.id}`}>
                    {renderSelectField(field)}
                  </React.Fragment>
                );
              case 'radio':
                return field?.id === 'din' ? (
                  <React.Fragment key={`kyc-form-feild${field?.id}`}>
                    {renderDINNumber(field)}
                  </React.Fragment>
                ) : (
                  <React.Fragment key={`kyc-form-feild${field?.id}`}>
                    {renderRadioButton(field)}
                  </React.Fragment>
                );
              case 'text':
                return (
                  <React.Fragment key={`kyc-form-feild${field?.id}`}>
                    {renderTextField(field)}
                  </React.Fragment>
                );
              case 'textarea':
                return (
                  <React.Fragment key={`kyc-form-feild${field?.id}`}>
                    {renderTextArea(field)}
                  </React.Fragment>
                );
              case 'default':
                return <React.Fragment key={`kyc-form-feild${field?.id}`} />;
            }
          })}
        </div>
      </>
    );
  };

  const renderMultipleForms = () => {
    const formFields = data?.formData;
    return formFields?.map(renderForm);
  };

  const renderOtherDetails = () => {
    const formFields = data?.formData;

    const elementsForRender = formFields?.[0]?.fields?.slice(0, 2);
    const formData = {
      fields: elementsForRender,
    };
    return (
      <div className="flex">
        {renderProfileImage()}
        <div className={`flex ${classes.otherDetailsComponents}`}>
          {renderComponents(formData)}
        </div>
      </div>
    );
  };

  const renderCMR = () => {
    return <FindCMR handleOtherBrokerModal={props.handleOtherBrokerModal} />;
  };

  const renderForm = (formField: any) => {
    const isOthersDetails = step === 3;
    const title = formField?.title;
    const subTitle = formField?.subTitle;
    const isCMRPage = step === 4;
    const isPreData = data?.isPreData;
    const description = formField?.description;
    const formDataHint = formField?.formDataHint || {};
    const titleClass = formField?.titleClass || '';
    const hint = formField?.hint;
    const isAccredited = getFormValues('accredited');
    const hideDetails =
      isOthersDetails && isMobile && isAccredited ? hideFields : [];
    const hintData = formField?.fields?.filter((ele: any) => {
      return ele.type === 'Hint';
    });
    return (
      <div
        className={classNames(classes.form, {
          [classes.subTitlePresentForm]: Boolean(subTitle),
        })}
      >
        {title && renderTitle(title, formDataHint, titleClass)}
        {hint && renderHint(hint)}
        {subTitle && <div className={classes.subTitle}>{subTitle}</div>}
        {description && (
          <div
            className={classNames(classes.description, {
              [classes.descriptionWithTitle]: Boolean(title),
            })}
          >
            {description}
          </div>
        )}
        {hintData.length > 0 &&
          renderHint(hintData?.[0].hint, classes.HintData)}
        <div className={classes.fieldsContainer}>
          {isOthersDetails && !isMobile ? renderProfileImage() : null}
          {isOthersDetails && isMobile && isAccredited
            ? renderOtherDetails()
            : null}
          {renderComponents(formField, hideDetails)}
          {isCMRPage && isPreData ? renderCMR() : null}
        </div>
      </div>
    );
  };

  const renderTextArea = (field: any) => {
    return (
      <TextArea
        labelText={field?.title}
        value={getValues(field?.id)}
        onChange={getOnChange(field?.id)}
        error={''}
        multiline
        classes={field?.classes || {}}
        disabled={Boolean(getFormValues('disable'))}
      />
    );
  };

  const renderTinNumber = (field: any) => {
    const isNRI = getFormValues('residentialStatus') === 'nri';
    return isNRI ? renderInputField(field) : null;
  };

  const renderTextField = (field: any) => {
    const isHide = field?.hideWhenTrue?.some(
      (val: string) => Boolean(getFormValues(val)) === true
    );
    return !isHide ? (
      <div
        className={classNames(classes.radioTitle, {
          [classes.clickableText]: Boolean(field?.clickable),
        })}
        onClick={() => getOnChange(field.id)}
      >
        {field.title}
      </div>
    ) : null;
  };

  const renderDINNumber = (field: any) => {
    const hasDin = getFormValues('din');
    return (
      <>
        {renderRadioButton(field)}
        {hasDin ? renderInputField(dinNo) : null}
      </>
    );
  };

  const renderRadioButton = (field: any) => {
    const title = field?.title;
    const value = getFormValues(field?.id);
    return (
      <div
        className={classNames(classes.inputWrapper, classes.radioButtonWrapper)}
      >
        {title ? (
          <div className={classes.radioTitle}>
            {title}{' '}
            {field?.tooltip && (
              <span className={classes.Tooltip}>
                <TooltipCompoent toolTipText={RHP(field?.tooltip)}>
                  <span
                    className={`icon-info`}
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--gripBlue, #00357c)',
                    }}
                  />
                </TooltipCompoent>
              </span>
            )}
          </div>
        ) : null}
        <Radio
          options={field?.options}
          handleChange={(e) => getOnChange(field.id)?.(e)}
          selectedOption={value}
          classes={{
            formGroupRoot: classes.radioButtonGroup,
          }}
        />
      </div>
    );
  };

  const renderCameraIcon = (showCameraIcon: boolean) => {
    const cameraIconWidthHeight = isMobile ? 28 : 32;
    return showCameraIcon ? (
      <div className={classes.cameraIcon}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}homev2/other_camera_icon.svg`}
          layout="intrinsic"
          width={cameraIconWidthHeight}
          height={cameraIconWidthHeight}
          alt="cameraicon"
        />
      </div>
    ) : null;
  };

  const renderProfileImage = () => {
    const documentImageUrl = getFormValues('profile');
    return getFormValues('accredited') ? (
      <div className={`flex-column ${classes.photoContainer}`}>
        <UploadButton
          name={''}
          allowedFileTypes={['image/png', 'image/jpg', 'image/jpeg']}
          error={''}
          onChange={getOnChange('profile')}
          mainContainerClass={classes.uploadProfileMainContainer}
          imageContainerClass={classNames(classes.imageContainerClass, {
            [classes.afterUploadProfile]: Boolean(documentImageUrl),
          })}
          profileWrapperClass={classes.profilePhotoWrapper}
          hideDetails
          imageURL={documentImageUrl}
          customNoImage={() => {
            return (
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}homev2/person_upload.svg`}
                layout="intrinsic"
                width={52}
                height={52}
                alt="personlogo"
              />
            );
          }}
        />
        {renderCameraIcon(!Boolean(documentImageUrl))}
        <div className={classes.photoText}>{'Your Photo'}</div>
      </div>
    ) : null;
  };

  const renderTitle = (title: any, formDataHint: any = {}, titleClass = '') => {
    if (formDataHint && formDataHint.hintLinkTitle) {
      return (
        <div className={classNames(classes.title, classes.hintTitle)}>
          {title}{' '}
          <span
            onClick={() =>
              setShowHintModal({
                title: formDataHint.hintLinkTitle,
                content: formDataHint?.hintModalContent,
              })
            }
            className="TextStyle1"
          >
            {formDataHint?.hintLinkTitle}
          </span>
        </div>
      );
    }
    return <div className={`${classes.title} ${titleClass}`}>{title}</div>;
  };

  const renderHint = (hint: any, className?: any) => {
    return (
      <div className={`${styles.hints} ${className}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}commons/BulbIcon.svg`}
          alt="BulbIcon"
          layout={'fixed'}
          width={20}
          height={20}
        />
        <div className={styles.hintTitle}>{hint}</div>
      </div>
    );
  };

  const renderDynamicTitle = (fieldTitle: string) => {
    // Replace the dynamic word with value
    let title = fieldTitle?.replace(
      '{{option}}',
      getFormValues('nriAddressOption')
    );

    // Remove all underscores
    title = title?.replaceAll('_', ' ');

    // return capitalize multiple words value
    return title?.split(' ').map(capitalize).join(' ');
  };

  const ErrorCard = (field: any) => {
    return (
      <div className={styles.failedWrap}>
        <div className={`flex ${classes.failedContainer}`}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}home-v2/failed_message.svg`}
            layout={'fixed'}
            width={40}
            height={40}
            alt="failedmessage"
          />
          <div className={styles.failContent}>
            <div className={styles.failTitle}>{field.title}</div>
            <div className={styles.failSubTitle}>{formError}</div>
          </div>
        </div>
        <div
          className={styles.failButton}
          onClick={(e: any) => getOnChange(field?.id)(e, true)}
        >
          <Button width={'100%'} onClick={() => {}}>
            <>
              {field?.buttonText}
              <span className={`icon-caret-right ${classes.arrowForward}`}/>
            </>
          </Button>
        </div>
      </div>
    );
  };

  const ErrorCardCML = (field: any) => {
    return (
      <div
        style={{
          width: '100%',
        }}
      >
        <div className={`${styles.failedWrap} ${classes.failedWrap}`}>
          <div className={`flex ${classes.failedContainer}`}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}home-v2/failed_message.svg`}
              layout={'fixed'}
              width={40}
              height={40}
              alt="failedmessage"
            />
            <div className={`${styles.failContent} ${classes.failContent}`}>
              <div className={`${styles.failTitle} ${classes.failTitle}`}>
                {field.title}
              </div>
              <div className={`${styles.failSubTitle} ${classes.failSubTitle}`}>
                {RHP(field.subTitle)}
              </div>
            </div>
          </div>
          <div className={classes.BtnGrp}>
            {field.btnArr.map((ele: any, index: number) => {
              return (
                <React.Fragment key={`fieldButton-${field?.id}`}>
                  {index > 0 ? (
                    <span
                      key={ele}
                      className={`${classes.BtnSepeator} TextStyle1`}
                    >
                      OR
                    </span>
                  ) : null}
                  <div
                    key={ele.type}
                    onClick={(e: any) =>
                      getOnChange(field?.id)(e, true, ele.type)
                    }
                  >
                    <Button
                      compact
                      width={'auto'}
                      variant={ButtonType.Secondary}
                      className={classes.CMLCardBtn}
                    >
                      {ele?.btnTxt}
                    </Button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <div className={classes.ErrorBottom}>
          <span className="TextStyle1">Facing issues?</span>
          <span className="TextStyle1">
            Contact us at{' '}
            <a href="invest@gripinvest.in" target={'_blank'}>
              invest@gripinvest.in
            </a>
          </span>
        </div>
      </div>
    );
  };

  const renderUploadField = (field: any) => {
    const isContainOption = field?.title?.includes('{{option}}');
    const title = isContainOption
      ? renderDynamicTitle(field?.title)
      : field?.title;

    if (Boolean(field?.failed)) {
      return step === 4 ? ErrorCardCML(field) : ErrorCard(field);
    } else
      return (
        <>
          <UploadButton
            name={title}
            allowedFileTypes={KYC_FILE_TYPES}
            error={''}
            onChange={getOnChange(field.id)}
            mainContainerClass={classNames(classes.uploadButton, {
              [classes.CMRuploadBtn]: Boolean(step === 4),
            })}
            imageURL={getValues(field.id)}
          />
          {Boolean(field?.uploadNote) &&
            renderHint(field?.uploadNote, field?.noteClass)}
        </>
      );
  };

  const getType = (contentType: string) => {
    if (contentType === 'dob') {
      return 'date';
    }

    return 'text';
  };

  const renderInputField = (inputData: any) => {
    const height = inputData?.large ? 'auto' : 56;
    const inputFieldSetWidth = isMobile ? '100%' : inputData?.width || 360;
    return (
      <div
        className={classes.inputWrapper}
        style={{
          width: '100%',
          height: isMobile && !inputData?.large ? 48 : height,
          flexDirection: 'column',
          position: !isMobile ? 'relative' : 'static',
        }}
      >
        <InputFieldSet
          label={inputData?.title}
          width={inputFieldSetWidth}
          type={getType(inputData?.contentType)}
          value={getValues(inputData.id)}
          onChange={getOnChange(inputData.id)}
          disabled={Boolean(getFormValues('disable'))}
          error={Boolean(getFormValues(`${inputData?.id}Error`))}
        >
          {inputWithInfoIcon[inputData.id] && (
            <TooltipCompoent
              toolTipText={inputWithInfoIcon[inputData.id]}
              linkClass={desktopStyles.infoIcon}
            >
              <span
                className={`icon-info`}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--gripBlue, #00357c)',
                }}
              />
            </TooltipCompoent>
          )}

          {/* IFSC Loader */}
          {inputData?.loader && getFormValues(inputData?.loader) ? (
            <CircularProgress size={20} className={classes.circularProgress} />
          ) : null}
        </InputFieldSet>

        {/* error inside input */}
        {getFormValues(`${inputData?.id}Error`) ? (
          <div className={`gripDanger ${styles.extraDataInput} textEllipsis`}>
            {getFormValues(`${inputData?.id}Error`)}
          </div>
        ) : null}

        {/* any value under an input */}
        {getFormValues(`${inputData?.id}Details`) ? (
          <div className={`gripBlue ${styles.extraDataInput} textEllipsis`}>
            {getFormValues(`${inputData?.id}Details`)}
          </div>
        ) : null}
      </div>
    );
  };

  const renderSelectField = (field: any) => {
    let fieldOptions = [...field?.options];
    if (field.id === 'nationality') {
      fieldOptions = [
        ...field?.options.sort((a: any, b: any) => {
          if (a.value < b.value) {
            return -1;
          }
          if (a.value > b.value) {
            return 1;
          }
          return 0;
        }),
      ];
    }
    if (field.id === 'countryOfBirth' || field.id === 'nationality') {
      let indiaObject = {};
      fieldOptions = [
        ...fieldOptions.filter((el) => {
          if (el.value != 'india') {
            return true;
          } else {
            indiaObject = el;
            return false;
          }
        }),
      ];
      fieldOptions.unshift(indiaObject);
    }
    return (
      <GripSelect
        value={getFormValues(field?.id)}
        onChange={getOnChange(field?.id)}
        options={fieldOptions}
        placeholder={field?.title}
        classes={{
          ...field?.classes,
          select: classNames(field?.classes?.select, {
            [classes.selectwrapper]: field?.isSmallHeight,
          }),
          selectLabel: classNames(field?.classes?.selectLabel, {
            [classes.selectLabel]: field?.isSmallHeight,
          }),
        }}
        disabled={Boolean(getFormValues(field?.disable))}
      />
    );
  };

  const resetModalData = () => {
    setShowHintModal({
      title: '',
      content: '',
    });
  };

  const renderFieldHintModal = () => {
    return (
      <Popup
        className={classes.FieldHintModal}
        heading={showhintModal.title}
        data={showhintModal.content}
        handleOnSubmit={() => resetModalData()}
        onCloseModal={() => resetModalData()}
      />
    );
  };

  return (
    <>
      <div className={`${styles.container} ${className}`}>
        {isMultipleForms ? renderMultipleForms() : renderForm(data)}
        {showEditDetails && <EditDetails page={id} />}
      </div>
      {Boolean(showhintModal.title) && renderFieldHintModal()}
    </>
  );
};

export default Form;
