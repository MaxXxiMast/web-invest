import { useState, useMemo } from 'react';
import { useAppSelector } from '../../../redux/slices/hooks';
import { useRouter } from 'next/router';

import { FormTitle } from '../section-title';
import ValueFields from '../value-fields';
import Identity from '../identitydetails';
import Financial from '../financialdetails';
import Nominee from '../nominee';
import ErrorStateHorizontal from '../error-state-horizontal';

// Utils
import {
  nationalityValueToOptions,
  occupationEnum,
} from '../../user-kyc/utils/otherInfoUtils';
import { trackEvent } from '../../../utils/gtm';

// Styles
import classes from './General.module.css';

const genderLabels = {
  M: 'Male',
  F: 'Female',
  O: 'Other',
};

const General = () => {
  const { default: kycConfigStatus = {} } = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );
  const kycData = useMemo(
    () => kycConfigStatus?.kycTypes || [],
    [kycConfigStatus?.kycTypes]
  );

  const router = useRouter();
  const otherDetails = kycData?.find((ele) => ele?.name === 'other');
  const panDetails = kycData?.find((ele) => ele?.name === 'pan');

  const { userData } = useAppSelector((state) => state?.user) || {};
  const {
    firstName = '',
    lastName = '',
    emailID = '',
    mobileCode = '',
    mobileNo = '',
  } = userData;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showOtherEditModal, setShowOtherEditModal] = useState(false);

  const isPanUnderVerification = panDetails?.isKYCPendingVerification;
  const noOtherDetails = !otherDetails?.isKYCComplete;

  const handleOtherEditAction = () => {
    if (noOtherDetails) {
      trackEvent('kyc_redirect', {
        page: 'profile',
        userID: userData?.userID,
        activeTab: 'otherEditAction',
      });
      router.push('/user-kyc');
    } else {
      setShowOtherEditModal(!showOtherEditModal);
    }
  };

  const renderOtherDetails = () => {
    const otherData = otherDetails?.fields;

    // Check if at least one field is available
    const otherFields = [
      'gender',
      'occupation',
      'income',
      'nationality',
      'maritalStatus',
      'motherMaidenName',
    ];
    const isShowOther = otherFields.some((key) => {
      if (key === 'occupation') {
        return Boolean(occupationEnum?.[otherData?.occupation]);
      } else {
        return Boolean(otherData?.[key]);
      }
    });

    // If no field is available, return null
    if (!isShowOther) return null;

    const NoUserKyc = kycData?.every((ele: any) => !ele.isKYCComplete);

    return (
      <div className={`flex-column ${classes.Widget}`}>
        <FormTitle
          title="Other Details"
          editData={{ editTitle: 'other', subtitle: 'other' }}
          editText={noOtherDetails ? 'Add Details' : 'Request Edit'}
          showEditBtn={!isPanUnderVerification && !NoUserKyc}
          showEditModal={showOtherEditModal}
          handleEditModal={handleOtherEditAction}
        />
        <div className={`flex-column ${classes.FlexRow}`}>
          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields
              label="Gender"
              value={genderLabels?.[otherData?.gender] || '-'}
            />
            <ValueFields
              label="Occupation"
              value={occupationEnum?.[otherData?.occupation] || '-'}
            />
          </div>
          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields
              label="Annual Gross Income"
              value={otherData?.income || '-'}
            />
            <ValueFields
              label="Nationality"
              value={nationalityValueToOptions(otherData?.nationality) || '-'}
            />
          </div>

          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields
              label="Marital Status"
              value={otherData?.maritalStatus || '-'}
            />
            <ValueFields
              label="Mother’s Maiden Name"
              value={otherData?.motherMaidenName || '-'}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderProfileContent = () => {
    return (
      <>
        <Identity visibleFields={['pan']} />
        <Financial visibleFields={['bank', 'depository']} />
        <Identity visibleFields={['address']} />
        {renderOtherDetails()}
        <Nominee />
        <ErrorStateHorizontal showBtn />
      </>
    );
  };

  return (
    <div className={`flex-column ${classes.Wrapper}`}>
      <div className={`flex-column ${classes.Widget}`}>
        <FormTitle
          title="Contact Details"
          editText={'Request Edit'}
          editData={{ editTitle: 'basic', subtitle: 'basic' }}
          showEditBtn={true}
          showEditModal={showEditModal}
          handleEditModal={() => setShowEditModal(!showEditModal)}
        />
        <div className={`flex-column ${classes.FlexRow}`}>
          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields label="Name" value={`${firstName} ${lastName}`} />
          </div>
          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields label="Email" value={emailID} textCapitalize={false} />
          </div>
          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields label="Phone" value={`+${mobileCode} ${mobileNo}`} />
          </div>
        </div>
      </div>
      {renderProfileContent()}
    </div>
  );
};

export default General;
