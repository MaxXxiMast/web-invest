import classNames from 'classnames';

import Image from '../../primitives/Image';

import {
  isAssetBonds,
  isAssetCommercialProduct,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import { handleExtraProps, handleStringLimit } from '../../../utils/string';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

import styles from './partnerLogo.module.css';

type MyProps = {
  asset: any;
  customCss?: any;
  height?: number;
  width?: number;
  url?: string;
  isPartnershipText?: boolean;
  customContainerClass?: any;
  partnershipTextClass?: any;
  units?: number;
  isAssetList?: boolean;
  showUnit?: boolean;
  showLot?: boolean;
  isAssetAgreement?: boolean;
  isDiscoveryPage?: boolean;
};

export default function PartnerLogo(props: MyProps) {
  const {
    asset,
    height,
    url,
    customCss,
    isPartnershipText,
    customContainerClass,
    units = 0,
    isAssetList = false,
    showUnit = true,
    showLot = true,
    width,
    isAssetAgreement = false,
    isDiscoveryPage = false,
    partnershipTextClass = '',
  } = props;

  const isMobile = useMediaQuery();

  const isCommercialDeal = isAssetCommercialProduct(asset);
  const isCorporateBondAsset = isAssetBonds(asset);
  const isSecondarySdiAsset = isSDISecondary(asset);
  const renderLotsMobile = () => {
    const unit = isSecondarySdiAsset ? 'Lot' : 'Unit';
    const unitText = `${units} ${unit}${units > 1 ? 's' : ''}`;
    const isUnitAsset = !!isCorporateBondAsset || !!isSecondarySdiAsset;
    if (!isAssetList && showUnit && isUnitAsset) {
      return (
        <span
          className={
            isCorporateBondAsset ? styles.bondUnitAsset : styles.unitText
          }
        >
          {unitText}
        </span>
      );
    }
    return null;
  };

  const desktopView = () => {
    if (isCorporateBondAsset || isSecondarySdiAsset) {
      return renderLotsMobile();
    }
    return null;
  };

  const renderChildren = () => {
    return isMobile ? renderLotsMobile() : desktopView();
  };

  const renderLots = () => {
    return showLot && renderChildren();
  };

  const renderLogo = () => {
    const partnerLogo = isDiscoveryPage
      ? asset?.partner?.logo
      : asset?.partnerLogo;
    const partnerName = isDiscoveryPage
      ? asset?.partner?.name
      : asset?.partnerName || '';
    if (isCommercialDeal && isPartnershipText) {
      return asset && partnerLogo ? (
        <div
          className={`${styles.partnershipTextContainer} ${partnershipTextClass}`}
        >
          <span className={styles.partnershipText}>In Partnership With</span>
          <Image
            src={partnerLogo}
            height={height || undefined}
            className={customCss || styles.logo}
            layout={'fixed'}
            width={width || undefined}
            alt={handleStringLimit(partnerName, 10)}
          />
        </div>
      ) : (
        <div
          className={`${styles.partnershipTextContainer} ${partnershipTextClass}`}
        >
          <span className={styles.partnershipText}>In Partnership With</span>
          <span className={styles.name}>{partnerName}</span>
        </div>
      );
    } else {
      return asset && partnerLogo ? (
        <div
          className={`flex-column ${
            isAssetAgreement
              ? 'items-center justify-center'
              : 'items-start justify-start'
          }`}
        >
          <Image
            src={partnerLogo}
            height={height || undefined}
            layout={'fixed'}
            className={customCss || styles.logo}
            width={width || undefined}
            alt={handleStringLimit(partnerName, 10)}
          />
          {renderLots()}
        </div>
      ) : (
        <>
          <span className={styles.name}>
            {asset && handleStringLimit(partnerName, 10)}
          </span>
          {renderLots()}
        </>
      );
    }
  };

  return (
    <div
      style={{
        height: height ? height : 'auto',
      }}
      className={classNames(
        styles.container,
        handleExtraProps(customContainerClass)
      )}
      data-testid="partner-logo-container"
    >
      {url ? <a href={url}>{renderLogo()}</a> : renderLogo()}
    </div>
  );
}
