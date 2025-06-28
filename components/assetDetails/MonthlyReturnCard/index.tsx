import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../../redux/slices/hooks';
import dynamic from 'next/dynamic';

// Components
import PastAssetDetailCalculator from '../PastAssetDetailCalculator';
import AifConsent from '../AIFConsent';
import BondsSidebar from '../BondsSidebar';
import SDISecondarySidebar from '../SDISecondarySidebar';

// Hooks
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Utils
import {
  nonTaxRelatedProductTypes,
  isAssetBonds,
  isSDISecondary,
  isHighYieldFd,
  isAssetBasket,
  isAssetStartupEquity,
  isAssetBondsMF,
} from '../../../utils/financeProductTypes';
import { assetStatus } from '../../../utils/asset';
import { fetchAPI } from '../../../api/strapi';

const FDCalculator = dynamic(() => import('../../fd/FDCalculator'), {
  ssr: false,
});

const OtherProductCalculator = dynamic(
  () => import('../OtherProductCalculator'),
  {
    ssr: false,
  }
);

const MfCalculator = dynamic(
  () => import('../../mutual-funds/mf-calculator/MfCalculator'),
  {
    ssr: false,
  }
);

import styles from './MonthlyReturnCardInner.module.css';

type Props = {
  className?: string;
  showOverview: () => void;
  showLearnMore: (val: boolean) => void;
  handleInvestNowBtnClick?: (val: boolean) => void;
  handleKycContinue: () => void;
  isDefault?: boolean;
};

const MonthlyReturnCard = ({
  className,
  showOverview = () => {},
  showLearnMore,
  handleInvestNowBtnClick = () => {},
  handleKycContinue = () => {},
  isDefault = true,
}: Props) => {
  const isMobileDevice = useMediaQuery('(max-width: 992px)');

  const [chipsArr, setChipsArr] = useState<any>([]);

  const asset = useAppSelector((state) => state.assets?.selectedAsset || {});
  const { showVisualReturns } = useAppSelector((state) => state.monthlyCard);

  const isActive = assetStatus(asset) === 'active';

  useEffect(() => {
    const fetchChipsArr = async () => {
      try {
        const assetChips = await fetchAPI(
          '/inner-pages-data',
          {
            filters: {
              url: '/assetchips',
            },
            populate: '*',
          },
          {},
          false
        );
        const item = assetChips?.data?.[0]?.attributes?.pageData?.find(
          (obj) => obj.keyValue === 'chipsArr'
        )?.objectData;

        setChipsArr({
          chipsArr: item,
        });
      } catch (err) {
        console.log('Error fetching chips array data');
      }
    };

    // Fetch chips array data only for Bonds, SDI, Baskets and FD asset
    // Only for Active Assets
    if (
      isActive &&
      (isAssetBonds(asset) ||
        isSDISecondary(asset) ||
        isHighYieldFd(asset) ||
        (isAssetBasket(asset) &&
          ['Bonds', 'SDI', 'Bonds & SDI'].includes(asset?.childAssetType)))
    ) {
      fetchChipsArr();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Cases:
   *
   * 1. Should not come for Leasing / Inventory / SDI
   *
   * For SE:
   *
   * For Mobile and Desktop:
   *
   * 1. Active Deal: both text should come
   * 2. Past Deal: only partner logo should come
   *
   * For CRE:
   *
   * For Mobile:
   *
   * 1. Active Deal: both text should come
   * 2. Past Deal: nothing should render
   *
   * For Desktop:
   *
   * 1. Active Deal: both text should come
   * 2. Past Deal: both text should come
   */

  const renderAifPartner = (
    hideAIFConsent = false,
    hideAIFPartnerLogo = false
  ) => {
    if (!nonTaxRelatedProductTypes.includes(asset?.financeProductType)) {
      return null;
    }

    return (
      <AifConsent
        hideAIFConsent={
          !isActive ? isAssetStartupEquity(asset) : hideAIFConsent
        }
        hideAIFPartnerLogo={!isActive ? false : hideAIFPartnerLogo}
      />
    );
  };

  const renderActiveCalculator = () => {
    if (
      isAssetBonds(asset) ||
      (isAssetBasket(asset) && asset?.childAssetType === 'Bonds')
    ) {
      return (
        <BondsSidebar
          handleInvestNowBtnClick={handleInvestNowBtnClick}
          handleKycContinue={handleKycContinue}
          chipsArr={chipsArr?.chipsArr}
          isDefault={isDefault}
        />
      );
    }
    if (
      isSDISecondary(asset) ||
      (isAssetBasket(asset) &&
        ['SDI', 'Bonds & SDI'].includes(asset?.childAssetType))
    ) {
      return (
        <SDISecondarySidebar
          handleInvestNowBtnClick={handleInvestNowBtnClick}
          handleKycContinue={handleKycContinue}
          chipsArr={chipsArr?.chipsArr}
          isDefault={isDefault}
        />
      );
    }

    if (isHighYieldFd(asset)) {
      return <FDCalculator chipsArr={chipsArr?.chipsArr} />;
    }

    if (isAssetBondsMF(asset)) {
      return <MfCalculator />;
    }

    return (
      <OtherProductCalculator
        showLearnMore={showLearnMore}
        showOverview={showOverview}
      />
    );
  };

  const renderPastDealSidebar = () => {
    return <PastAssetDetailCalculator />;
  };

  const renderPartner = () => {
    return isMobileDevice ? renderAifPartner(false, true) : renderAifPartner();
  };

  return (
    <>
      <div
        className={`${styles.MonthlyReturnCardMain} ${className} ${
          isMobileDevice ? styles.MobileModal : ''
        } ${showVisualReturns ? styles.hideMobileModal : ''}`}
      >
        <div className={styles.MonthlyReturnCardInner}>
          {isActive ? renderActiveCalculator() : renderPastDealSidebar()}
        </div>
        {renderPartner()}
      </div>
    </>
  );
};

export default MonthlyReturnCard;
