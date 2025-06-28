// NODE MODULES
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

// COMPONENTS
import Button, { ButtonType } from '../primitives/Button';

import VisualiseReturnsModal from '../assetDetails/VisualReturnsModal';

// REDUX Slices and Hooks
import { useAppSelector } from '../../redux/slices/hooks';
import { getFdMetadata } from '../../api/assets';
import {
  setFdParams,
  setStructureShowVisualReturns,
} from '../../redux/slices/monthlyCard';

//UTILS
import { mapOrder } from '../../utils/arr';
import { tenureOrder } from '../../utils/fd';
import { isHighYieldFd } from '../../utils/financeProductTypes';
import { trackVisualReturnsClick } from '../../utils/event';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

// STYLES
import styles from './RepaymentStructure.module.css';

const RepaymentStructure = () => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery();
  const asset = useAppSelector((state) => state.assets?.selectedAsset);
  const user = useAppSelector((state) => state.user?.userData);
  const interestVal =
    asset?.assetMappingData?.calculationInputFields
      ?.assetInterestReturnFrequency;
  const principalVal =
    asset?.assetMappingData?.calculationInputFields
      ?.assetPrincipalPaymentFrequency;

  const { fdInputFieldValue } = useAppSelector(
    (state) => (state as any)?.fdConfig ?? {}
  );

  const handleStructureModal = (val: boolean) => {
    dispatch(setStructureShowVisualReturns(val));
  };

  const handleVisualModalCloseRepayment = (showORHideDialog: boolean) => {
    if (showORHideDialog) {
      trackVisualReturnsClick({
        asset,
        userID: user?.userID,
        investmentAmount: fdInputFieldValue,
        isMobile,
      });
    }
    handleStructureModal(showORHideDialog);
  };

  useEffect(() => {
    const getData = async () => {
      if (asset?.assetID && isHighYieldFd(asset)) {
        const data = await getFdMetadata(asset?.assetID);
        dispatch(
          setFdParams({
            selectedCheckbox: {
              srCitizen: data?.extraInterestRate?.seniorCitizen?.defaultChecked,
              women: data?.extraInterestRate?.women?.defaultChecked,
            },
          })
        );
        const payoutArr: any[] = data?.interestPayout || [];
        if (payoutArr.length) {
          const sortedArray = mapOrder(payoutArr, tenureOrder);
          dispatch(
            setFdParams({
              selectedFilter: sortedArray?.[0],
            })
          );
        }
      }
    };
    const delayDebounceFn = setTimeout(() => {
      getData();
    }, 100);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.assetID]);

  return (
    <>
      {(interestVal || principalVal) && (
        <div className={styles.repaymentDiv}>
          <h3 className={styles.repaymentHeading}>REPAYMENT STRUCTURE</h3>
          <div className={styles.repaymentChildDiv}>
            <div className={styles.repaymentInnerChild}>
              {interestVal && (
                <div className={styles.repaymentInterestContainer}>
                  <div className={styles.repaymentInterest}>
                    <div className={styles.InterestBadges}>
                      <h3 className={styles.InterestText}>INTEREST</h3>
                    </div>
                    <h4 className={styles.Value}>{interestVal}</h4>
                  </div>
                </div>
              )}
              {principalVal && (
                <div className={styles.repaymentInterest}>
                  <div className={styles.InterestBadges}>
                    <h3 className={styles.InterestText}>PRINCIPAL</h3>
                  </div>
                  <h4 className={styles.Value}>{principalVal}</h4>
                </div>
              )}
            </div>
            <Button
              variant={ButtonType.BorderLess}
              className={styles.ctaButton}
              onClick={() => handleVisualModalCloseRepayment(true)}
            >
              View Returns Schedule
            </Button>
          </div>
        </div>
      )}

      <VisualiseReturnsModal />
    </>
  );
};

export default RepaymentStructure;
