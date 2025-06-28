import React from 'react';
import { connect } from 'react-redux';
import Button from '../primitives/Button';
import styles from '../../styles/Vault/DownloadHistory.module.css';
import GripSelect from '../common/GripSelect';
import { generateStatementRequest } from '../../redux/slices/user';
import { trackEvent } from '../../utils/gtm';

type Props = {
  className?: any;
  heading: string;
  financialYearList: any;
  note?: string;
  showDivider?: boolean;
  ctaText?: string;
  ctaIcon?: string;
  defaultValue?: string;
  statementType?: 'vault' | 'return_history' | 'ledger';
  generateStatementRequest: (data: any, cb?: () => void) => void;
  handleCtaClick?: ({ financialYear }) => void;
  closeModal: () => void;
  extraEventData?: Record<string, unknown>;
};
const DownloadCasModal = ({
  heading,
  className = '',
  financialYearList,
  defaultValue = '',
  note,
  statementType,
  generateStatementRequest,
  closeModal,
  extraEventData = {},
  showDivider = true,
  ctaText = 'Proceed',
  ctaIcon = '',
  handleCtaClick = null,
}: Props) => {
  const [financialYear, setFinancialYear] = React.useState(defaultValue);
  const handleStatementDownload = () => {
    // Rudderstack analytics document_requested
    const rudderData = {
      doctype: statementType,
      option_text: financialYear,
      ...extraEventData,
    };
    trackEvent('document_requested', rudderData);
    generateStatementRequest({ financialYear, statementType }, closeModal);
  };

  const handleClick = () => {
    handleCtaClick
      ? handleCtaClick?.({ financialYear })
      : handleStatementDownload();
  };

  return (
    <>
      <div className={`${styles.DownloadHistory} ${className}`}>
        <div className={styles.CardHeader}>
          <h4 className="Heading4">{heading}</h4>
        </div>
        <div className={styles.CardBody}>
          <GripSelect
            value={financialYear}
            options={financialYearList}
            onChange={(e) => setFinancialYear(e.target.value)}
            placeholder={'Select financial year'}
            classes={{
              formControlRoot: styles.selectFormControlRoot,
            }}
          />
        </div>
        {note ? (
          <div className={styles.noteBlock}>
            <span className={`${styles.note} ${styles.bold}`}>Note:</span>
            <span className={`${styles.note} ${styles.noteDesc}`}>{note}</span>
          </div>
        ) : null}

        {showDivider ? <div className={styles.divider} /> : null}

        <div className={styles.CardFooter}>
          <Button
            className={styles.ContinueBtn}
            onClick={handleClick}
            ctaIcon={ctaIcon}
          >
            {ctaText}
          </Button>
        </div>
      </div>
    </>
  );
};

const mapDispatchToProps = {
  generateStatementRequest,
};
export default connect(null, mapDispatchToProps)(DownloadCasModal);
