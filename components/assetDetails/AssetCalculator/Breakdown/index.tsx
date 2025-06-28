// NODE MODULES
import { useState } from 'react';
import RHP from 'react-html-parser';

// Components
import TooltipCompoent from '../../../primitives/TooltipCompoent/TooltipCompoent';
import InfoModal from '../../../primitives/InfoModal/Infomodal';

// Utils
import { handleExtraProps } from '../../../../utils/string';
import { trackEvent } from '../../../../utils/gtm';
import { convertCurrencyToNumber } from '../../../../utils/number';

// Types
import { AmountBreakdown } from '../types';

// Styles
import styles from './Breakdown.module.css';
import NumberAnimation from '../../../number-animator';

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
    numValue: number;
  };
  breakdownData: AmountBreakdown[];
  className?: string;
};

export default function Breakdown({
  id,
  asset,
  topData,
  breakdownData,
  className,
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
      id,
      isShowTooltip = false,
    } = breakDown ?? {};

    return (
      <li key={`${label}-${index}`}>
        <span className={styles.CountLabel}>
          {label}{' '}
          {Boolean(modalLinkLabel) ? (
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
          ) : null}
          {Boolean(isShowTooltip) ? (
            <TooltipCompoent toolTipText={RHP(tooltip)}>
              <span className={`icon-info ${styles.InfoIcon}`} />
            </TooltipCompoent>
          ) : null}
        </span>
        <div className={`${styles.PreTaxAmoount} ${styles.CalculatedAmount}`}>
          <span
            className={` ${
              id === 'brokerageFees' && value !== '₹0.00'
                ? styles.BrokerageFees
                : ''
            }`}
          >
            {value}
          </span>
          {id === 'brokerageFees' && value !== '₹0.00' && <span>&nbsp;₹0</span>}
        </div>
      </li>
    );
  };

  const handleAccordionClick = () => {
    setShowAccordian(!showAccordian);

    if (topData?.label == 'Pre-Tax Returns') {
      trackEvent('Pre Tax Returns Previewed', {
        action: showAccordian ? 'collapsed' : 'expanded',
        principal_amount: convertCurrencyToNumber(
          breakdownData.find((item) => item.id === 'principalAmount')?.value
        ),
        total_interest: convertCurrencyToNumber(
          breakdownData.find((item) => item.id === 'totalInterest')?.value
        ),
        product_category: asset?.productCategory,
        product_sub_category: asset?.productSubcategory,
        financial_product_type: asset?.financeProductType,
        asset_id: asset?.assetID,
      });
    }

    if (topData?.label == 'Amount Payable') {
      const principalAmount = breakdownData.find(
        (item) => item.id === 'purchasePrice'
      )?.value;

      const premium = breakdownData.find(
        (item) => item.id === 'totalAdditionalCharges'
      )?.value;

      const stampDuty = breakdownData.find(
        (item) => item.id === 'stampDuty'
      )?.value;

      const accruedInterest = breakdownData.find(
        (item) => item.id === 'accruedInterest'
      )?.value;

      trackEvent('Amount Payable Previewed', {
        action: showAccordian ? 'collapsed' : 'expanded',
        principal_amount: convertCurrencyToNumber(principalAmount),
        accured_interest: convertCurrencyToNumber(accruedInterest),
        premium: convertCurrencyToNumber(premium),
        stamp_duty: convertCurrencyToNumber(stampDuty),
        product_category: asset?.productCategory,
        product_sub_category: asset?.productSubcategory,
        financial_product_type: asset?.financeProductType,
        asset_id: asset?.assetID,
      });
    }
  };

  const renderTopWithBreakdown = ({
    label,
    tooltipText,
    uiValue,
    numValue,
  }) => {
    return (
      <li className={handleExtraProps(className)}>
        <span className={styles.CountLabel}>
          {label}

          <TooltipCompoent toolTipText={tooltipText}>
            <span className={`icon-info ${styles.InfoIcon}`} />
          </TooltipCompoent>
        </span>

        <div
          className={`${styles.PreTaxAmoount} ${styles.PreTaxAmoountSDI} ${
            showAccordian ? 'Active' : ''
          }`}
          onClick={handleAccordionClick}
        >
          <span className={styles.CalculatedAmount}>
            <NumberAnimation numValue={numValue} />
          </span>
          <span className={styles.CaretDown}>
            <span className={`icon-caret-down ${styles.Caret}`} />
          </span>
        </div>
      </li>
    );
  };

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
