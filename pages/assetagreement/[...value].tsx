import { useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

//Components
import CircularProgress from '@mui/material/CircularProgress';
import PageContainer from '../../components/common/PageContainer';
import Seo from '../../components/layout/seo';
import Header from '../../components/common/Header';
import PGHeader from '../../components/investment-overview-pg/PGHeader';
import { InvestmentOverviewContext } from '../../components/assetAgreement/RfqInvestment';
import InvestmentOverviewPg from '../../components/investment-overview-pg';

//APIs
import { callErrorToast, fetchAPI } from '../../api/strapi';
import { handleAssetCalculation } from '../../api/assets';
import { moveDocuments } from '../../api/document';
import { fetchUserDebarmentDetails } from '../../api/user';
import { fetchMarketTiming } from '../../api/rfq';
import { handleKycStatus } from '../../api/rfqKyc';

//Dynamic Components
const MaterialModalPopup = dynamic(
  () => import('../../components/primitives/MaterialModalPopup'),
  { ssr: false }
);
const InvestmentOverview = dynamic(
  () => import('../../components/assetAgreement/InvestmentOverview'),
  { ssr: false }
);
const OverviewTab = dynamic(
  () => import('../../components/investment-overview/overview-tab'),
  { ssr: false }
);
const RfqInvestments = dynamic(
  () => import('../../components/assetAgreement/RfqInvestment'),
  { ssr: false }
);

//Utils
import {
  absoluteCommittedInvestment,
  generateAssetURL,
  isAifDeal,
  isFirstTimeInvestor,
  isValidInvestmentAmount,
  isInValidAssetUrl,
} from '../../utils/asset';
import {
  isSEOrCRE,
  isSDISecondary,
  financeProductTypeConstants,
  isAssetBonds,
  isAssetBasket,
} from '../../utils/financeProductTypes';
import { roundOff, toCurrecyStringWithDecimals } from '../../utils/number';
import type {
  BondsCalcultionDataModal,
  BondsMldCalcultionDataModal,
} from '../../utils/bonds';
import { calculateReturns } from '../../utils/returnsCalculator';
import { fireCheckout, trackEvent } from '../../utils/gtm';
import { isUserAccountNRE, isUserCkycPending } from '../../utils/user';
import { hasSpvCategoryBank } from '../../utils/spv';
import { SdiSecondaryCalculationDataModal } from '../../utils/sdiSecondary';
import { loadCashfree } from '../../utils/ThirdParty/scripts';
import { KycStatusResponseModel } from '../../components/user-kyc/utils/models';
import {
  getKYCDetailsFromConfig,
  getKycStepStatus,
} from '../../components/user-kyc/utils/helper';
import { isOBPPKYCEnabledForAsset } from '../../utils/rfq';
import { getGCSource } from '../../utils/gripConnect';
import { isEmpty } from '../../utils/object';
import { redirectToURLIFKYCNotCompleted } from '../../components/assetAgreement/utils';

//Redux
import {
  fetchAndSetAsset,
  fetchAndSetAgreementPDF,
  fetchAndSetOneTimeAgreements,
  fetchAndSetPaymentTypes,
  setIsPaymentDetailsLoading,
} from '../../redux/slices/assets';
import {
  fetchAndSetAifDocs,
  getUserKycDocuments,
} from '../../redux/slices/user';
import { getKYCDetailsList } from '../../redux/slices/spvDetails';
import { completeWalletOrder, createOrder } from '../../redux/slices/orders';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import { GlobalContext } from '../_app';
import { InvestmentOverviewPGContext } from '../../contexts/investmentOverviewPg';
import { setCkycData } from '../../redux/slices/userConfig';

//Skeletom
import InvestmentOverviewSkeleton from '../../skeletons/investment-overview-skeleton/InvestmentOverviewSkeleton';

//Styles
import classes from './AssetAgreement.module.css';

const AssetAgreement = () => {
  const context: any = useContext(GlobalContext);
  const router = useRouter();

  const dispatch = useAppDispatch();
  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const kycTypes = useAppSelector((state) => state.spvDetails.kycTypes);
  const userKYCConsent = useAppSelector((state) => state.user.kycConsent);
  const userData = useAppSelector((state) => state.user.userData);
  const kycDetails = useAppSelector((state) => state.user.kycDetails);
  const access = useAppSelector((state) => state.access);
  const spvCategoryBank = useAppSelector(
    (state) => state.assets?.selectedAsset?.spvCategoryDetails?.spvCategoryBank
  );

  const [loading, setLoading] = useState(true);
  const [useWalletAmount, setUseWalletAmount] = useState(false);
  const [source, setSource] = useState('');
  const [calculatedBondData, setCalculatedBondData] = useState({});
  const [isLotSizeValid, setIsLotSizeValid] = useState(false);
  const [sdiSecondaryTotalInterest, setSdiSecondaryTotalInterest] = useState(0);
  const [sdiSecondaryPayable, setSdiSecondaryPayable] = useState(0);
  const [sdiSecondaryPretaxAmount, setSdiSecondaryPretaxAmount] = useState(0);
  const [marketCloseModal, setMarketCloseModal] = useState(false);
  const [assetCalculationData, setAssetCalculationData] = useState({});
  const [localProps, setLocalProps] = useState({
    loading: true,
    pageData: null,
    tooltipData: null,
  });
  const [obppKYCDetails, setObppKYCDetails] = useState({});
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [calculatedReturns, setCalculatedReturns] = useState({});
  const [taxPercentage, setTaxPercentage] = useState({});

  const obppKYCEnabledSPVCategory = context?.obppSPVCategoryID;
  const isSDISecondaryAsset = isSDISecondary(asset);
  const isBondsAsset = isAssetBonds(asset);
  const isOBPPKYCEnabled = isOBPPKYCEnabledForAsset(
    asset,
    obppKYCEnabledSPVCategory
  );
  const isSDISecondaryOrAssetBonds =
    isAssetBonds(asset) || isSDISecondary(asset) || isAssetBasket(asset);
  const isAssetRFQ = asset?.isRfq;

  const preTaxValues =
    ['Commercial Property', 'Startup Equity'].includes(
      asset?.financeProductType
    ) ||
    isSDISecondaryOrAssetBonds ||
    (userData?.partnerType === 'sp' && !access.preTaxToggle);

  const queryAmount = Number(router?.query?.amount || 0);
  const { value: queryParams } = router?.query;
  const dealId = queryParams[queryParams.length - 1];

  const isPaymentGatewayEnabled =
    asset?.spvCategoryDetails?.spvCategoryPg?.length > 0;

  const kycConfigStatus = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );

  const bankDetails = getKYCDetailsFromConfig(
    kycConfigStatus,
    'bank'
  ) as Record<string, string>;

  const showEsign =
    asset?.financeProductType &&
    !isAssetBonds(asset) &&
    !isSDISecondary(asset) &&
    !isAssetBasket(asset);

  const checkAmount = () => {
    let amount = queryAmount;
    amount = parseInt(roundOff(amount, 0));
    if (asset && asset.assetID) {
      if (
        [
          financeProductTypeConstants.realEstate,
          financeProductTypeConstants.startupEquity,
          financeProductTypeConstants.sdi,
          financeProductTypeConstants.bonds,
          financeProductTypeConstants.Baskets,
        ].indexOf(asset.financeProductType) === -1
      ) {
        if (
          !(amount && amount >= asset.minAmount && amount <= asset.maxAmount)
        ) {
          router.push(generateAssetURL(asset));
        }
      } else {
        if (
          !amount &&
          amount >= asset.preTaxMinAmount &&
          amount <= asset.preTaxMaxAmount
        ) {
          router.push(generateAssetURL(asset));
        }
      }
    }
  };

  const getSdiSecondaryAmount = async (assetCalcDetails: any) => {
    const data: Partial<SdiSecondaryCalculationDataModal> = {
      accruedInterest: assetCalcDetails?.accruedInterest,
      investmentAmount: assetCalcDetails?.investmentAmount,
      principalAmount: assetCalcDetails?.principalAmount,
      purchasePrice: assetCalcDetails?.purchasePrice,
      preTaxReturns: assetCalcDetails?.preTaxReturns,
      totalInterest: assetCalcDetails?.totalInterest,
      additionalCharges: assetCalcDetails?.totalAdditionalCharges,
    };

    setSdiSecondaryTotalInterest(data?.totalInterest);
    setSdiSecondaryPretaxAmount(
      (data?.totalInterest || 0) + data?.principalAmount
    );
    setSdiSecondaryPayable(data?.investmentAmount);
    return data;
  };
  const postAssetFetchOperations = () => {
    dispatch(
      getUserKycDocuments(access?.userID, () => {
        dispatch(getKYCDetailsList());
      })
    );
  };

  const getData = async () => {
    const data = await getServerData();
    setLocalProps({
      ...data?.props,
      loading: false,
    });
  };

  const sendBack = () => {
    router.push(
      generateAssetURL(asset) + '?view=calculator' + '&units=' + queryAmount
    );
  };

  const verifyAmount = async () => {
    /** Check if url is valid otherwise return to asset list page */
    const urlAssetName = queryParams[queryParams.length - 2];

    if (isInValidAssetUrl(asset, urlAssetName)) {
      router.push('/assets');
    }

    /**
     * Check for pending KYC:
     *
     * Leasing / Inventory: should open only when normal kyc is completed
     *
     * CRE / SE:  should open only with followig kyc should be completed:
     * 1. Normal KYC
     * 2. Enhanced KYC
     * 3. Consent provided on asset list page
     */

    if (!isOBPPKYCEnabled) {
      const url = redirectToURLIFKYCNotCompleted(
        asset,
        userKYCConsent,
        kycTypes,
        userData,
        kycDetails
      );

      if (url) {
        router.push(url);
      }
    }

    if (isUserAccountNRE(bankDetails?.accountType || '')) {
      sendBack();
    }

    /**
     * Check user ckyc is pending if the finance product type is in ['CRE','SE']
     */
    if (!isOBPPKYCEnabled && isUserCkycPending(userData) && isSEOrCRE(asset)) {
      sendBack();
    }
    let amount: any = queryAmount;
    if (!Number(amount)) {
      router.push('/assets');
      return;
    }
    if (typeof amount === 'string') {
      amount = parseInt(amount);
    }

    let sdiOrBondsPayable = 0;
    if (isBondsAsset || isSDISecondaryAsset || isAssetBasket(asset)) {
      let calculationData: any = assetCalculationData;

      const data: Partial<
        BondsCalcultionDataModal & BondsMldCalcultionDataModal
      > = {
        accruedInterest: calculationData?.accruedInterest,
        investmentAmount: calculationData?.investmentAmount,
        principalAmount: calculationData?.principalAmount,
        purchasePrice: calculationData?.purchasePrice,
        preTaxReturns: calculationData?.preTaxReturns,
        totalInterest: calculationData?.totalInterest,
        discountedPrice: calculationData?.discountedPrice,
        preTaxAmount: calculationData?.preTaxReturns,
        redemptionPrice: calculationData?.redemptionPrice,
        stampDuty: calculationData?.stampDuty,
      };

      if (calculationData?.investmentAmount > calculationData?.maxInvestment) {
        // their are another router.push where we are sending to asset detail page , this condition is not required
        // router.back();
      } else {
        setCalculatedBondData(data);
      }
      sdiOrBondsPayable = calculationData?.investmentAmount;
    }

    const [_isDealAllowed, _, maxPossibleAmount] = isValidInvestmentAmount(
      asset,
      sdiOrBondsPayable || amount,
      preTaxValues,
      isFirstTimeInvestor(userData)
    );

    if (maxPossibleAmount === 0) {
      sendBack();
    }
    const query = router?.query;
    if (query && query.useVault) {
      setUseWalletAmount(true);
    }
  };

  const initAsset = async () => {
    if (asset?.assetId !== dealId) {
      await dispatch(fetchAndSetAsset(dealId, postAssetFetchOperations, true));
      await dispatch(setIsPaymentDetailsLoading(true));
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      getData();
      initAsset();

      const { source } = router.query;
      const utmSourceGC = getGCSource();
      let stateToUpdate = {
        amount: Number(queryAmount),
      };
      if (source || utmSourceGC) {
        stateToUpdate['source'] = source || utmSourceGC;
        setSource(source || utmSourceGC);
      }

      localStorage.setItem('isFromAssetDetail', 'false');
    };

    fetchData();
    dispatch(setCkycData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMemo(() => {
    const handleRedirections = async () => {
      // REDIRECT TO ASSET DETAIL PAGE IF DEBARRED
      if (isAssetRFQ) {
        const data = await fetchUserDebarmentDetails();
        if (data.isDebarred) {
          router.push(generateAssetURL(asset));
          return;
        }
      }

      // Redirection logic for RFQ Assets and SDI Assets for OBPP KYC
      const statusResponse = await handleKycStatus(dealId);
      if (isOBPPKYCEnabled) {
        const kycStatusArr: KycStatusResponseModel[] = statusResponse?.kycTypes;
        const statusArr = getKycStepStatus(kycStatusArr).map(
          (ele) => ele.status
        );
        if (!statusArr.every((ele) => ele === 1)) {
          router.push(generateAssetURL(asset));
        }

        // Redirect to asset list page for RFQ deals if market is close
        if (isAssetRFQ) {
          const data = await fetchMarketTiming();
          if (!data?.isMarketOpenNow && !isPaymentGatewayEnabled) {
            setTimeout(() => {
              setMarketCloseModal(true);
            }, 200);
            setTimeout(() => {
              router.push('/assets');
            }, 2000);
          }
          setIsMarketOpen(data?.isMarketOpenNow);
        }
      }

      // MOVED FROM ESIGN COMPONENT FOR EXACT LOAD TIME
      // TICKET : https://gripinvest.atlassian.net/browse/PT-8566

      if (showEsign) {
        await dispatch(fetchAndSetAgreementPDF(asset?.spv?.spvID));
        await Promise.all([
          dispatch(fetchAndSetAifDocs()),
          // dispatch(getPortfolio()),
          dispatch(getUserKycDocuments(access?.userID)),
          dispatch(fetchAndSetOneTimeAgreements(asset?.spvType)),
        ]);
      }

      // Fetching KYC Details for PG Investment Overview
      if (isPaymentGatewayEnabled) {
        const finalKYCData = {};
        statusResponse?.kycTypes?.forEach((kycDetails) => {
          finalKYCData[kycDetails.name] = kycDetails.fields;
        });
        setObppKYCDetails(finalKYCData);
      }
    };
    if (asset?.assetID && !loading) {
      handleRedirections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.assetID, loading]);

  useEffect(() => {
    if (
      !loading &&
      assetCalculationData &&
      Object.keys(assetCalculationData)?.length > 0
    ) {
      verifyAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, assetCalculationData]);

  useEffect(() => {
    const calculateReturnsTax = () => {
      let returns = calculateReturns(
        asset?.repaymentMetrics,
        preTaxValues ? 'sp' : 'gp',
        asset?.repaymentCycle,
        asset?.tenure,
        queryAmount
      );
      const calReturns = preTaxValues
        ? (returns as any)?.spPreTaxReturns
        : returns || {};

      const taxPercentage =
        calReturns?.totalTaxAmount && calReturns?.totalPreTaxAmount
          ? (calReturns?.totalTaxAmount / calReturns?.totalPreTaxAmount) * 100
          : 0;
      setCalculatedReturns(calReturns);
      setTaxPercentage(taxPercentage);
    };

    if (asset?.assetID && !loading) {
      calculateReturnsTax();
      checkAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, loading]);

  useEffect(() => {
    const handleAssetCalculationEffect = async () => {
      if (isSDISecondaryOrAssetBonds) {
        const calculationData = await handleAssetCalculation(
          asset?.assetID,
          queryAmount
        );
        const { assetCalcDetails } = calculationData || {};

        getSdiSecondaryAmount(assetCalcDetails);
        setAssetCalculationData(assetCalcDetails);
        const unitType = isBondsAsset ? 'Units' : 'Lots';

        if (assetCalcDetails?.minLots > queryAmount) {
          trackEvent('investment_overview_err', {
            userID: access?.userID,
            assetID: asset?.assetID,
            amount: queryAmount,
            minLots: assetCalcDetails?.minLots,
            currentTime: new Date().toISOString(),
            response: JSON.stringify(calculationData),
            currentURL: window.location.href,
          });
          callErrorToast(
            `${unitType} cannot be less than ${assetCalcDetails?.minLots}`
          );
        } else if (
          assetCalcDetails?.investmentAmount > assetCalcDetails?.maxInvestment
        ) {
          callErrorToast(
            `Max Investment Amount should be less than ${toCurrecyStringWithDecimals(
              assetCalcDetails?.maxInvestment,
              1,
              false
            )}`
          );
        } else {
          if (isPaymentGatewayEnabled) {
            const totalInvestment = assetCalcDetails?.investmentAmount;
            getPaymentMethods(totalInvestment);
          }
          setIsLotSizeValid(true);
        }
      } else {
        setIsLotSizeValid(true);
      }
    };
    if (!loading) {
      handleAssetCalculationEffect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const moveDocument = async (order: any) => {
    try {
      if (isAifDeal(Number(asset.spvType))) {
        const spvAgreements = asset?.spvAgreements || [];
        const promises = [];
        //using a for of loop as there can be multiple docs in assets
        for (const pdf of spvAgreements) {
          const aif = {
            docType: 'asset',
            docSubType: pdf.spvDocID,
            toModel: 'order',
            fromModel: 'user',
            toModuleID: order.orderID,
            fromModuleID: order.userID,
          };

          promises.push(moveDocuments(aif));
        }
        await Promise.all(promises);
      }
    } catch (error) {
      callErrorToast('Error while moving documents. Please contact support.');
    }
  };

  const amountToPay = () => {
    let amountToPay = Number(queryAmount);
    const amountInWallet = userData?.walletAmount;
    if (useWalletAmount) {
      if (amountInWallet >= amountToPay) {
        return 0;
      }
      amountToPay = amountToPay - (amountInWallet || 0);
    }
    return amountToPay;
  };
  const amountToPayFromWallet = () => {
    const amount = queryAmount;
    return Number(amount) - amountToPay();
  };

  const sendCheckoutEvent = () => {
    const partners = asset?.assetPartners ?? [];
    try {
      trackEvent('Investment Overview Proceeded', {
        amount: queryAmount,
        useVaultBalance: userData?.walletAmount || 0,
        amountPayable: amountToPay(),
        assetID: asset.assetID,
        completedPercentage: absoluteCommittedInvestment(asset, false),
        irr: asset?.irr ?? '',
        tenure: asset?.tenure ?? '',
        isCombo: partners.length > 2,
        isDuoDeal: partners.length === 2,
        partnerNames: partners.map((partner: any) => partner.tblpartner.name),
        bank_name: bankDetails?.bankName,
      });
    } catch (e) {
      console.log(e, 'error');
    }
  };

  const sendPaymentSuccessEvent = (order: { amount: number }) => {
    const partners = asset?.assetPartners ?? [];

    try {
      trackEvent('Investment Success', {
        assetID: asset.assetID,
        assetName: asset.name,
        completedPercentage: absoluteCommittedInvestment(asset, false),
        irr: asset?.irr ?? '',
        tenure: asset?.tenure ?? '',
        isCombo: partners.length > 2,
        isDuoDeal: partners.length === 2,
        partnerNames: partners.map((partner: any) => partner.tblpartner.name),
        orderAmount: order.amount,
      });
    } catch (e) {
      console.log(e, 'error');
    }
  };

  const createOrderCallback = async (data: any) => {
    if (typeof data === 'string') {
      let error: any = {};
      try {
        error = JSON.parse(data);
      } catch (e) {}
      setLoading(false);
    } else {
      if (data?.paymentSessionID) {
        await loadCashfree();
        const paymentInstance = new (window as any).Cashfree(
          data?.paymentSessionID
        );
        paymentInstance.redirect();
      } else if (data?.paymentLink) {
        window.open(data?.paymentLink, '_self');
      }
    }
  };

  const createOrderForAsset = (
    dealID: string | number,
    amount: number,
    units?: number,
    unitPrice?: number
  ) => {
    dispatch(
      createOrder(
        dealID,
        amount,
        amountToPayFromWallet(),
        isBondsAsset ? true : preTaxValues,
        (data: any) => {
          createOrderCallback(data);
        },
        source,
        units,
        unitPrice
      )
    );
  };

  const placeDeal = (isLoading = false, amountPayable = 0) => {
    let amount = queryAmount;
    fireCheckout();
    sendCheckoutEvent();

    if (!isLoading) setLoading(true);

    // Anicut Linked Deal
    const commercialPropertyDeal = isAifDeal(Number(asset.spvType));

    if (userData && userData?.emailID && userData?.mobileNo) {
      if (
        amountToPay() === 0 ||
        asset.financeProductType === 'Non Convertible Debentures' ||
        hasSpvCategoryBank(asset?.spvCategoryDetails)
      ) {
        const params = {
          assetID: Number(dealId),
          amount:
            amountPayable === 0
              ? (assetCalculationData as any)?.investmentAmount ?? queryAmount
              : amountPayable,
          walletAmount: commercialPropertyDeal ? 0 : amountToPayFromWallet(),
          preTax: isSDISecondaryAsset ? true : preTaxValues,
          source: source,
          units: amountPayable === 0 ? queryAmount : amountPayable,
          unitPrice: asset?.sdiSecondaryDetails?.calculatedFaceValue,
          spvCategoryBank: spvCategoryBank || {},
          cb: (res: any) => {
            if (res) {
              sendPaymentSuccessEvent({ amount });
            }
            //move AIF agreement which is at user level to order level
            moveDocument(res);
            router.push('/order-confirmation');
          },
        };
        // In case fund is to be settled to AIF Account, redirect to PG
        dispatch(completeWalletOrder(params));
      } else {
        createOrderForAsset(
          dealId,
          amountPayable === 0
            ? (assetCalculationData as any)?.investmentAmount ?? queryAmount
            : amountPayable,
          amountPayable === 0 ? queryAmount : amountPayable,
          asset?.sdiSecondaryDetails?.calculatedFaceValue
        );
      }
    } else {
      router.push('/profile/edit');
    }
  };

  //CHECK FOR BONDS ASSET CALCULATION
  const checkBondsCalculationLoading = () =>
    isBondsAsset && isEmpty(calculatedBondData);

  //CHECK FOR LEASEX ASSET CALCULATION
  const checkLeaseXCalculationLoading = () => {
    return isSDISecondaryAsset && !sdiSecondaryPayable;
  };

  //CHECK FOR OTHER ASSET TYPE CALCULATION
  const checkOtherAssetCalculationLoading = () => {
    return (
      !isBondsAsset &&
      !isSDISecondaryAsset &&
      !isAssetBasket(asset) &&
      !queryAmount
    );
  };

  const investmentContext = () => {
    const data = {
      userData: userData || {},
      userKycDetails: kycDetails || {},
      asset: asset,
      lotSize: queryAmount,
      calculationDataBonds: calculatedBondData,
      calculatedSDIData: {
        preTaxAmount: sdiSecondaryPretaxAmount,
        totalInterest: sdiSecondaryTotalInterest,
        investmentAmount: sdiSecondaryPayable,
      },
      isValidLotsize: isLotSizeValid,
      assetCalculationData: assetCalculationData,
      bankDetails: {
        bankName: bankDetails?.bankName,
        userName: bankDetails?.accountName,
        accountNo: bankDetails?.accountNumber,
      },
    };
    return data;
  };

  const investmentContextPg = () => {
    const data = {
      userKycDetails: obppKYCDetails || {},
      pageData: localProps?.pageData,
      asset: asset,
      lotSize: queryAmount,
      calculationDataBonds: calculatedBondData,
      calculatedSDIData: {
        preTaxAmount: sdiSecondaryPretaxAmount,
        totalInterest: sdiSecondaryTotalInterest,
        investmentAmount: sdiSecondaryPayable,
      },
      assetCalculationData: assetCalculationData,
      isMarketOpen: isMarketOpen,
    };
    return data;
  };

  const onClickProceedButton = () => {
    if (isSDISecondaryAsset && hasSpvCategoryBank(asset?.spvCategoryDetails)) {
      placeDeal();
    } else if (isSDISecondaryAsset) {
      placeDeal();
    } else {
      setLoading(true);
      placeDeal();
    }
  };

  const renderHeader = (text = 'Investment Overview') => (
    <Header
      pageName={text}
      className={classes.HeaderContainer}
      onClickBackButton={() => sendBack()}
    />
  );

  const renderPGHeader = () => (
    <>
      <Header
        pageName={'Checkout'}
        onClickBackButton={() => sendBack()}
        className={classes.PGHeaderDesktop}
      />
      <PGHeader
        onClickBack={() => sendBack()}
        className={classes.PGHeaderMobile}
      />
    </>
  );

  const getPaymentMethods = async (paymentAmount: number) => {
    dispatch(
      fetchAndSetPaymentTypes(asset?.assetID, Math.round(Number(paymentAmount)))
    );
  };

  const renderAssetOverview = () => {
    if (!isSDISecondaryOrAssetBonds) {
      return (
        <>
          {renderHeader()}
          <PageContainer containerStyle={'backgroundWhite'}>
            <InvestmentOverview
              calculatedReturns={calculatedReturns}
              taxPercentage={taxPercentage}
              amountToPay={amountToPay}
              placeDeal={placeDeal}
            />
          </PageContainer>
        </>
      );
    }

    if (isPaymentGatewayEnabled) {
      return (
        <>
          <InvestmentOverviewPGContext.Provider value={investmentContextPg()}>
            {renderPGHeader()}
            <div
              className={`${classes.OverviewContainer} ${classes.PgContainer}`}
            >
              <InvestmentOverviewPg />
            </div>
          </InvestmentOverviewPGContext.Provider>
        </>
      );
    }

    if (isAssetRFQ) {
      return (
        <RfqInvestments
          localProps={localProps}
          isLotSizeValid={isLotSizeValid}
          calculatedReturns={calculatedReturns}
          taxPercentage={taxPercentage}
          amountToPay={amountToPay}
          calculatedBondData={calculatedBondData}
          calculatedSDIData={{
            preTaxAmount: sdiSecondaryPretaxAmount,
            totalInterest: sdiSecondaryTotalInterest,
            investmentAmount: sdiSecondaryPayable,
          }}
          assetCalculationData={assetCalculationData}
        />
      );
    }

    return (
      <>
        {renderHeader()}
        <InvestmentOverviewContext.Provider value={investmentContext()}>
          <div className={classes.OverviewContainer}>
            <OverviewTab
              handlePaymentBtnClick={() => onClickProceedButton()}
              key={`OverviewTab`}
              isLoading={false}
              isBtnDisable={false}
              buttonLabel={'Proceed'}
            />
          </div>
        </InvestmentOverviewContext.Provider>
      </>
    );
  };

  const seoData = localProps?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  const showSkeleton =
    //CHECK FOR COMMON FETCH LOADING
    checkBondsCalculationLoading() ||
    checkLeaseXCalculationLoading() ||
    checkOtherAssetCalculationLoading();

  if (loading) {
    return (
      <div className={classes.LoaderContainer}>
        <CircularProgress size={30} />
      </div>
    );
  }
  //Show Overview Sketon
  if (
    (!isSDISecondaryOrAssetBonds || !isPaymentGatewayEnabled) &&
    showSkeleton
  ) {
    return <InvestmentOverviewSkeleton showEsign={showEsign} />;
  }

  return (
    <>
      <Seo seo={seoData} />
      {renderAssetOverview()}
      <MaterialModalPopup
        className={classes.Modal}
        hideClose
        drawerExtraClass={classes.MobileModal}
        isModalDrawer
        showModal={marketCloseModal}
      >
        <div className={classes.RedirectLoader}>
          <div className={classes.ProgressWrapper}>
            <CircularProgress
              thickness={3}
              value={100}
              size={64}
              variant="determinate"
              className={classes.ProgressHolder}
            />
            <CircularProgress
              size={64}
              variant="indeterminate"
              disableShrink
              thickness={3}
              value={50}
              className={classes.Progress}
            />
          </div>

          <p>
            {' '}
            Market is closed right now.
            <br /> Redirecting to Assets
          </p>
        </div>
      </MaterialModalPopup>
    </>
  );
};

export async function getServerData() {
  try {
    const [pageData, tooltipData] = await Promise.all([
      fetchAPI(
        '/inner-pages-data',
        {
          filters: {
            url: '/assetagreement',
          },
          populate: '*',
        },
        {},
        false
      ),
      fetchAPI(
        '/inner-pages-data',
        {
          filters: {
            url: '/assetdetail',
          },
          populate: '*',
        },
        {},
        false
      ),
    ]);

    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData,
        tooltipData: tooltipData?.data?.[0]?.attributes?.pageData,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default AssetAgreement;
