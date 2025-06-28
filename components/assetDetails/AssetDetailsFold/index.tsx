import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useAppSelector } from '../../../redux/slices/hooks';

import PartnerLogo from '../../assetsList/partnerLogo';
import BackBtn from '../../primitives/BackBtn/BackBtn';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import ShareDealDetails from '../ShareDealDetails';
import PoweredByGrip from '../../primitives/PoweredByGrip';

import { setShowMobileMonthlyPlan } from '../../../redux/slices/monthlyCard';
import {
  getMaturityDate,
  getMaturityMonths,
  getRepaymentCycle,
} from '../../../utils/asset';
import {
  isAssetBonds,
  isAssetStartupEquity,
  isHighYieldFd,
} from '../../../utils/financeProductTypes';
import { isGCOrder } from '../../../utils/gripConnect';
import { getTotalAmountPaybale } from '../../../utils/investment';
import { roundOff } from '../../../utils/number';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../../utils/appHelpers';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

import { handleAssetCalculation } from '../../../api/assets';
import AiAssist from '../../Ai-assist/AiAssist';

import styles from './AssetDetailsFold.module.css';

export default function AssetDetailsFold() {
  const isMobile = useMediaQuery();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const isGC = isGCOrder();
  const selectedAsset = useAppSelector((state) => state.assets.selectedAsset);
  const { units: lotSize } = useAppSelector((state) => state.monthlyCard);
  const gcAssetDetail = useAppSelector(
    (state) => state.gcConfig?.configData?.themeConfig?.pages?.assetDetail
  );
  const isShowBackArrow = isGC ? !gcAssetDetail?.hideBackArrow : true;

  const [showShareModal, setShowShareButton] = useState(false);
  const [showPartnerLogo, setShowPartnerLogo] = useState(false);

  useEffect(() => {
    const stickyHeaderRef = document.getElementById('StickyHeaderRef');
    const handlePartnerLogo = () => {
      const scrollHeight = isMobile ? 95 : 80;
      setShowPartnerLogo(window?.scrollY > scrollHeight);
      if (stickyHeaderRef) {
        if (window.scrollY > 50) {
          stickyHeaderRef.classList.add('StickyHeaderBg');
        } else {
          stickyHeaderRef.classList.remove('StickyHeaderBg');
        }
      }
    };
    window.addEventListener('scroll', handlePartnerLogo);
    return () => {
      window.removeEventListener('scroll', handlePartnerLogo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FUNCTION TO ADD WHITE BG TO HEADER FOR AssetDetails PAGE
  useEffect(() => {
    const checkNavEle = () => {
      const navEle = document.getElementById('NavigationMain');
      if (navEle) {
        navEle.classList.add('WhiteBg');
        return () => {
          if (navEle) {
            navEle.classList.remove('WhiteBg');
          }
        };
      }
    };
    const timeoutId = setTimeout(checkNavEle, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleBackEvent = () => {
    if (localStorage?.getItem('isFromAssetDetail') === 'true') {
      router.back();
    } else if (localStorage?.getItem('isFromDiscover') === 'true') {
      if (searchParams.get('source') === 'discover-filter') {
        const returnBracket = searchParams.get('return-bracket') ?? '';
        const tenureBracket = searchParams.get('tenure-bracket') ?? '';
        router.push(
          `/discover?focus=filter&return-bracket=${encodeURIComponent(
            returnBracket
          )}&tenure-bracket=${encodeURIComponent(tenureBracket)}`
        );
      } else {
        router.push('/discover');
      }
    } else {
      localStorage.setItem('isFromAssetDetail', 'true');
      router.push('/assets');
    }
  };

  const handleRepaymentCycle = (asset: any) => {
    const repaymentCycle = getRepaymentCycle(asset);
    if (
      !repaymentCycle ||
      isHighYieldFd(asset) ||
      isAssetStartupEquity(asset)
    ) {
      return null;
    }
  };

  const getClassAcToRepaymentCycle = () => {
    return !(
      getRepaymentCycle(selectedAsset) && !isAssetStartupEquity(selectedAsset)
    )
      ? styles.extraMarginTop
      : '';
  };

  const getFinalTenure = () => {
    return (
      getMaturityMonths(getMaturityDate(selectedAsset)) || selectedAsset?.tenure
    );
  };

  /**
   * Function to handle share deal,
   * if rendered in webview then dont open instead share an event
   * else
   * render shareModal
   */

  const handleShareDeal = async () => {
    if (Cookies.get('webViewRendered') || isRenderedInWebview()) {
      const { value } = router.query;
      const calculationData = await handleAssetCalculation(
        value[value.length - 1]
      );
      const { assetCalcDetails } = calculationData;
      const sizeOfLot = lotSize > 0 ? lotSize : assetCalcDetails?.minLots;
      const { assetMappingData } = selectedAsset;
      const { calculationInputFields } = assetMappingData;
      const FDTenure = `${calculationInputFields?.tenure} ${calculationInputFields?.tenureType}`;
      const FDMinInvestment = calculationInputFields?.minTxnAmount;
      const FDInterestRate = calculationInputFields?.maxInterest;

      const data = {
        minInvestmentAmount: getTotalAmountPaybale(
          assetCalcDetails?.investmentAmount,
          assetCalcDetails?.stampDuty,
          sizeOfLot
        ),
        irr: roundOff(
          (calculationInputFields?.preTaxYtm ||
            calculationInputFields?.irr ||
            selectedAsset?.bonds?.preTaxYtm ||
            selectedAsset?.irr) ??
            0,
          2
        ),
        tenure: getFinalTenure(),
        dealName: selectedAsset?.desc,
      };

      if (isHighYieldFd(selectedAsset)) {
        data.minInvestmentAmount = FDMinInvestment;
        data.tenure = FDTenure;
        data.irr = FDInterestRate;
      }
      postMessageToNativeOrFallback('shareDeal', { data });

      return;
    }
    setShowShareButton(true);
  };

  const handleModalClose = () => {
    dispatch(setShowMobileMonthlyPlan(false));
    setShowShareButton(false);
  };

  const renderRepaymentCycleMobile = () => {
    if (isGC)
      return (
        <div className={`items-align-center-row-wise ${styles.PoweredByGrip}`}>
          <PoweredByGrip />
        </div>
      );

    return (
      <div
        className={`items-align-center-row-wise ${
          styles.MobileHeaderRight
        } ${getClassAcToRepaymentCycle()}`}
      >
        <button
          className={styles.UploadBtn}
          onClick={handleShareDeal}
          title="Share Deal"
        >
          <span className={`icon-upload ${styles.UploadIcon}`} />
        </button>
        {handleRepaymentCycle(selectedAsset)}
      </div>
    );
  };

  return (
    <>
      <div
        className={`${styles.StickyContainer} ${styles.stickyDesktop}`}
        id="StickyHeaderRef"
      >
        <div
          className={`flex ${styles.mobileHeaderSticky} ${
            isHighYieldFd(selectedAsset) ? styles.FDAssetHeader : ''
          } `}
        >
          <div className={`items-align-center-row-wise ${styles.LogoWrapper}`}>
            {isShowBackArrow ? (
              <BackBtn handleBackEvent={handleBackEvent} shouldHandleAppBack />
            ) : null}
            <PartnerLogo
              isPartnershipText
              asset={selectedAsset}
              showLot={false}
              height={isAssetBonds(selectedAsset) ? 32 : 40}
              width={150}
              customContainerClass={`${styles.PartnerLogoContainer} ${
                showPartnerLogo ? styles.ShowLogo : ''
              }`}
            />
          </div>
          <div className={styles.aiassist}>
            <AiAssist />
          </div>
          {renderRepaymentCycleMobile()}
        </div>
      </div>
      <MaterialModalPopup
        showModal={showShareModal}
        className={styles.MonthlyReturnCardDrawer}
        isModalDrawer
        handleModalClose={() => handleModalClose()}
      >
        <ShareDealDetails />
      </MaterialModalPopup>
    </>
  );
}
