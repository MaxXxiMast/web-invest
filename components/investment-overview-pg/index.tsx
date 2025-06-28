// NODE MODULES
import { useContext } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

// Components
import AccountInfoAccordian from './account-info-accordian';
import UserBankDetails from './BankDetails';
import InvestmentSummary from '../investment-overview/investment-summary';
import PaymentMethodPG from './PaymentMethodPG';
import AssetDetailsPG from './AssetDetailsPG';
import TermsPolicyWidget from '../investment-overview/terms-privacy-widget';
import PGPayButton from './PGPayButton';
import BottomSwitch from '../investment-success/MobileButtonSwitch';
import BookCall from '../common/BookCall/BookCall';

// Utils
import { GRIP_INVEST_BUCKET_URL, maskString } from '../../utils/string';
import { isAssetBasket, isSDISecondary } from '../../utils/financeProductTypes';
import {
  getSdiSummaryDetails,
  getBondsSummaryDetails,
  getBasketSummaryDetails,
} from '../../utils/investment';
import { getAmountPaybaleContentBreakdown } from '../assetDetails/AssetCalculator/utils/sdi_secondary_utils';
import { getAmountPaybaleContentBreakdownBonds } from '../assetDetails/AssetCalculator/utils/bond_utils';
import { isMldProduct } from '../../utils/asset';

// Primitive Components
import Button, { ButtonType } from '../primitives/Button';
import Image from '../primitives/Image';

// Context
import { InvestmentOverviewPGContext } from '../../contexts/investmentOverviewPg';

// Hooks
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../redux/slices/hooks';

// Styles
import styles from './InvestmentOverviewPG.module.css';

const renderPolicyWidget = ({ asset, isMobile }) => {
  const paymentExchangeCustomText = 'Order will be processed on';
  const termsPolicyWidget = (showPolicy = true, showPaymentExchange = true) => (
    <TermsPolicyWidget
      showPolicy={showPolicy}
      showPaymentExchange={showPaymentExchange && asset?.isRfq}
      paymentExchangeCustomText={paymentExchangeCustomText}
    />
  );

  return isMobile ? (
    <div className={`flex-column ${styles.PolicyWidget}`}>
      {termsPolicyWidget(true, false)}
      <PGPayButton />
      {asset?.isRfq && termsPolicyWidget(false)}
    </div>
  ) : (
    <>
      <PGPayButton />
      {termsPolicyWidget()}
    </>
  );
};

const RenderPaymentMethods = ({ asset, isMobile }) => {
  return (
    <div className={`flex-column ${styles.LeftSection}`}>
      <div className={styles.checkoutHeading}>Pay using</div>
      <UserBankDetails />
      <PaymentMethodPG />
      {renderPolicyWidget({ asset, isMobile })}
    </div>
  );
};

const RenderResouceManagerContact = ({ userKycDetails, router, userData }) => {
  const nextStep = (): [string, () => void, boolean] => {
    return ['Back to Discover', redirectToDiscover, false];
  };

  const redirectToDiscover = () => {
    router.push('/discover');
  };

  const list = [
    'UPI transactions above 1 lakh are not supported',
    `Our payment partner does not support your bank (${userKycDetails?.bank?.bankName})`,
  ];

  return (
    <div className={`flex-column ${styles.ResourceManagerContact}`}>
      <div className={`items-align-center-row-wise ${styles.ReasonTitle}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/Attention.svg`}
          alt="StatusIcon"
          width={40}
          height={40}
          layout={'fixed'}
        />
        <p className={styles.ResourceManagerContactTitle}>
          We cannot proceed with your order due to the following reasons
        </p>
      </div>

      <ul className={styles.listStyle}>
        {list.map((item) => (
          <li key={`value-${item}`}>{item}</li>
        ))}
      </ul>

      <BookCall
        className={styles.Bookcall}
        userData={userData}
        light={true}
        header={
          'Get in touch with your Relationship Manager to get assistance on completing this order.'
        }
      />
      <Button
        width="100%"
        onClick={redirectToDiscover}
        variant={ButtonType.Secondary}
        className={styles.DiscoverCta}
      >
        Back to Discover
      </Button>
      <div className={styles.bottomSwitch}>
        <BottomSwitch
          nextStep={nextStep}
          gotoAssets={redirectToDiscover}
          showSkipButton={false}
          showForwardIcon={false}
        />
      </div>
    </div>
  );
};

