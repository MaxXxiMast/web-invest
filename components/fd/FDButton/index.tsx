// NODE MODULES
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

// Components
import Button from '../../primitives/Button';
import UserKycStatus from '../../assetDetails/user-kyc-status';
import FDProgressBarModal from '../FDProgressBarModal';
import ResidentIndianWarning from '../ResidentIndianWarning';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

// APIs
import {
  createFDOrder,
  fetchKycConfigStatus,
} from '../../../redux/slices/user';

// Utils
import { determineFDActionForKYC, isSeniorCitizen } from './utils';
import { trackEvent } from '../../../utils/gtm';
import { getOverallDefaultKycStatus } from '../../../utils/discovery';

// Redux Slices
import {
  FDStepperLoader,
  getFDCalculationData,
  setFDKYCBehaviour,
  setFDOrderIniateBody,
  setOpenFDStepperLoader,
  setResettingModalValues,
} from '../../../redux/slices/fd';

// Types
import type {
  ExtraInterestRate,
  FixerraRepaymentResponse,
} from '../FDCalculator/utils';
import type { OrderInitateBody } from '../../../api/assets';

// Styles
import styles from './FDButton.module.css';

const FdEligibiltyVerificationModal = dynamic(
  () => import('../../assetDetails/FdEligibiltyVerificationModal'),
  {
    ssr: false,
  }
);

const FdKycPendingModal = dynamic(
  () => import('../../assetDetails/FdKycPendingModal'),
  {
    ssr: false,
  }
);

type CreateOrderType = {
  assetID: number;
  amount: number;
  tenure: number;
  payout: string;
  isSeniorCitizen: boolean;
  isWomen: boolean;
  fdName: string;
  category: string;
};

type FDButtonProps = {
  selectedValues: {
    srCitizen: boolean;
    women: boolean;
  };
  data: CreateOrderType;
  fdData: FixerraRepaymentResponse;
  disableBtn?: boolean;
  extraInterestRate: ExtraInterestRate;
};

