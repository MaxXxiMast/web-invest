import { useContext, useEffect, useState } from 'react';

// Primitives
import Image from '../../primitives/Image';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import InvestmentSummaryUI from '../../primitives/InvestrmentSummaryUI';

// Components
import AccountInfoAccordian from '../../investment-overview-pg/account-info-accordian';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { getOrderDetails } from './orderUtils';
import { fetchUserDetails } from '../../../api/user';
import { trackEvent } from '../../../utils/gtm';

// Contexts
import { PendingPgOrderContext } from '../../../pages/pg-confirmation';

// Redux
import { useAppSelector } from '../../../redux/slices/hooks';

// Styles
import classes from './OrderPayment.module.css';

type AccountInfoProps = {
  userName?: string;
  dematNo?: string;
  panNo?: string;
};

const AccountInfo: React.FC<{ accountInfo: AccountInfoProps }> = ({
  accountInfo,
}) => {
  const { userName, dematNo, panNo } = accountInfo;

  if (!dematNo) {
    return (
      <CustomSkeleton
        styles={{ width: '100%', height: 50 }}
        className={classes.Skeleton}
      />
    );
  }

  return (
    <AccountInfoAccordian
      userName={userName}
      key="user-account-info-mobile"
      dematNo={dematNo}
      panNo={panNo}
      className={classes.AccountInfo}
    />
  );
};

const AssetInfo: React.FC<{
  data: any;
  isLoading: boolean;
}> = ({ data, isLoading }) => {
  const { singleLotCalculation = {}, localProps = {} } = useAppSelector(
    (state) => state.monthlyCard
  );
  if (isLoading) {
    return (
      <CustomSkeleton
        styles={{ width: '100%', height: 350 }}
        className={classes.Skeleton}
      />
    );
  }

  if (!data) return null;

  const {
    isAmo,
    financeProductType,
    preTaxYtm,
    maturityDate,
    irr,
    purchasePrice,
    unitPrice,
    units,
    preTaxReturns,
    postTaxReturns,
    principalAmount,
    totalInterest,
    amount,
    isFdOrder,
    assetImage,
    assetName,
  } = data;

  const InvestmentSummaryData = {
    financeProductType,
    preTaxYtm,
    maturityDate,
    irr,
    investedAmount: purchasePrice,
    unitPrice,
    units,
    preTaxReturns,
    postTaxReturns,
    principalAmount,
    totalInterest,
    amount,
    isFdOrder,
  };

  const handleOnClickInvestmentSummary = (isExpanded: boolean) => {
    trackEvent('Order Summary Clicked', {
      product_category: data?.financeProductType,
      assetID: data?.maturityDate,
      assetName: assetName,
      quantities_selected: data?.units,
      amo: isAmo,
      action: isExpanded ? 'expanded' : 'collapsed',
    });
  };

  return (
    <div className={classes.AssetDetailsMain}>
      <div className={classes.OrderSummaryTitle}>Order Summary</div>
      {isAmo ? (
        <div className={`flex items-center ${classes.amoBadge}`}>
          <span className={`icon-amo-icon ${classes.AmoIcon}`} />
          <span>After Market Order</span>
        </div>
      ) : null}
      <InvestmentSummaryUI
        data={getOrderDetails(
          InvestmentSummaryData,
          singleLotCalculation,
          localProps.pageData
        )}
        asset={{
          partnerLogo: assetImage,
          partnerName: assetName,
        }}
        className={classes.InvestmentSummary}
        handleOnClickCB={handleOnClickInvestmentSummary}
      />
    </div>
  );
};

const AwarenessSection: React.FC = () => (
  <div className={classes.awarenessContainer}>
    <Image
      src={`${GRIP_INVEST_BUCKET_URL}icons/Awareness.gif`}
      alt="InfoIcon"
      width={350}
      height={280}
      className={classes.awareness}
      layout="fixed"
    />
  </div>
);

export const OrderPayment: React.FC = () => {
  const data = useContext(PendingPgOrderContext);
  const [accountInfo, setAccountInfo] = useState<AccountInfoProps>({});

  useEffect(() => {
    fetchUserDetails().then((res) => {
      const {
        firstName = '',
        lastName = '',
        panNo = '',
        dematAccountNumber = '',
        bankDetails,
      } = res || {};
      const bankUserName =
        bankDetails?.bankAccountName || `${firstName} ${lastName}`;
      setAccountInfo({
        userName: bankUserName,
        dematNo: dematAccountNumber,
        panNo,
      });
    });
  }, []);

  return (
    <div className={`flex-column ${classes.OrderPaymentcontainer}`}>
      <AccountInfo accountInfo={accountInfo} />
      <AssetInfo data={data} isLoading={data?.loading || false} />
      <AwarenessSection />
    </div>
  );
};