const RenderLeftSection = ({
  isLoading,
  isPaymentMethodAvailable,
  isMobile,
  userKycDetails,
  router,
  userData,
  asset,
}) => {
  if (!isLoading && !isPaymentMethodAvailable) {
    return RenderResouceManagerContact({ userKycDetails, router, userData });
  }

  return (
    <>
      {/* Mobile Only Section Start */}
      {isMobile && (
        <div className={styles.AssetDetailsPGMain}>
          <AssetDetailsPG />
        </div>
      )}
      {/* Mobile Only Section End */}
      {RenderPaymentMethods({ isMobile, asset })}
    </>
  );
};

export default function InvestmentOverviewPg() {
  const {
    userKycDetails,
    asset,
    lotSize,
    assetCalculationData,
    calculationDataBonds,
  }: any = useContext(InvestmentOverviewPGContext);

  const router = useRouter();
  const userData = useSelector((state) => (state as any)?.user?.userData ?? {});
  const { allPaymentMethodPG, isPaymentDetailsLoading: isLoading } =
    useAppSelector((state) => state.assets);
  const isMobile = useMediaQuery();

  const responseData: any = allPaymentMethodPG?.PG || {};
  const isPaymentMethodAvailable =
    responseData?.upi?.isAllowed ||
    responseData?.netBanking?.isAllowed ||
    (responseData?.offline?.isAllowed && asset?.isRfq);

  const { singleLotCalculation = {}, localProps } = useAppSelector(
    (state) => state.monthlyCard
  );

  const getSummaryData = () => {
    let summaryData = isSDISecondary(asset)
      ? getSdiSummaryDetails(asset, lotSize, assetCalculationData)
      : isAssetBasket(asset)
      ? getBasketSummaryDetails(asset, lotSize, assetCalculationData)
      : getBondsSummaryDetails(
          asset,
          lotSize,
          calculationDataBonds,
          assetCalculationData
        );
    let amountPaybaleBreakDown = [];
    let preTaxReturnPaybaleBreakDown = [];
    if (isSDISecondary(asset) || isAssetBasket(asset)) {
      let { amountPaybaleBreakDown: a, preTaxReturnPaybaleBreakDown: b } =
        getAmountPaybaleContentBreakdown(
          localProps?.pageData,
          singleLotCalculation,
          lotSize
        );
      amountPaybaleBreakDown = a;
      preTaxReturnPaybaleBreakDown = b;
    } else {
      let { amountPaybaleBreakDown: a, preTaxReturnPaybaleBreakDown: b } =
        getAmountPaybaleContentBreakdownBonds(
          localProps?.pageData,
          singleLotCalculation,
          lotSize,
          isMldProduct(asset)
        );
      amountPaybaleBreakDown = a;
      preTaxReturnPaybaleBreakDown = b;
    }
    amountPaybaleBreakDown = amountPaybaleBreakDown.map((ele: any) => {
      if (ele?.id === 'brokerageFees') {
        ele.isCampaignEnabled = true;
        ele.cutoutValue = ele.value;
        ele.value = '₹0';
      }
      ele.title = ele.label;
      ele.tooltipData = ele.tooltip;
      return ele;
    });
    preTaxReturnPaybaleBreakDown = preTaxReturnPaybaleBreakDown.map(
      (ele: any) => {
        ele.title = ele.label;
        ele.tooltipData = ele.tooltip;
        return ele;
      }
    );
    summaryData[1].summary = amountPaybaleBreakDown;
    summaryData[2].summary = preTaxReturnPaybaleBreakDown;
    return summaryData;
  };

  return (
    <div className={styles.Wrapper}>
      <div className="containerNew">
        <div className={styles.MainContainer}>
          {/* Left Section Start */}
          {RenderLeftSection({
            isLoading,
            isPaymentMethodAvailable,
            isMobile,
            userKycDetails,
            router,
            userData,
            asset,
          })}
          {/* Left Section END */}
          {/* Right Section Start */}
          <div className={styles.RightSection}>
            <AccountInfoAccordian
              userName={`${userKycDetails?.bank?.accountName}`}
              key={'user-account-info-mobile'}
              dematNo={maskString(
                `${userKycDetails?.depository?.dpID}${userKycDetails?.depository?.clientID}`
              )}
              panNo={maskString(userKycDetails?.pan?.panNumber)}
              className={`${styles.AccountInfo} `}
            />
            <div className={styles.OrderSummaryTitle}>Order Summary</div>
            <InvestmentSummary
              data={getSummaryData()}
              asset={asset}
              className={styles.InvestmentSummary}
            />
          </div>
          {/* Right Section End */}
        </div>
      </div>
    </div>
  );
}
