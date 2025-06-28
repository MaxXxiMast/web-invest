// NODE MODULES
import { useContext, useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

// UTILS
import { handleExtraProps } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';

// Contexts`
import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';
import { InvestmentOverviewPGContext } from '../../../contexts/investmentOverviewPg';
import { useAppSelector } from '../../../redux/slices/hooks';

// Components
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
import PartnerLogo from '../../assetsList/partnerLogo';
import PriceWidget from '../../primitives/PriceWidget';

// Styles
import classes from './InvestmentSummary.module.css';

type Props = {
  data: DataProps[];
  className?: string;
  asset: any;
  isAccordian?: boolean;
};

type SummaryData = {
  title: string;
  value: string | number;
  tooltipData?: string | number;
  id?: string;
  cutoutValue?: number;
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
};

/**
 * Investment summary component
 * Component to display calculation summary with accordion elements
 * @param data Array of data
 * @returns
 */

const InvestmentSummary = ({
  className = '',
  data = [],
  asset = {},
  isAccordian = true,
}: Props) => {
  const marketTiming = useAppSelector((state) => state.config.marketTiming);
  const { tooltipData }: any = useContext(InvestmentOverviewContext);
  const { lotSize, assetCalculationData }: any = useContext(
    InvestmentOverviewPGContext
  );
  const [widgetDataArr, setWidgetDataArr] = useState([]);

  useDeepCompareEffect(() => {
    if (data.length > 0) {
      const widgetData = data.map((ele, index) => {
        const elData: DataProps = ele;
        if (isAccordian) {
          elData.isOpen = index === 0 ? true : false;
        } else {
          elData.isOpen = true;
        }
        return elData;
      });
      setWidgetDataArr(widgetData);
    }
  }, [data]);

  const handleOnClick = (index: number) => {
    if (!isAccordian) return;
    setWidgetDataArr((data) =>
      data.map((item, i) =>
        i === index ? { ...item, isOpen: !item.isOpen } : item
      )
    );
    const clickedWidget = widgetDataArr[index];
    const isCurrentlyOpen = clickedWidget?.isOpen;

    trackEvent('Order Summary Clicked', {
      product_category: asset?.productCategory,
      product_sub_category: asset?.productSubcategory,
      assetID: asset?.assetID,
      assetName: asset?.name,
      quantities_selected: lotSize,
      rfq_enabled: asset?.isRfq,
      payble_amount: assetCalculationData?.investmentAmount,
      amo: !marketTiming?.isMarketOpenNow && asset?.isRfq,
      action: isCurrentlyOpen ? 'collapsed' : 'expanded',
    });
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
            key={`${ele?.id}__${ele?.title}`}
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

                {tooltipData?.[ele?.id] ?? ele?.tooltipData ? (
                  <TooltipCompoent
                    toolTipText={tooltipData?.[ele?.id] ?? ele?.tooltipData}
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
                    <div
                      className={classes.Summary}
                      key={`${el?.id}__${el?.title}`}
                    >
                      <div className={classes.SummaryLeft}>
                        <span>{el?.title}</span>
                        {tooltipData?.[el?.id] ?? el?.tooltipData ? (
                          <TooltipCompoent
                            toolTipText={
                              tooltipData?.[el?.id] ?? el?.tooltipData
                            }
                            linkClass={classes.Tooltip}
                          >
                            <span className={`icon-info ${classes.InfoIcon}`} />
                          </TooltipCompoent>
                        ) : null}
                      </div>
                      <PriceWidget
                        id={el?.id}
                        isCampaignEnabled={el?.isCampaignEnabled}
                        originalValue={`${el?.value}`}
                        cutoutValue={`${el?.cutoutValue}`}
                        isNegative={el?.isNegative}
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

export default InvestmentSummary;
