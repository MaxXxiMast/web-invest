// NODE MODULES
import { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

// UTILS
import { handleExtraProps } from '../../../utils/string';

// Components
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
import PartnerLogo from '../../assetsList/partnerLogo';
import PriceWidget from '../../primitives/PriceWidget';

// Styles
import classes from './InvestmentSummaryUI.module.css';

type Props = {
  data: DataProps[];
  className?: string;
  asset: any;
  isAccordian?: boolean;
  handleOnClickCB?: (isExpanded: boolean) => void;
};

type SummaryData = {
  title: string;
  value: string | number;
  tooltipData?: string | number;
  id?: string;
  cutoutValue?: string;
  isCampaignEnabled?: boolean;
  isNegative?: boolean;
};

type DataProps = {
  title: string;
  value?: string | number;
  tooltipData?: string | number;
  imageUrl?: string;
  summary?: SummaryData[];
  isOpen?: boolean;
  id?: string;
  cutoutValue?: string;
  isCampaignEnabled?: boolean;
};

/**
 * Investment summary component
 * Component to display calculation summary with accordion elements
 * @param data Array of data
 * @returns
 */

const InvestmentSummaryUI = ({
  className = '',
  data = [],
  asset = {},
  isAccordian = true,
  handleOnClickCB = () => {},
}: Props) => {
  const [widgetDataArr, setWidgetDataArr] = useState([]);

  useDeepCompareEffect(() => {
    if (data.length > 0) {
      const widgetData = data.map((ele, index) => ({
        ...ele,
        isOpen: isAccordian ? index === 0 : true,
      }));
      setWidgetDataArr(widgetData);
    }
  }, [data]);

  const handleOnClick = (index: number) => {
    if (!isAccordian) return;

    const updatedData = widgetDataArr.map((item, idx) => ({
      ...item,
      isOpen: idx === index ? !item.isOpen : item.isOpen,
    }));
    setWidgetDataArr(updatedData);
    handleOnClickCB(updatedData[index].isOpen);
  };

  if (widgetDataArr.length === 0) {
    return null;
  }

  return (
    <div className={`${classes.Wrapper} ${handleExtraProps(className)}`}>
      {widgetDataArr.map((ele: DataProps, index: number) => {
        return (
          <div
            className={classes.Widget}
            key={`${ele?.title}`}
            id="summaryWidget"
          >
            <div className={classes.Header}>
              <div className={classes.Left}>
                {!index ? (
                  <PartnerLogo
                    isPartnershipText
                    asset={asset}
                    isAssetList
                    height={40}
                  />
                ) : (
                  <span>{ele?.title}</span>
                )}

                {ele?.tooltipData ? (
                  <TooltipCompoent
                    toolTipText={ele?.tooltipData}
                    linkClass={classes.Tooltip}
                  >
                    <span className={`icon-info ${classes.InfoIcon}`} />
                  </TooltipCompoent>
                ) : null}
              </div>
              <div
                className={classes.Right}
                onClick={() => handleOnClick(index)}
              >
                <span className={!index ? classes.Badge : classes.Value}>
                  {ele.value}
                </span>
                {ele?.summary?.length > 0 && isAccordian ? (
                  <span
                    className={`${classes.Caret} ${
                      ele.isOpen ? classes.UpCaret : ''
                    }`}
                  >
                    <span className={`icon-caret-down ${classes.Caret}`} />
                  </span>
                ) : null}
              </div>
            </div>
            {ele?.summary?.length > 0 && ele.isOpen ? (
              <div className={`${classes.Body} flex-column`}>
                {ele.summary.map((el) => {
                  return (
                    <div className={classes.Summary} key={`${ele?.title}`}>
                      <div className={classes.SummaryLeft}>
                        <span>{el?.title}</span>
                        {el?.tooltipData ? (
                          <TooltipCompoent
                            toolTipText={el?.tooltipData}
                            linkClass={classes.Tooltip}
                          >
                            <span className={`icon-info ${classes.InfoIcon}`} />
                          </TooltipCompoent>
                        ) : null}
                      </div>
                      <PriceWidget
                        isCampaignEnabled={el?.isCampaignEnabled}
                        originalValue={`${el?.value}`}
                        cutoutValue={`${el?.cutoutValue}`}
                        isNegative={el?.isNegative}
                        id={el?.id}
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default InvestmentSummaryUI;