export default function FDButton({
  selectedValues,
  data,
  fdData,
  disableBtn = false,
  extraInterestRate,
}: FDButtonProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showXMLModal, setShowXMLModal] = useState(false);
  const [showResidentIndianWarning, setResidentIndianWarning] = useState(false);
  const asset = useAppSelector((state) => state.assets?.selectedAsset || {});
  const { isFilteredKYCComplete } = useAppSelector(
    (state) => state.user?.kycConfigStatus?.default || {}
  );

  const { assetID } = useAppSelector((state) => state.assets.selectedAsset);
  const { kycConfigStatus, userData } = useAppSelector((state) => state.user);
  const { fdKYCBehaviour: behaviour, fdCalculationMetaData } = useAppSelector(
    (state) => state.fdConfig
  );
  const { NSE: uccStatus = {} } = useAppSelector(
    (state) => state.user?.uccStatus
  );

  useEffect(() => {
    if (assetID) {
      setIsLoading(true);
      dispatch(
        fetchKycConfigStatus(assetID, (allKYCData: any) => {
          const behaviour = determineFDActionForKYC(allKYCData);
          dispatch(setFDKYCBehaviour(behaviour));
          setIsLoading(false);
        }) as any
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetID]);

  const handleStepperData = (data: FDStepperLoader) => {
    dispatch(setOpenFDStepperLoader(data));
  };

  const getKYCData = () => {
    const kycStatus = kycConfigStatus?.default || {};
    const kycData = kycStatus?.kycTypes || [];
    const others = kycData?.find((x) => x?.name === 'other');
    const panDetails = kycData?.find((x) => x?.name === 'pan');
    // M / O / F
    const gender = others?.fields?.gender || '';
    // MM/DD/YYYY
    const dob = panDetails?.fields?.dob || '';

    return {
      gender,
      dob,
    };
  };

  const onSuccessOrder = (paymentLink: string) => {
    handleStepperData({
      open: false,
      step: 0,
      error: false,
    });
    dispatch(
      setResettingModalValues({
        showLoader: false,
        isSrCitizen: false,
        isWomen: false,
      })
    );
    window.open(paymentLink, '_self');
  };

  const onStepperError = () => {
    handleStepperData({
      error: true,
    });

    // Delay for 3 seconds to close the popup
    setTimeout(() => {
      handleStepperData({
        open: false,
        step: 0,
        error: false,
      });
      dispatch(
        setResettingModalValues({
          showLoader: false,
          isSrCitizen: false,
          isWomen: false,
        })
      );
    }, 3000);
  };

  const onFailureOrder = () => {
    setIsLoading(false);
    onStepperError();
  };

  const createFDOrderWithNewData = (finalData: OrderInitateBody) => {
    dispatch(createFDOrder(finalData, onSuccessOrder, onFailureOrder) as any);
  };

  const eventOnInvestNow = async ({ isSrCitizen, isWomen }) => {
    const {
      productCategory,
      productSubcategory,
      financeProductType,
      isRfq,
      irr,
    } = asset;

    const kycStatus =
      getOverallDefaultKycStatus(kycConfigStatus) === 'verified';
    const userUccStatus = uccStatus?.status || '';
    const filterRenderTrue = (obj) => {
      if (typeof obj !== 'object') {
        return [];
      }
      return Object.keys(obj).filter((key) => obj[key]?.render);
    };

    const fdKycStatus =
      kycConfigStatus?.default?.isFilteredKYCComplete || 'false';
    const previousPath = sessionStorage.getItem('lastVisitedPage') as string;

    trackEvent('Invest Now Button Clicked', {
      fd_name: data?.fdName ?? '',
      fd_type: data?.category ?? '',
      investment_amount: data?.amount ?? 0,
      tenure: asset?.assetMappingData?.calculationInputFields?.tenure ?? 0,
      total_returns: fdData?.totalMaturityAmount ?? 0,
      eligible_for_sr_citizen: isSrCitizen ?? false,
      eligible_for_women: isWomen ?? false,
      product_category: productCategory,
      product_sub_category: productSubcategory,
      ucc_status: userUccStatus || false,
      irr: irr,
      extra_return_eligible: filterRenderTrue(extraInterestRate ?? {}) ?? [],
      rfq_enabled: isRfq,
      amo: 'false',
      kyc_status: kycStatus,
      obpp_kyc_status: isFilteredKYCComplete,
      financial_product_type: financeProductType,
      URL: window.location.href,
      cta_text: handleText(),
      fd_kyc_status: fdKycStatus,
      path: previousPath,
      assetLogo: asset?.partnerLogo,
      assetDescription: asset?.partnerName,
    });
  };

  const onSuccessResettingData = async (
    updatedCalcuatedData: FixerraRepaymentResponse,
    extraReturnData: {
      isSrCitizen: boolean;
      isWomen: boolean;
    }
  ) => {
    const finalData: OrderInitateBody = {
      assetID: data.assetID,
      amount: data.amount,
      tenure: data.tenure,
      payout: data.payout,
      isSeniorCitizen: extraReturnData?.isSrCitizen,
      isWomen: extraReturnData?.isWomen,
      interestRate: Number(updatedCalcuatedData?.productInterest),
      maturityDate: updatedCalcuatedData.maturityDate,
    };
    eventOnInvestNow({
      isSrCitizen: extraReturnData?.isSrCitizen,
      isWomen: extraReturnData?.isWomen,
    });
    createFDOrderWithNewData(finalData);
  };

  const handleClick = async () => {
    if (behaviour === 'disabled') {
      return;
    }
    const residentialStatus = userData?.residentialStatus || '';
    if (
      residentialStatus?.toLowerCase() !== 'resident_indian' &&
      residentialStatus !== ''
    ) {
      setResidentIndianWarning(true);
      return;
    }

    if (behaviour === 'redirect') {
      router.push('/user-kyc');
      return;
    }

    if (behaviour === 'popup') {
      const finalData: OrderInitateBody = {
        assetID: data.assetID,
        amount: Number(data.amount),
        tenure: Number(data.tenure),
        payout: data.payout,
        isSeniorCitizen: data.isSeniorCitizen,
        isWomen: data.isWomen,
        interestRate: Number(fdData?.productInterest),
        maturityDate: fdData?.maturityDate,
      };
      dispatch(setFDOrderIniateBody(finalData));
      setShowXMLModal(true);
      return;
    }

    const metaDataExtraInt = fdCalculationMetaData?.extraInterestRate;

    const isRenderred = {
      women: metaDataExtraInt.women.render,
      srCitizen: metaDataExtraInt.seniorCitizen.render,
    };

    const { gender, dob } = getKYCData();
    const isSr = isSeniorCitizen(dob);
    const isFemale = gender === 'F';

    const finalSr = isRenderred.srCitizen && isSr;
    const finalFemale = isRenderred.women && isFemale;

    setIsLoading(true);

    if (
      (isRenderred.srCitizen && selectedValues.srCitizen !== isSr) ||
      (isRenderred.women && selectedValues.women !== isFemale)
    ) {
      dispatch(
        setResettingModalValues({
          showLoader: true,
          isSrCitizen: finalSr,
          isWomen: finalFemale,
        })
      );
      // Call Calcualtion API to update the interest rate
      const fdBodyCalcData = {
        assetID: data.assetID,
        investmentAmount: data.amount,
        tenure: data.tenure,
        payoutFrequency: data.payout,
        format: 'data',
        seniorCitizen: finalSr,
        womenCitizen: finalFemale,
      };

      /**
       * Create a new order with the updated data after the calculation
       * and refetch the data from the API and create FD Order
       */

      dispatch(
        getFDCalculationData(
          fdBodyCalcData,
          (updatedCalcuatedData) =>
            onSuccessResettingData(updatedCalcuatedData, {
              isSrCitizen: finalSr,
              isWomen: finalFemale,
            }),
          () => {
            setTimeout(
              () =>
                dispatch(
                  setResettingModalValues({
                    showLoader: false,
                    isSrCitizen: isSr,
                    isWomen: isFemale,
                  })
                ),
              1000
            );
          }
        ) as any
      );
    } else {
      handleStepperData({
        open: true,
      });
      const finalData: OrderInitateBody = {
        assetID: data.assetID,
        amount: data.amount,
        tenure: data.tenure,
        payout: data.payout,
        isSeniorCitizen: finalSr,
        isWomen: finalFemale,
        interestRate: Number(fdData.productInterest),
        maturityDate: fdData.maturityDate,
      };
      eventOnInvestNow({
        isSrCitizen: finalSr,
        isWomen: finalFemale,
      });
      createFDOrderWithNewData(finalData);
    }
  };

  const handleText = () => {
    if (isLoading) {
      return '';
    }

    switch (behaviour) {
      case 'redirect':
      case 'disabled':
        return 'Complete KYC';
      case 'popup':
      case 'initiate':
      default:
        return 'Invest Now';
    }
  };

  return (
    <>
      {behaviour === 'disabled' ? (
        <UserKycStatus
          message={
            'Our internal team is reviewing your documents. It will be reviewed within 24-48 hours'
          }
          className={styles.DebarmentWidget}
        />
      ) : null}
      <Button
        onClick={() => handleClick()}
        isLoading={isLoading}
        disabled={behaviour === 'disabled' || disableBtn}
        width={'100%'}
        id="FdButton"
        className={styles.FDButton}
      >
        {handleText()}
      </Button>
      <FdEligibiltyVerificationModal
        selectedValues={selectedValues}
        extraInterestRate={extraInterestRate}
      />
      <FdKycPendingModal
        showModal={showXMLModal}
        setShowModal={setShowXMLModal}
      />
      <FDProgressBarModal />
      <ResidentIndianWarning
        showModal={showResidentIndianWarning}
        setModal={setResidentIndianWarning}
      />
    </>
  );
}
