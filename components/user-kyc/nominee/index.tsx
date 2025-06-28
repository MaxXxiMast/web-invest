// NODE MODULES
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';

// Contexts
import { useKycContext } from '../../../contexts/kycContext';

// Components
import InputFieldSet from '../../common/inputFieldSet';
import GripSelect from '../../common/GripSelect';
import CustomDatePicker from '../../common/customDatePicker';
import LayoutFooter from '../footer';

// Utils
import {
  NomineeData,
  UserNomineeRelation,
  emailRegex,
  findAge,
  nomineeNameRegex,
} from '../utils/NomineeUtils';
import { callErrorToast, fetchAPI } from '../../../api/strapi';
import {
  convertNomineeDoBDateInput,
  trackKYCCheckpointEvt,
  trackKYCErrorEvt,
  trackKYCSuccessEvt,
} from '../utils/helper';
import { postMessageToNativeOrFallback } from '../../../utils/appHelpers';

// Hooks
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// APIs
import { KycNomineeDetails } from '../../../api/rfqKyc';

// Styles
import classes from './Nominee.module.css';

const NomineeForm = () => {
  const { updateCompletedKycSteps, kycValues } = useKycContext();
  const isMobile = useMediaQuery();
  const inputRef = useRef(null);

  const nomineeDetails: any = kycValues?.nominee ?? {};

  const [formData, setFormData] = useState<NomineeData>({
    nomineeName: nomineeDetails?.nomineeName ?? '',
    nomineeRelation: nomineeDetails?.nomineeRelation ?? '',
    nomineeEmail: nomineeDetails?.nomineeEmail ?? '',
    nomineeDob: convertNomineeDoBDateInput(nomineeDetails?.nomineeDob ?? ''),
  });

  const [formErrors, setFormErrors] = useState<NomineeData>({
    nomineeEmail: '',
    nomineeDob: '',
  });

  const [isFooterDisabled, setIsFooterDisabled] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);
  const [, setHighestFdReturnObj] = useState(null);

  const updateNomineeSuccess = () => {
    trackKYCSuccessEvt('nominee', {
      nominee_name: formData.nomineeName,
      relationship: formData.nomineeRelation,
      nominee_email_id: formData.nomineeEmail,
    });
    updateCompletedKycSteps([{ name: 'nominee', status: 1 }]);
  };

  const handleFooterClick = async () => {
    if (isFooterDisabled || !verifyFormData()) return;
    setIsFooterLoading(true);
    try {
      await KycNomineeDetails(formData);

      updateNomineeSuccess();
    } catch (e) {
      setIsFooterLoading(false);
      callErrorToast('Something Went Wrong !');
      trackKYCErrorEvt({
        module: 'nominee',
        error_heading: 'error in updating nominee',
        error_type: 'api_error',
        error_payload: JSON.stringify(e),
      });
    }
  };

  useEffect(() => {
    postMessageToNativeOrFallback('kycEvent', {
      kycStep: 'nominee',
    });
  }, []);

  useEffect(() => {
    // On Page loaded
    trackKYCCheckpointEvt('nominee');
  }, []);

  useEffect(() => {
    fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/user-kyc',
        },
        populate: {
          pageData: {
            populate: '*',
          },
        },
      },
      {},
      false
    ).then((res) => {
      const highestFdReturnObj =
        res?.data?.[0]?.attributes?.pageData?.find(
          (d: any) => d?.keyValue === 'highestFdReturn'
        )?.objectData ?? {};
      setHighestFdReturnObj(highestFdReturnObj);
    });
  }, []);

  useEffect(() => {
    if (
      formData?.nomineeName &&
      formData?.nomineeRelation &&
      formData?.nomineeEmail &&
      formData?.nomineeDob
    ) {
      // all fields are mandatory
      verifyFormData();
    } else {
      setIsFooterDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const verifyFormData = () => {
    const isValid = Object.values(formErrors).every((value) => value === '');
    setIsFooterDisabled(!isValid);
    return isValid;
  };

  const handleDOB = (date: any) => {
    let nomineeDob = '';
    if (date) {
      if (findAge(date) < 18) {
        nomineeDob = 'Nominee should be at least 18 yrs old';
      }
      setFormData({
        ...formData,
        ['nomineeDob']: convertNomineeDoBDateInput(date),
      });
    }
    setFormErrors({ ...formErrors, nomineeDob });
  };

  const defaultMobileDOB = () => {
    if (isMobile && !formData?.['nomineeDob'])
      handleDOB(dayjs(new Date()).format());
  };

  const handleData = (event: any, type: string = '') => {
    const data = { ...formData };
    const value = event?.target?.value;

    if (type === 'Select') {
      data[event?.target?.name] = value;
    } else {
      data[event?.target?.id] = value;
    }

    // validation for nominee name
    if (
      event?.target?.id === 'nomineeName' &&
      value &&
      !nomineeNameRegex.test(value)
    ) {
      return;
    }

    //validation for email
    let nomineeEmail = '';
    if (event?.target?.id === 'nomineeEmail') {
      if (!emailRegex.test(value)) nomineeEmail = 'Please provide valid email';
    }
    setFormErrors({ ...formErrors, nomineeEmail });
    setFormData({ ...data });
  };

  const handleFocusScroll = () => {
    if (isMobile && inputRef.current) {
      inputRef.current.scrollIntoView({ behaviour: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      <div className={classes.FormContainer}>
        <p className={classes.Title}> Add Nominee</p>
        <div className={`flex-column ${classes.FormWrapper}`}>
          <InputFieldSet
            label="Nominee Name"
            inputId="nomineeName"
            type="text"
            onChange={handleData}
            value={formData?.['nomineeName']}
            className={`CompactInput`}
          />
          <div className="flex-column" onClick={defaultMobileDOB}>
            <CustomDatePicker
              label="Nominee DOB"
              inputId="nomineeDob"
              onChange={handleDOB}
              value={
                formData?.['nomineeDob']
                  ? dayjs(formData?.['nomineeDob'])
                  : null
              }
              error={!!formErrors?.nomineeDob}
              errorMsg={formErrors?.nomineeDob || ''}
              className={classes.DOBInput}
            />
          </div>
          <GripSelect
            value={formData?.['nomineeRelation'] || ''}
            options={UserNomineeRelation}
            placeholder={'The Nominee is my'}
            id="nomineeRelation"
            name="nomineeRelation"
            onChange={(e) => handleData(e, 'Select')}
            isSmallHeight
          />
          <InputFieldSet
            label="Nominee Email"
            inputId="nomineeEmail"
            type="text"
            onChange={handleData}
            value={formData?.['nomineeEmail']}
            error={!!formErrors?.nomineeEmail}
            errorMsg={formErrors?.nomineeEmail || ''}
            className={'CompactInput'}
            ref={inputRef}
            onFocus={handleFocusScroll}
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
      </div>
    </>
  );
};

export default NomineeForm;
