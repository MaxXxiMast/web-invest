// NODE MODULES
import { useMemo } from 'react';
import dynamic from 'next/dynamic';

// UTILS
import {
  convertAddressUpdate,
  getAddressDetails,
} from '../../user-kyc/utils/identityUtils';

// COMPONENTS
import { FormTitle } from '../section-title';

// Types
import type { IdentityVisibleFields } from '../utils/types';

// STYLESHEETS
import classes from './Identity.module.css';
import { useAppSelector } from '../../../redux/slices/hooks';

const ValueFields = dynamic(() => import('../value-fields'), {
  ssr: false,
});

interface IdentityProps {
  visibleFields?: IdentityVisibleFields[];
}

const Identity = ({ visibleFields = [] }: IdentityProps) => {
  const { default: kycConfigStatus = {} } = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );
  const data = useMemo(
    () => kycConfigStatus?.kycTypes || [],
    [kycConfigStatus?.kycTypes]
  );

  const panData = data?.filter((ele) => ele?.name === 'pan')?.[0]?.fields;
  const addressData = data?.filter((ele) => ele?.name === 'address')?.[0]
    ?.fields;
  const isProcessData = addressData?.isProcessData || false;
  const finalAddress = getAddressDetails(addressData, !isProcessData);

  const renderPanContent = () => {
    // Check if at least one field is available for pan
    const panFields = ['panHolderName', 'panNumber', 'dob', 'nomineeName'];
    const isShowPan = panFields.some((key) => Boolean(panData?.[key]));

    // If no field is available, return null
    if (!isShowPan) return null;

    return (
      <>
        <FormTitle title="PAN Details" />
        <div className={`flex-column ${classes.Widget}`}>
          <div className={`flex-column ${classes.FlexRow}`}>
            <div className={`flex ${classes.FlexCol}`}>
              <ValueFields label="Name" value={panData?.panHolderName || '-'} />
              <ValueFields label="PAN No." value={panData?.panNumber || '-'} />
            </div>
            <div className={`flex ${classes.FlexCol}`}>
              <ValueFields label="Date of Birth" value={panData?.dob || '-'} />
              <ValueFields
                label="Son/Daughter/Wife of"
                value={panData?.nomineeName || '-'}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderAadharContent = () => {
    const addressField = convertAddressUpdate(finalAddress)?.trim();
    const isShowAddress =
      Boolean(addressField?.trim()) || Boolean(addressData?.userName);

    // If no field is available, return null
    if (!isShowAddress) return null;

    return (
      <>
        <FormTitle title="Address" />
        <div className={`flex-column ${classes.Widget}`}>
          <div className={`flex-column ${classes.FlexRow}`}>
            <div className={`flex ${classes.FlexCol}`}>
              <ValueFields label="Name" value={addressData?.userName || '-'} />
            </div>
            <div className={`flex ${classes.FlexCol}`}>
              <ValueFields label="Address" value={addressField || '-'} />
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={`flex-column ${classes.Widget}`}>
      {visibleFields.includes('pan') ? renderPanContent() : null}
      {visibleFields.includes('address') ? renderAadharContent() : null}
    </div>
  );
};

export default Identity;
