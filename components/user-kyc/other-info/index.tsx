// NODE MODULES
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// API
import { callErrorToast } from '../../../api/strapi';
import {
  handleOtherDetailPost,
  handleQualificationPost,
} from '../../../api/rfqKyc';

// CONTEXTES
import { useKycContext } from '../../../contexts/kycContext';

// MODELS
import { otherInfoFormModel } from '../utils/models';

// CUSTOM COMPONENTS
import GripSelect from '../../common/GripSelect';
import CustomCheckbox from '../../primitives/Checkbox';
import StepTitle from '../common/StepTitle';
import InputFieldSet from '../../common/inputFieldSet';
import LayoutFooter from '../footer';

// UTILS
import {
  convertToOptionsNationality,
  genderOptions,
  incomeOptions,
  maritalStatusOptions,
  nationalityOptions,
  occupation,
  occupationEnum,
  qualificationOptions,
} from '../utils/otherInfoUtils';

// STYLESHEETS
import classes from './OtherInfo.module.css';
import {
  trackKYCCheckpointEvt,
  trackKYCErrorEvt,
  trackKYCSuccessEvt,
} from '../utils/helper';
import { postMessageToNativeOrFallback } from '../../../utils/appHelpers';

const RadioGroupCustom = dynamic(() => import('../../primitives/RadioGroup'), {
  ssr: false,
});

const GenericModal = dynamic(() => import('../common/GenericModal'), {
  ssr: false,
});

const OtherInfo = () => {
  const { updateCompletedKycSteps, kycValues } = useKycContext();

  const otherDetails: any = kycValues?.other ?? {};

  const [formData, setFormData] = useState<otherInfoFormModel>({
    gender: otherDetails?.gender ?? '',
    income: otherDetails?.income ?? '',
    isSEBIAction: true,
    maritalStatus: otherDetails?.maritalStatus,
    motherMaidenName: otherDetails?.motherMaidenName,
    nationality: convertToOptionsNationality(otherDetails?.nationality),
    occupation: occupationEnum?.[otherDetails?.occupation],
    qualification: otherDetails?.qualification,
  });
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [showSebiActionModal, setShowSebiActionModal] = useState(false);
  const [isFooterDisabled, setIsFooterDisabled] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);

  const handleInputChange = (event: any, type = '') => {
    const data = { ...formData };
    if (type === 'radio') {
      data[event?.target?.name] = event?.target?.checked;
    } else {
      data[event?.target?.name] = event?.target?.value;
    }

    setFormData({ ...data });
  };

  useEffect(() => {
    // On Page loaded
    trackKYCCheckpointEvt('other');
    postMessageToNativeOrFallback('kycEvent', {
      kycStep: 'other info',
    });
  }, []);

  const handleFooterClick = () => {
    // API CALLS
    if (!isFooterDisabled) {
      setIsFooterLoading(true);
      setShowFetchModal(true);
      handleOtherDetailPost(formData)
        .then(async () => {
          await handleQualificationPost(formData.qualification);
          trackKYCSuccessEvt('other', {
            gender: formData.gender,
            incomeRange: formData.income,
            occupation: formData.occupation,
          });
          setTimeout(() => {
            setShowFetchModal(false);
            updateCompletedKycSteps({ name: 'other', status: 1 });
          }, 1000);
        })
        .catch((err) => {
          setIsFooterLoading(false);
          callErrorToast(err);
          trackKYCErrorEvt({
            module: 'other',
            error_heading: err,
            error_type: 'api_error',
            error_payload: err,
          });
        });
    }
  };

  useEffect(() => {
    if (
      formData?.gender &&
      formData?.income &&
      formData?.isSEBIAction &&
      formData?.maritalStatus &&
      formData?.motherMaidenName &&
      formData?.nationality &&
      formData?.occupation &&
      formData.qualification
    ) {
      setIsFooterDisabled(false);
    } else {
      setIsFooterDisabled(true);
    }
  }, [formData]);

  return (
    <div className={classes.FormContainer}>
      <hr className={classes.MobileHr} />
      <StepTitle text="Personal Information" />

      <div className={`flex-column ${classes.RadioOptions}`}>
        <label>Select Gender</label>
        <RadioGroupCustom
          row
          aria-label="gender"
          name="gender"
          options={genderOptions}
          value={formData.gender}
          handleChangeEvent={handleInputChange}
          id="gender"
        />
      </div>

      <div className={`flex-column ${classes.FormWrapper}`}>
        <GripSelect
          value={formData.occupation}
          name="occupation"
          onChange={handleInputChange}
          options={occupation}
          placeholder={'Occupation'}
          isSmallHeight
          id="occupation"
        />
        <GripSelect
          value={formData.qualification}
          name="qualification"
          onChange={handleInputChange}
          options={qualificationOptions}
          placeholder={'Qualification'}
          isSmallHeight
          id="qualification"
          classes={{
            root: classes.QualificationSelect,
          }}
          optionClassName={classes.QualificationOption}
        />
        <GripSelect
          value={formData.income}
          name="income"
          onChange={handleInputChange}
          options={incomeOptions}
          placeholder={'Annual Gross Income'}
          isSmallHeight
          id="income"
        />

        <GripSelect
          value={formData.nationality}
          name="nationality"
          onChange={handleInputChange}
          options={nationalityOptions}
          placeholder={'Nationality'}
          isSmallHeight
          id="nationality"
        />

        <GripSelect
          value={formData.maritalStatus}
          name="maritalStatus"
          onChange={handleInputChange}
          options={maritalStatusOptions}
          placeholder={'Marital Status'}
          isSmallHeight
          id="maritalStatus"
        />

        <InputFieldSet
          label="Mother's Maiden Name"
          inputId="motherMaidenName"
          type="text"
          onChange={handleInputChange}
          value={formData.motherMaidenName}
          className={'CompactInput'}
          name="motherMaidenName"
        />

        <CustomCheckbox
          value={true}
          label="I have not been charged for any wrong doing by SEBI "
          key="is-checked"
          onChange={(event) => setShowSebiActionModal(true)}
          name="isSEBIAction"
        />
        <LayoutFooter
          footerLinkText={'Next'}
          showMsg={false}
          renderOnlyButton={true}
          isFooterBtnDisabled={isFooterDisabled}
          isLoading={isFooterLoading}
          handleBtnClick={handleFooterClick}
        />
      </div>

      <GenericModal
        showModal={showSebiActionModal}
        handleBtnClick={() => setShowSebiActionModal(false)}
        btnText="Okay Got It"
        icon="KycPendingProfile.svg"
        title="Apologies, users against whom SEBI has taken action in the past cannot invest via this platform"
        btnVariant="Secondary"
      />

      <GenericModal
        showModal={showFetchModal}
        lottieType="verifying"
        title="Verifying Information"
        subtitle="It will take up to 10 seconds!"
        className={classes.FetchModal}
        drawerExtraClass={classes.Drawer}
      />
    </div>
  );
};

export default OtherInfo;
