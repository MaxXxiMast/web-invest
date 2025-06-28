import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

// Components
import GripSelect from '../../../common/GripSelect';
// import AadhaarXmlForm from '../aadhaar-xml-form';
import Image from '../../../primitives/Image';
import Button from '../../../primitives/Button';

// Utils
import { trackEvent } from '../../../../utils/gtm';
import { getOverallDefaultKycStatus } from '../../../../utils/discovery';
import { qualificationOptions } from '../../../user-kyc/utils/otherInfoUtils';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import {
  determineFDActionForKYC,
  isSeniorCitizen,
} from '../../../fd/FDButton/utils';

// Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

// Redux Slices
import {
  FDStepperLoader,
  getFDCalculationData,
  setFDKYCBehaviour,
  setOpenFDStepperLoader,
  setResettingModalValues,
} from '../../../../redux/slices/fd';

// APIs
import {
  createFDOrder,
  fetchKycConfigStatus,
} from '../../../../redux/slices/user';
import { callErrorToast } from '../../../../api/strapi';
import {
  createDigilockerRequest,
  handleQualificationPost,
} from '../../../../api/rfqKyc';

// Types
import type { OrderInitateBody } from '../../../../api/assets';
import type { FixerraRepaymentResponse } from '../../../fd/FDCalculator/utils';

// Styles
import styles from './FDKYCPending.module.css';

type FdKycPendingModalProps = {
  setShowModal: (val: boolean) => void;
};

