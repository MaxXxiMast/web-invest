// Components
import Image from '../../primitives/Image';
import { useEffect } from 'react';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';

// Utils
import { getEligibilityInfoContainer } from './utils';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { useAppSelector } from '../../../redux/slices/hooks';
import { trackEvent } from '../../../utils/gtm';
import { ExtraInterestRate } from '../../fd/FDCalculator/utils';

// Styles
import styles from './FdEligibiltyVerificationModal.module.css';

type FdEligibiltyVerificationModalProps = {
  selectedValues: {
    srCitizen: boolean;
    women: boolean;
  };
  extraInterestRate: ExtraInterestRate;
};

const FdEligibiltyVerificationModal = ({
  selectedValues,
  extraInterestRate,
}: FdEligibiltyVerificationModalProps) => {
  const { resetInterestModal } = useAppSelector((state) => state.fdConfig);
  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const kycDetails = {
    isWomen: resetInterestModal.isWomen,
    isSrCitizen: resetInterestModal.isSrCitizen,
  };

  const defaultsenior = extraInterestRate?.seniorCitizen?.defaultChecked;
  const defaultwomen = extraInterestRate?.women?.defaultChecked;

  useEffect(() => {
    if (!resetInterestModal.showLoader) return;
    let item_reverted;
    if (resetInterestModal.isWomen !== selectedValues.women) {
      item_reverted = 'women';
    }
    if (resetInterestModal.isSrCitizen !== selectedValues.srCitizen) {
      if (item_reverted === 'women') {
        item_reverted = 'both';
      } else {
        item_reverted = 'srCitizen';
      }
    }
    trackEvent('FD Extra Return Eligibility Revert', {
      eligible_for_sr_citizen: defaultsenior,
      eligible_for_woman: defaultwomen,
      item_reverted: item_reverted,
      fd_name: asset?.name,
      fd_type: asset?.productSubcategory,
      asset_id: asset?.assetID,
    });
  }, [
    asset?.assetID,
    asset?.name,
    asset?.productSubcategory,
    defaultsenior,
    defaultwomen,
    resetInterestModal,
    selectedValues.srCitizen,
    selectedValues.women,
  ]);
  return (
    <MaterialModalPopup
      showModal={resetInterestModal.showLoader}
      className={styles.container}
      isModalDrawer
      hideClose
      cardClass={styles.CardContainer}
    >
      <div className="flex justify-center">
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}fd/reset-rates.svg`}
          height={60}
          width={60}
          alt="reset-rates"
          layout="intrinsic"
        />
      </div>
      <h1 className={styles.heading}>Resetting rates as per your KYC</h1>
      <div className={styles.eligibiltyInfoContainer}>
        {getEligibilityInfoContainer(kycDetails).map((data) => {
          return (
            <p key={data.key} className={styles.text}>
              {data.label}:{' '}
              <span
                className={
                  data.value === 'Applicable'
                    ? styles.applicable
                    : styles.notApplicable
                }
              >
                {data.value}
              </span>
            </p>
          );
        })}
      </div>
      <p className={styles.text}>
        Redirecting to Overview
        <span className={styles.wave}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </span>
      </p>
    </MaterialModalPopup>
  );
};

export default FdEligibiltyVerificationModal;
