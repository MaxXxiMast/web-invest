// NODE MODULES
import { useState } from 'react';
import RHP from 'react-html-parser';

// Components
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
import InfoModal from '../../primitives/InfoModal/Infomodal';

// Utils
import { handleExtraProps } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';
import { convertCurrencyToNumber } from '../../../utils/number';

// Primitives
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// Types
import { AmountBreakdown } from './types';

// Styles
import styles from './Breakdown.module.css';


interface Asset {
  productCategory: string;
  productSubcategory: string;
  financeProductType: string;
  assetID: string;
}
type BreakdownProps = {
  asset: Asset;
  id: string;
  topData: {
    label: string;
    tooltipText: string;
    uiValue: string;
  };
  breakdownData: AmountBreakdown[];
  className?: string;
  loading?: boolean;
};

export default function Breakdown({
  id,
  asset,
  topData,
  breakdownData,
  className,
  loading = false,
}: BreakdownProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({
    title: '',
    content: '',
    isHTML: false,
  });
  const [showAccordian, setShowAccordian] = useState(false);

  const handleInfoModalClick = (val: any) => {
    setShowInfoModal(true);
    setInfoModalContent({ ...val });
  };

  const getBreakDown = (breakDown: AmountBreakdown & { index: number }) => {
    const {
      label,
      index,
      modalLinkLabel,
      modalTitle,
      modalContent,
      isHTML,
      tooltip,
      value,
    } = breakDown ?? {};

    return (
      <li key={`${label}-${index}`}>
        <span className={styles.CountLabel}>
          {label}{' '}
          {Boolean(modalLinkLabel) && (
            <span
              className={styles.modalLinkLabel}
              onClick={() =>
                handleInfoModalClick({
                  title: modalTitle,
                  content: modalContent,
                  isHTML: isHTML,
                })
              }
            >
              {modalLinkLabel}
            </span>
          )}
          {Boolean(tooltip) ? (
            <span className={styles.InfoIcon}>
              <TooltipCompoent toolTipText={RHP(tooltip)}>
                <span className={`icon-info ${styles.Icon}`} />
              </TooltipCompoent>
            </span>
          ) : null}
        </span>
        <span className={`${styles.PreTaxAmoount} ${styles.CalculatedAmount}`}>
          {value}
        </span>
      </li>
    );
  };

  const principalAmount = breakdownData[0]?.value;
  const totalInterest = breakdownData[1]?.value;

  const handleAccordianClick = () => {
    setShowAccordian(!showAccordian);
    trackEvent('Pre Tax Returns Previewed', {
      action: showAccordian ? 'collapsed' : 'expanded',
      principal_amount: convertCurrencyToNumber(
        principalAmount?.toString() ?? ''
      ),
      total_interest: convertCurrencyToNumber(totalInterest?.toString() ?? ''),
      product_category: asset?.productCategory ?? '',
      product_sub_category: asset?.productSubcategory ?? '',
      financial_product_type: asset?.financeProductType ?? '',
      asset_id: asset?.assetID ?? '',
    });
  };
  const renderTopWithBreakdown = ({ label, tooltipText, uiValue }) => {
    return (
      <li className={handleExtraProps(className)}>
        <span className={styles.CountLabel}>
          {label}
          <span className={styles.InfoIcon}>
            <TooltipCompoent toolTipText={tooltipText}>
              <span className={`icon-info ${styles.Icon}`} />
            </TooltipCompoent>
          </span>
        </span>

        <div
          className={`${styles.PreTaxAmoount} ${styles.PreTaxAmoountSDI} ${
            showAccordian ? 'Active' : ''
          }`}
          onClick={handleAccordianClick}
        >
          <span className={styles.CalculatedAmount}>{uiValue}</span>
          <span className={`icon-caret-down ${styles.CaretDown}`}/>
        </div>
      </li>
    );
  };

  if (loading)
    return (
      <CustomSkeleton
        styles={{
          width: '100%',
          height: 56,
        }}
        className={styles.MobileSkeleton}
      />
    );

  return (
    <>
      {renderTopWithBreakdown(topData)}
      {showAccordian && (
        <li className={styles.RepaymentAmount} id={id}>
          <ul>
            {breakdownData.map((breakDown, index) =>
              getBreakDown({
                ...breakDown,
                index,
              })
            )}
          </ul>
        </li>
      )}
      <InfoModal
        className={styles.InfoModal}
        showModal={showInfoModal}
        modalTitle={infoModalContent.title}
        modalContent={infoModalContent.content}
        isHTML={infoModalContent.isHTML}
        isModalDrawer={true}
        handleModalClose={() => {
          setShowInfoModal(false);
        }}
      />
    </>
  );
}
