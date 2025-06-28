// NODE MODULES
import { useContext, useMemo, useState } from 'react';

// redux
import { useAppSelector } from '../../../redux/slices/hooks';

// Contexts
import { GlobalContext } from '../../../pages/_app';

// Components
import { FormTitle } from '../section-title';
import ValueFields from '../value-fields';

// Types
import type { FinacialVisibleFields } from '../utils/types';

// Styles
import classes from './Financial.module.css';
interface FinancialProps {
  visibleFields?: FinacialVisibleFields[];
}

const Financial = ({ visibleFields = [] }: FinancialProps) => {
  const { default: kycConfigStatus = {} } = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );
  const data = useMemo(
    () => kycConfigStatus?.kycTypes || [],
    [kycConfigStatus?.kycTypes]
  );
  const { userData, uccStatus } = useAppSelector((state) => state?.user);
  const { firstName, lastName, userID, emailID, mobileCode, mobileNo } =
    userData;
  const { bank_form_url, demat_form_url }: any = useContext(GlobalContext);
  const { NSE } = uccStatus;
  const ucc = NSE?.ucc;

  const panData = data?.filter((ele) => ele?.name === 'pan')?.[0]?.fields;
  const bankData = data?.filter((ele) => ele?.name === 'bank')?.[0]?.fields;
  const depositoryData = data?.filter((ele) => ele?.name === 'depository')?.[0]
    ?.fields;
  const [showDematModal, setShowDematModal] = useState(false);

  const renderBankContent = () => {
    // Check if at least one field is available for bank
    const bankFields = ['accountNumber', 'ifscCode', 'accountType'];
    const isShowBank = bankFields.some((key) => Boolean(bankData?.[key]));

    // If no field is available, return null
    if (!isShowBank) return null;

    const handleEditBankDetails = async () => {
      try {
        const fullName = `${panData?.itdName}`.trim();
        const formattedName = fullName.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );

        const phoneWithCode =
          mobileCode && mobileNo ? `${mobileCode}${mobileNo}` : '';
        const panNumber = panData?.panNumber || '';
        let uccCode: string = '';
        if (uccStatus?.NSE) {
          uccCode = ucc;
        } else {
          uccCode = userID.toString();
        }

        const params = new URLSearchParams({
          user_name: formattedName,
          phn: phoneWithCode,
          eml: emailID,
          pan_num: panNumber,
          ucc: ucc,
          current_bank_account_num: bankData?.accountNumber,
          current_bank_ifsc_num: bankData?.ifscCode,
        });
        const finalUrl = `${bank_form_url}?${params.toString()}`;
        window.open(finalUrl, '_blank');
      } catch (error) {
        console.error('Failed to open Zoho form:', error);
      }
    };

    return (
      <div className={`flex-column ${classes.Widget}`}>
        <FormTitle
          title={'Bank Details'}
          editData={{
            editTitle: 'bank',
            subtitle: 'bank',
          }}
          showEditBtn={bankData?.status === 1}
          handleEditModal={handleEditBankDetails}
        />
        <div className={`flex-column ${classes.FlexRow}`}>
          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields
              label="Account Number"
              value={bankData?.accountNumber || '-'}
            />
            <ValueFields label="IFSC Code" value={bankData?.ifscCode || '-'} />
          </div>
          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields
              label="Account Type"
              value={bankData?.accountType || '-'}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDematContent = () => {
    // Check if at least one field is available for demat
    const depositoryFields = ['dpID', 'clientID', 'brokerName'];
    const isShowDemat = depositoryFields.some((key) =>
      Boolean(depositoryData?.[key])
    );

    // If no field is available, return null
    if (!isShowDemat) return null;
    const handleDematEditRequest = () => {
      try {
        //user name should follow capital case
        const fullName = `${panData?.itdName}`.trim();
        const formattedName = fullName.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );

        //phone number should be in the format of +91xxxxxxxxxx
        const phoneWithCode =
          mobileCode && mobileNo ? `${mobileCode}${mobileNo}` : '';
        const panNumber = panData?.panNumber || '';

        //if ucc is not defined then send the userID
        let uccCode: string = '';
        if (uccStatus?.NSE) {
          uccCode = ucc;
        } else {
          uccCode = userID.toString();
        }

        const dpId = depositoryData?.dpID || '';
        const clientId = depositoryData?.clientID || '';
        const params = new URLSearchParams({
          user_name: formattedName,
          phn: phoneWithCode,
          eml: emailID,
          pan_num: panNumber,
          ucc: uccCode,
          dp_id: dpId,
          client_id: clientId,
        });

        const formUrl = `${demat_form_url}?${params.toString()}`;

        //open the form in the other tab
        window.open(formUrl, '_blank');
      } catch (error) {
        console.error('Failed to open Zoho form:', error);
      }
    };

    return (
      <div className={`flex-column ${classes.Widget}`}>
        <FormTitle
          title={'Demat Details'}
          editData={{
            editTitle: 'demat',
            subtitle: 'demat',
          }}
          showEditBtn={depositoryData?.status === 1}
          showEditModal={showDematModal}
          handleEditModal={handleDematEditRequest}
        />
        <div className={`flex-column ${classes.FlexRow}`}>
          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields label="DP ID" value={depositoryData?.dpID || '-'} />
            <ValueFields
              label="Client ID"
              value={depositoryData?.clientID || '-'}
            />
          </div>
          <div className={`flex ${classes.FlexCol}`}>
            <ValueFields
              label="Broker Name"
              value={depositoryData?.brokerName || '-'}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex-column ${classes.Wrapper}`}>
      {visibleFields.includes('bank') ? renderBankContent() : null}
      {visibleFields.includes('depository') ? renderDematContent() : null}
    </div>
  );
};

export default Financial;
