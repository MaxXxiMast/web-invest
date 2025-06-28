// NODE MODULES
import { useState } from 'react';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';

// Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

// Utils
import { numberToIndianCurrencyWithDecimals } from '../../../../utils/number';
import { getReturnsSplitByDisplayOrder, returnsSplitMapping } from './utils';
import { trackEvent } from '../../../../utils/gtm';

// Styles
import styles from './ReturnsAccordian.module.css';

type ReturnAccordianProps = {
  totalAmount: number;
  returnsSplit: Record<string, any>;
  tdsAmount: number;
};

export default function ReturnsAccordian({
  totalAmount,
  returnsSplit,
  tdsAmount,
}: ReturnAccordianProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { selectedAssetType = 'Bonds, SDIs & Baskets' } = useAppSelector(
    (state) => state.portfolioSummary
  );

  const { userID = '' } = useAppSelector((state) => state?.user?.userData);

  const handleClick = (event) => {
    if (!isExpanded) {
      trackEvent('portfolio_summary_detail_drilldown', {
        timestamp: new Date().toISOString(),
        user_id: userID,
        asset_type: selectedAssetType,
        returns_breakup: returnsSplit,
      });
    }
    setAnchorEl(event.currentTarget);
    setIsExpanded((previousOpen) => !previousOpen);
  };

  const getReturnSplit = (key: string) => {
    if (key === 'preTaxReturn') {
      return `- ${numberToIndianCurrencyWithDecimals(tdsAmount)}`;
    }

    return numberToIndianCurrencyWithDecimals(returnsSplit[key]);
  };

  const renderReturnsDetails = () => {
    const returnSplitData = getReturnsSplitByDisplayOrder({
      ...returnsSplit,
      preTaxReturn: tdsAmount,
    });
    return (
      <div className={`flex-column ${styles.Container}`}>
        {returnSplitData.map((key) => {
          let label = returnsSplitMapping?.[key]?.label ?? '';

          if (!label) return null;

          if (key === 'preTaxReturn' && tdsAmount <= 0) {
            return null;
          }

          return (
            <div
              className={`flex ${styles.returnData} justify-between`}
              key={key}
            >
              <span>{label}</span>
              <span>{getReturnSplit(key)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const id = isExpanded ? 'transition-popper' : undefined;

  if (['LLPs & CRE', 'Startup Equity'].includes(selectedAssetType)) {
    return (
      <span className={styles.Amount}>
        {numberToIndianCurrencyWithDecimals(Number(totalAmount))}
      </span>
    );
  }

  return (
    <div
      className={styles.MenuButton}
      aria-describedby={id}
      onClick={handleClick}
    >
      <div className={styles.MenuContainer}>
        <span className={`flex-one`}>
          {numberToIndianCurrencyWithDecimals(Number(totalAmount - tdsAmount))}
        </span>
        <span
          className={`icon-caret-up ${styles.ArrowIcon} ${
            isExpanded ? '' : styles.Rotate180
          }`}
        />

        <Popper
          id={id}
          open={isExpanded}
          anchorEl={anchorEl}
          placement="bottom-end"
        >
          {() => (
            <ClickAwayListener onClickAway={() => setIsExpanded(false)}>
              {renderReturnsDetails()}
            </ClickAwayListener>
          )}
        </Popper>
      </div>
    </div>
  );
}