const FDKYCPending = ({ setShowModal }: FdKycPendingModalProps) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { kycConfigStatus } = useAppSelector((state) => state.user);
  const { assetID, name, productSubcategory } = useAppSelector(
    (state) => state.assets.selectedAsset
  );
  const { fdOrderIniateBody, fdCalculationMetaData } = useAppSelector(
    (state) => state.fdConfig
  ) as any;
  const asset = useAppSelector((state) => state.assets.selectedAsset);

  const kycStatus = kycConfigStatus?.default || {};
  const kycData = kycStatus?.kycTypes || [];
  const others = kycData?.find((x) => x?.name === 'other');
  const addressDetails = kycData?.find((x) => x?.name === 'address');

  const showAadharForm = !(
    addressDetails?.isKYCComplete || addressDetails?.isKYCPendingVerification
  );
  const showQualification = !others?.fields?.qualification;

  const [qualification, setQualification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAadhaarOTPSent, setIsAadhaarOTPSent] = useState(false);
  const [isAadhaarOTPEntered, setIsAadhaarOTPEntered] = useState(false);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);
  useEffect(() => {
    const { default: defaultKycStatus = {} } = kycConfigStatus || {};
    const { isFilteredKYCComplete } = defaultKycStatus;

    if (showAadharForm) {
      trackEvent('FD Aadhaar Popup', {
        kyc_status: getOverallDefaultKycStatus(kycConfigStatus) === 'verified',
        fd_kyc_status: isFilteredKYCComplete,
        obpp_kyc_status: isFilteredKYCComplete,
        fd_name: name,
        fd_type: productSubcategory,
        asset_id: assetID,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAadharForm]);

  const handleStepperData = (data: FDStepperLoader) => {
    dispatch(setOpenFDStepperLoader(data));
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

  const getKYCData = (allKYCData: any) => {
    const kycData = allKYCData?.kycTypes || [];
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

  const createFDOrderWithNewData = (finalData: OrderInitateBody) => {
    dispatch(createFDOrder(finalData, onSuccessOrder, onFailureOrder) as any);
  };

  const onSuccessResettingData = async (
    updatedCalcuatedData: FixerraRepaymentResponse,
    extraReturnData: {
      isSrCitizen: boolean;
      isWomen: boolean;
    }
  ) => {
    const finalData: OrderInitateBody = {
      assetID: fdOrderIniateBody.assetID,
      amount: fdOrderIniateBody.amount,
      tenure: fdOrderIniateBody.tenure,
      payout: fdOrderIniateBody.payout,
      isSeniorCitizen: extraReturnData.isSrCitizen,
      isWomen: extraReturnData.isWomen,
      interestRate: Number(updatedCalcuatedData?.productInterest),
      maturityDate: updatedCalcuatedData.maturityDate,
    };
    createFDOrderWithNewData(finalData);
  };

  const onInitiateOrder = (allKYCData: any) => {
    const behaviour = determineFDActionForKYC(allKYCData);
    dispatch(setFDKYCBehaviour(behaviour));
    setIsLoading(false);
    setShowModal(false);

    if (behaviour === 'initiate') {
      const { isSeniorCitizen: selectedSenior, isWomen: selectedWomen } =
        fdOrderIniateBody as OrderInitateBody;

      const { gender, dob } = getKYCData(allKYCData) as any;

      const isSr = isSeniorCitizen(dob);
      const isFemale = gender === 'F';

      const metaDataExtraInt = fdCalculationMetaData?.extraInterestRate;

      const isRenderred = {
        women: metaDataExtraInt.women.render,
        srCitizen: metaDataExtraInt.seniorCitizen.render,
      };

      const finalSr = isRenderred.srCitizen && isSr;
      const finalFemale = isRenderred.women && isFemale;

      if (
        (isRenderred.srCitizen && selectedSenior !== isSr) ||
        (isRenderred.women && selectedWomen !== isFemale)
      ) {
        setTimeout(() => {
          dispatch(
            setResettingModalValues({
              showLoader: true,
              isSrCitizen: finalSr,
              isWomen: finalFemale,
            })
          );
        }, 500);
        // Call Calcualtion API to update the interest rate
        const fdBodyCalcData = {
          assetID: fdOrderIniateBody.assetID,
          investmentAmount: fdOrderIniateBody.amount,
          tenure: fdOrderIniateBody.tenure,
          payoutFrequency: fdOrderIniateBody.payout,
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
                      isSrCitizen: finalSr,
                      isWomen: finalFemale,
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

        createFDOrderWithNewData(fdOrderIniateBody as OrderInitateBody);
      }
    }
  };

  const initiateDigilocker = async () => {
    const response = await createDigilockerRequest();
    trackEvent('proceed_with_digilocker_fd_kyc');
    setTimeout(() => {
      if (response?.url) {
        router.push(response?.url);
      }
    }, 2000);
  };

  const handleClick = async () => {
    const isDisabled = handleDisabled();
    if (isDisabled) return;
    try {
      setIsLoading(true);
      if (showQualification && qualification) {
        await handleQualificationPost(qualification);
      }
      if (showQualification && qualification && !showAadharForm) {
        dispatch(fetchKycConfigStatus(assetID, onInitiateOrder) as any);
        setIsLoading(false);
      }
      if (showAadharForm) {
        await initiateDigilocker();
      }

      //Commented due to OKYC API is not working
      // if (showAadharForm) {
      //   setVerifyingAadhaar(true);
      // } else {
      //   setIsAadhaarVerified(true);
      // }
    } catch (err) {
      callErrorToast(err.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    if (isAadhaarVerified && assetID) {
      dispatch(fetchKycConfigStatus(assetID, onInitiateOrder) as any);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAadhaarVerified]);

  //Commented due to OKYC API is not working
  // const handleDisabled = () => {
  //   return (
  //     (!qualification && showQualification) ||
  //     (showAadharForm && !isAadhaarOTPSent) ||
  //     (showAadharForm && !isAadhaarOTPEntered)
  //   );
  // };

  const handleDisabled = () => {
    return !qualification && showQualification;
  };

  const handleQualificationChange = (e: any) => {
    setQualification(e.target.value);
  };

  return (
    <>
      <h1 className={styles.heading}>Quick step before we proceed!</h1>
      {showAadharForm ? (
        <p className={styles.subHeading}>
          You need to complete address verification as per RBI Regulations.
        </p>
      ) : null}
      {showQualification ? (
        <div className={styles.occupationInputContainer}>
          <GripSelect
            value={qualification}
            name="qualification"
            onChange={handleQualificationChange}
            options={qualificationOptions}
            placeholder={'Your Qualification'}
            id="qualification"
            classes={{
              formControlRoot: styles.select,
            }}
          />
        </div>
      ) : null}

      {/* Commented due to OKYC API is not working */}
      {/* {showAadharForm ? (
        <AadhaarXmlForm
          setIsAadhaarOTPSent={setIsAadhaarOTPSent}
          setShowModal={setShowModal}
          verifyingAadhaar={verifyingAadhaar}
          setIsAadhaarVerified={setIsAadhaarVerified}
          setIsAadhaarOTPEntered={setIsAadhaarOTPEntered}
          setVerifyingAadhaar={setVerifyingAadhaar}
          setIsLoading={setIsLoading}
        />
      ) : null} */}
      <div className={styles.footer}>
        {showAadharForm ? (
          <div className="flex_wrapper">
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/ShieldCheck.svg`}
              alt="shield"
              layout="intrinsic"
              height={12}
              width={12}
            />
            <p className={styles.securityInfo}>We do not store your Aadhaar</p>
          </div>
        ) : null}
        <Button
          width={'100%'}
          onClick={handleClick}
          isLoading={isLoading}
          disabled={handleDisabled()}
        >
          {showAadharForm ? 'Verify address via Digilocker' : 'Confirm'}
        </Button>
      </div>
    </>
  );
};

export default FDKYCPending;
