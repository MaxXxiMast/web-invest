import React from 'react';

import ResultRow from '../ResultRow';
import Button, { ButtonType } from '../../Button';
import Image from '../../Image';
import TooltipCompoent from '../../TooltipCompoent/TooltipCompoent';

import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';

import styles from './ResultTable.module.css';

const ResultTable = ({
  resetFilters,
  handleChangeDealModal,
  totalNumberOfDeals,
  mainViewDeals,
  redirectToAsset,
  filterAndCompareData,
}) => {
  const tableHeaders = [
    'Asset Type',
    'Returns',
    'Tenure',
    'Rating',
    'Min Invest',
    'Security Cover',
  ];
  const renderTooltipHeader = (item) => (
    <th key={item} className={`flex_wrapper ${styles.headerContent}`}>
      {item}{' '}
      {Boolean(filterAndCompareData?.tooltips?.[item]) ? (
        <TooltipCompoent toolTipText={filterAndCompareData?.tooltips?.[item]}>
          <span className="icon-info" />
        </TooltipCompoent>
      ) : null}
    </th>
  );

  const renderNoResults = () => (
    <div className={styles.noResults}>
      <h3>0 Result Found!</h3>
      <p>
        Try adjusting your filters to discover more investment opportunities.
      </p>
      <Button variant={ButtonType.Inverted} onClick={resetFilters} width={125}>
        Reset Filter
      </Button>
    </div>
  );

  const renderFilteredDeals = () => (
    <table className={styles.resultTable}>
      <thead>
        <tr className={`flex-column ${styles.headerContainer}`}>
          <th className={totalNumberOfDeals < 3 ? styles.smHd : styles.lgHd}>
            <span className={styles.totalResults}>
              {`${totalNumberOfDeals} ${
                totalNumberOfDeals > 1 ? 'Results' : 'Result'
              }`}
            </span>
          </th>
          {tableHeaders.map(renderTooltipHeader)}
        </tr>
      </thead>
      <tbody className={styles.tableBody}>
        {mainViewDeals?.slice(0, 2).map((deal, index) => (
          <tr key={deal?.assetID} className={styles.tableRow}>
            <ResultRow
              deal={deal}
              handleChangeDealModal={(e) => handleChangeDealModal(e, index)}
              totalNumberOfDeals={totalNumberOfDeals}
              redirectToAsset={redirectToAsset}
              tooltips={filterAndCompareData?.tooltips || {}}
            />
          </tr>
        ))}
        {mainViewDeals?.length === 1 && (
          <tr className={`${styles.tableRow} ${styles.placeholderRow}`}>
            <td
              colSpan={8}
              className={`flex_wrapper ${styles.placeholderContent}`}
            >
              <div className={styles.placeholder}>
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}commons/filter.svg`}
                  layout="fixed"
                  height={24}
                  width={24}
                  alt={'filter'}
                  className={styles.filterIcon}
                />
                <p>Adjust filters to find more deals</p>
                <Button
                  variant={ButtonType.Inverted}
                  onClick={resetFilters}
                  width={'125px'}
                  className={styles.resetBtn}
                >
                  Reset Filter
                </Button>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div>
      {mainViewDeals.length === 0 ? renderNoResults() : renderFilteredDeals()}
    </div>
  );
};

export default ResultTable;
