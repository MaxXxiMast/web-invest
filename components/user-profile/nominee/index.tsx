// NODE MODULES
import { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';

// Common Components
import ValueFields from '../value-fields';
import { FormTitle } from '../section-title';

// Contexts
import { ProfileContext } from '../../ProfileContext/ProfileContext';

// Styles
import classes from './Nominee.module.css';
import { useAppSelector } from '../../../redux/slices/hooks';

const Nominee = () => {
  const { handleHeaderBtn } = useContext<any>(ProfileContext);
  const { default: kycConfigStatus = {} } = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );

  const [showNomineeModal, setShowNomineeModal] = useState(false);
  const nomineeDetails = kycConfigStatus?.kycTypes?.filter(
    (ele: any) => ele?.name === 'nominee'
  );

  const nomineeData = nomineeDetails?.[0]?.fields;
  const isKYCComplete = nomineeDetails?.[0]?.isKYCComplete;

  useEffect(() => {
    if (!isKYCComplete) handleHeaderBtn(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nomineeFields = [
    'nomineeName',
    'nomineeRelation',
    'nomineeDob',
    'nomineeEmail',
  ];
  const isShowNominee = nomineeFields.some((field) =>
    Boolean(nomineeData?.[field])
  );

  if (!isShowNominee) return null;

  return (
    <div className={`flex-column ${classes.Widget}`}>
      <FormTitle
        title="Nominee Details"
        editText={'Request Edit'}
        editData={{
          editTitle: 'nominee',
          subtitle: 'nominee',
        }}
        showEditBtn={true}
        showEditModal={showNomineeModal}
        handleEditModal={() => setShowNomineeModal(!showNomineeModal)}
      />
      <div className={`flex-column ${classes.FlexRow}`}>
        <div className={`flex ${classes.FlexCol}`}>
          <ValueFields
            label="Nominee Name"
            value={nomineeData?.nomineeName ?? '-'}
          />
          <ValueFields
            label="Relationship"
            value={nomineeData?.nomineeRelation ?? '-'}
          />
        </div>
        <div className={`flex ${classes.FlexCol}`}>
          <ValueFields
            label="Date of Birth"
            value={
              nomineeData?.nomineeDob
                ? dayjs(nomineeData?.nomineeDob).format('DD MMM YYYY')
                : '-'
            }
          />
          <ValueFields
            label="E-mail"
            value={nomineeData?.nomineeEmail || '-'}
            textCapitalize={false}
          />
        </div>
        {nomineeData?.nomineeId ? (
          <div className={`flex ${classes.FlexCol}`}>
            <button className={classes.NomineeId}>View Nominee ID</button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Nominee;
