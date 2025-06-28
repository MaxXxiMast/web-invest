import { useState } from 'react';
import RHP from 'react-html-parser';
import { numberToIndianCurrency } from '../../../../utils/number';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import TooltipCompoent from '../../../primitives/TooltipCompoent/TooltipCompoent';
import styles from './SideBarCalculator.module.css';
import Button, { ButtonType } from '../../../primitives/Button';
import InfoModal from '../../../primitives/InfoModal/Infomodal';

export const ReturnAndInvestmentModal = ({
  showModal,
  setShowModal,
  amountBreakdown,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({
    title: '',
    content: '',
    isHTML: false,
  });
  const handleInfoModalClick = (val: any) => {
    setShowInfoModal(true);
    setInfoModalContent({ ...val });
  };

  return (
    <>
      <MaterialModalPopup
        showModal={showModal}
        isModalDrawer
        hideClose
        handleModalClose={() => {
          setShowModal(false);
        }}
      >
        <div>
          <div className={`flex ${styles.Header}`}>
            <div className="flex-one">
              {amountBreakdown?.label}
              <TooltipCompoent toolTipText={amountBreakdown?.tooltipText}>
                <span className={`icon-info ${styles.InfoIcon}`} />
              </TooltipCompoent>
            </div>

            <div className="value">
              {numberToIndianCurrency(amountBreakdown?.numValue)}
            </div>
          </div>
          <div className={styles.RowGroup}>
            {amountBreakdown?.breakDownData?.map((item: any) => {
              return (
                <div
                  className={`flex items-center ${styles.Row}`}
                  key={item.label}
                >
                  <div className="flex-one">
                    <span className={styles.label}>{item.label}</span>
                    {Boolean(item?.modalLinkLabel) ? (
                      <span
                        className={styles.modalLinkLabel}
                        onClick={() =>
                          handleInfoModalClick({
                            title: item?.modalTitle,
                            content: item?.modalContent,
                            isHTML: item?.isHTML,
                          })
                        }
                      >
                        {item?.modalLinkLabel}
                      </span>
                    ) : null}
                    {Boolean(item?.isShowTooltip) ? (
                      <TooltipCompoent toolTipText={RHP(item?.tooltip)}>
                        <span className={`icon-info ${styles.InfoIcon}`} />
                      </TooltipCompoent>
                    ) : null}
                  </div>
                  <div className={`${styles.value}`}>
                    <span
                      className={` ${
                        item?.id === 'brokerageFees' && item?.value !== '₹0.00'
                          ? styles.BrokerageFees
                          : ''
                      }`}
                    >
                      {item?.value}
                    </span>
                    {item?.id === 'brokerageFees' &&
                      item?.value !== '₹0.00' && <span>&nbsp;₹0</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            width="100%"
            variant={ButtonType.Secondary}
            onClick={() => setShowModal(false)}
          >
            Got it
          </Button>
        </div>
      </MaterialModalPopup>
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
};
