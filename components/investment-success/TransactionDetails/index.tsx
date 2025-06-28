// NODE MODULES
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Cookie from 'js-cookie';

// Components
import BrokingPartnerInfo from '../../assetDetails/BrokingPartnerInfo';
import Image from '../../primitives/Image';
import Button from '../../primitives/Button';
import BottomSwitch from '../MobileButtonSwitch';

// Utils
import { getTxnID, isMldProduct } from '../../../utils/asset';
import {
  financeProductTypeConstants,
  isAssetCommercialProduct,
  isAssetBonds,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import {
  numberToCurrency,
  numberToIndianCurrencyWithDecimals,
  SDISecondaryAmountToCommaSeparator,
} from '../../../utils/number';
import {
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
  GRIP_INVEST_BUCKET_URL,
} from '../../../utils/string';
import {
  BondsCalcultionDataModal,
  BondsMldCalcultionDataModal,
} from '../../../utils/bonds';
import { redirectHandler } from '../../../utils/windowHelper';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// APIS
import {
  fetchDematAccInformationWithoutAssetID,
  handleAssetCalculation,
} from '../../../api/assets';
import { isGCOrder } from '../../../utils/gripConnect';

// Styles
import styles from './TransactionDetail.module.css';

const TransactionDetails = (props: any) => {
  const isMobile = useMediaQuery();
  const { order, asset, isBondOrder } = props;
  const [calData, setCalcData] = useState<any>({});
  const [dematNo, setDematNo] = useState('');
  const [isLoading, setLoading] = useState(false);

  const isGC = isGCOrder();

  // GET AssetID from Selected Order
  const { assetID = '' } = useSelector(
    (state) => (state as any)?.orders?.selectedOrder ?? {}
  );

  const { gcCallbackUrl } = useAppSelector((state) => state.gcConfig.gcData);

  useEffect(() => {
    if (assetID && props?.isBondOrSdiSecondaryOrder) {
      fetchDematAccInformationWithoutAssetID()
        .then((res) => {
          const { dpID = '', clientID = '' } = res?.kycTypes?.[0]?.fields || {};
          setDematNo(dpID + clientID);
        })
        .catch((err) => {
          console.log('Error in fetching demat account information', err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commonView = (isMobile: boolean) => {
    return (
      <>
        <div
          className={
            !isMobile ? styles.mainContainer : styles.mobileMainContainer
          }
        >
          <div
            className={`${styles.subContainer} ${
              isAssetBonds(asset) ? styles.AssetBondPayment : ''
            }`}
          >
            {/* Added this because of unnatural sizes of asset images which in gets blurry */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order?.partnerLogo || asset?.partnerLogo}
              alt="Investment Success"
              width={'auto'}
              height={32}
              onClick={props?.showAssetDetails}
            />
            {renderReturnDetails()}
            {props?.isBondOrSdiSecondaryOrder ? renderDematDetails() : null}
            {!props?.isBondOrSdiSecondaryOrder ? renderTaxDetails() : null}
          </div>
          {isBondOrder ? (
            <div
              className={`${styles.partnerInfoContainer} ${
                isMobile ? styles.partnerInfoPadding : ''
              }`}
            >
              <BrokingPartnerInfo
                logo={`${GRIP_INVEST_BUCKET_URL}commons/gripbroking-logo.svg`}
                showConsent={false}
              />
            </div>
          ) : null}
          {renderGCRedirectionButton(isMobile)}
        </div>
      </>
    );
  };

  const renderDetails = (data: { label: string; value: unknown }[]) => {
    return data.map((item) => {
      const { label, value } = item;
      return (
        <div key={label} className={styles.dealContainer}>
          <div className={styles.yourInvestmentContainer}>
            <span className={styles.otherDetails}>{label}</span>
          </div>
          <div className={styles.yourReturnContainer}>
            <span className={styles.otherDetails}>{`${value}`}</span>
          </div>
        </div>
      );
    });
  };

  const renderDematDetails = () => {
    const dematDetails = [
      {
        label: 'DEMAT A/C',
        value: dematNo,
      },
      {
        label: 'Order ID',
        value: getTxnID(order?.orderID),
      },
    ];

    return renderDetails(dematDetails);
  };

  const renderTaxDetails = () => {
    const taxDetails = [
      {
        label: `Txn ID: ${getTxnID(order?.orderID)}`,
        value: `Deal: ${getTxnID(order?.assetName)}`,
      },
    ];

    return renderDetails(taxDetails);
  };

  const getBondDetails = async () => {
    const calculationData = await handleAssetCalculation(
      asset?.assetID,
      order?.units
    );
    const { assetCalcDetails } = calculationData;

    const data: Partial<
      BondsCalcultionDataModal & BondsMldCalcultionDataModal
    > = {
      accruedInterest: assetCalcDetails?.accruedInterest,
      investmentAmount: assetCalcDetails?.investmentAmount,
      principalAmount: assetCalcDetails?.principalAmount,
      purchasePrice: assetCalcDetails?.purchasePrice,
      preTaxReturns: assetCalcDetails?.preTaxReturns,
      totalInterest: assetCalcDetails?.totalInterest,
      discountedPrice: assetCalcDetails?.discountedPrice,
      preTaxAmount: assetCalcDetails?.preTaxReturns,
      redemptionPrice: assetCalcDetails?.redemptionPrice,
      stampDuty: assetCalcDetails?.stampDuty,
    };
    setCalcData(data);
  };

  useEffect(() => {
    if (asset?.assetID) {
      getBondDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.assetID]);

  const getReturnsAmount = () => {
    if (
      order?.financeProductType === financeProductTypeConstants.startupEquity
    ) {
      return 'On Exit';
    }

    if (order?.financeProductType === financeProductTypeConstants.sdi) {
      return `₹ ${SDISecondaryAmountToCommaSeparator(
        props?.order?.preTaxAmount
      )}`;
    }

    if (asset?.financeProductType === financeProductTypeConstants.bonds) {
      if (isMldProduct(asset)) {
        return `₹
        ${numberToCurrency(calData?.preTaxAmount?.toFixed(2), true)}`;
      }
      return `₹
         ${numberToCurrency(
           Number(calData?.totalInterest + calData?.principalAmount)?.toFixed(
             2
           ),
           true
         )}`;
    }

    return `₹ ${numberToCurrency(String(order?.postTaxAmount))}`;
  };

  const renderAmountTitle = () => {
    if (isAssetBonds(asset)) {
      return 'Amount Paid';
    }
    if (isSDISecondary(asset)) {
      return 'Investment Amount';
    }
    return 'Your Investment';
  };

  const getInvestedAmountText = () => {
    return numberToIndianCurrencyWithDecimals(order?.amount);
  };

  const redirectToGC = () => {
    // GET Redirection URL
    setLoading(true);
    const callBackURL = gcCallbackUrl || Cookie.get('gc_callback_url');
    Cookie.remove('gc_callback_url');
    const finalURL = `${callBackURL}?type=payment&transaction_id=${order?.transactionID}&status=PENDING&msg=PENDING`;
    redirectHandler({
      pageUrl: finalURL || '/',
      pageName: 'gc_redirection_from_transaction_details',
    });
  };

  const renderGCRedirectionButton = (isMobile = false) => {
    if (!isGC) return null;

    if (isMobile) {
      const nextStepGC = (): [string, () => void, boolean] => [
        'View more assets',
        () => {
          redirectToGC();
        },
        isLoading,
      ];

      return (
        <BottomSwitch
          nextStep={nextStepGC}
          gotoAssets={() => {}}
          showSkipButton={false}
        />
      );
    }

    return (
      <Button
        width={'100%'}
        onClick={() => redirectToGC()}
        isLoading={isLoading}
      >
        View More Assets
      </Button>
    );
  };

  const renderReturnDetails = () => {
    return (
      <div
        className={`${
          !props?.isCommercialOrder
            ? styles.returnContainer
            : styles.commercialReturnContainer
        }`}
      >
        <div
          className={`${
            !props?.isCommercialOrder
              ? styles.yourInvestmentContainer
              : styles.yourInvestmentContainerCommercial
          }`}
        >
          <span className={styles.investmentTypeHeading}>
            {renderAmountTitle()}
          </span>
          <span className={styles.investedAmount}>
            {getInvestedAmountText()}
          </span>
        </div>
        {!props?.isCommercialOrder && (
          <>
            <Image
              src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/flow.svg`}
              alt="Investment Success"
              width={40}
              height={40}
              layout="fixed"
            />
            <div className={styles.yourReturnContainer}>
              <span className={styles.investmentTypeHeading}>
                {props?.isBondOrSdiSecondaryOrder ||
                isAssetCommercialProduct(asset)
                  ? 'Pre'
                  : 'Post'}
                -tax returns
              </span>
              <span className={styles.calculatedReturns}>
                {getReturnsAmount()}
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderChildren = () => {
    return isMobile ? commonView(true) : commonView(false);
  };

  return renderChildren();
};

export default TransactionDetails;
