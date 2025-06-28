import { useEffect } from 'react';
import classnames from 'classnames';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

//Components
import RatingScale from '../../assetsList/RatingScale';
import PartnerLogo from '../../assetsList/partnerLogo';
import AssetTypeFlag from '../AssetTypeFlag/AssetTypeFlag';
import Image from '../Image';
import TooltipCompoent from '../TooltipCompoent/TooltipCompoent';

//Utils
import {
  assetPaymentStatus,
  assetStatus,
  committedInvestment,
  generateAssetURL,
  isFirstTimeInvestor,
  isMldProduct,
  validSections,
} from '../../../utils/asset';
import {
  isAssetBonds,
  isSDISecondary,
  isHighYieldFd,
  isAssetBasket,
  isAssetBondsMF,
} from '../../../utils/financeProductTypes';
import { ASSET_LIST_BADGE_MARGIN_LEFT } from '../../../utils/badge';
import {
  numberToCurrency,
  roundOff,
  toCurrecyStringWithDecimals,
  numberToIndianCurrency,
} from '../../../utils/number';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import {
  getSpecialBadgeLabel,
  getTextForProgressBar,
  getTooltipsForAssetSpecialBadge,
} from '../../../utils/ipo';
import {
  isIrrBadgeVisible,
  paymentStatusImage,
  paymentStatusLabel,
  isHideCutOut,
  getAssetInfo,
  corporateBondConstant,
} from './utils';
import { getAssetSectionMapping, getTabName } from '../../../utils/assetList';

//Redux
import { userData } from '../../../redux/slices/user';
import { setAssetsSort } from '../../../redux/slices/config';
import { useAppDispatch } from '../../../redux/slices/hooks';

//Styles
import styles from './AssetCard.module.css';
import { BadgeList } from '../../BadgeComponent';
import IRRDropBadge from '../../IrrDroppingBadge';

type FinancialProduct = {
  assetID: number;
  badges: string;
  irrDroppingDate: Date;
  collectedAmount: number | null;
  category: string;
  desc: string;
  financeProductType: string;
  productCategory: string;
  productSubcategory: string;
  header: string;
  postTaxYield: string;
  reducedTransactionAmount: number | null;
  startDate: string;
  tenure: string;
  overallDealCompletionPercentage: number;
  totalReturnsAmount: number;
  investmentInto: string;
  name: string;
  repeatInvestorsPercentage: number;
  paymentStatus: number;
  assetMappingData: {
    tenure: number;
    irrCutout: number | null;
    tenureType: string;
    maxInterest: number;
    maxTxnAmount: number;
    minTxnAmount: number;
    minAmountCutout: number | null;
    compoundingFrequency: string;
    preTaxYtm: number;
    maturityDate: dayjs.Dayjs;
    couponRate: number;
    couponInterestReturnFrequency: string;
    ratedBy: string;
    rating: string;
    calculatedFaceValue: number; // ??
    minNoOfLots: number;
    additionalCharges: number;
    interestReturnFrequency: string;
    calculationMethod: string;
    dateOfIssuance: string; // Assuming this is in 'YYYY-MM-DD' format
    dateOfMaturity: dayjs.Dayjs; // Assuming this is in 'YYYY-MM-DD' format
    firstPayout: number;
    irr: number;
    rbir: number;
    faceValue: number;
    purchasePrice: number;
    couponPrincipalPaymentFrequency: string;
    preTaxIrrCutout?: number;
  };
  fundingDetails: any | null;
  sdiDetails: Record<string, unknown>;
  assetStatus: string;
  amount: string;
  partnerIDs: string;
  assetPartnersCount: number;
  filename: string;
  filepath: string;
  partnerLogo: string;
  partnerName: string;
  returnsType: string;
  irr: number;
  spvID: number;
  spvType: string;
  categoryID: number;
  isRfq: boolean;
  preTaxCollectedAmount: number;
  preTaxMinAmount: number;
  preTaxTotalAmount: number;
  preTaxTotalMaxAmount: number;
  minAmount: number;
  totalAmount: number;
  totalMaxAmount: number;
  minInvestmentAmount: number;
};

type LeaseCardProps = {
  className?: any;
  cardHeaderClass?: any;
  userInfo?: userData;
  asset: FinancialProduct;
  tab?: { id: number; title: string };
  sortType?: string;
  isMobile?: boolean;
  [props: string]: any;
  onAppDownloadModalOpen?: () => void;
  customOnClick?: () => boolean;
};

const LeaseCard = (props: LeaseCardProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { className, cardHeaderClass, asset, userInfo } = props;
  const sectionMapping = getAssetSectionMapping();
  const isActiveDeal = assetStatus(asset) === 'active';
  const isCorporateBondAsset = isAssetBonds(asset);
  const isSDISecondaryAsset = isSDISecondary(asset);
  let collectedAmount = toCurrecyStringWithDecimals(
    asset.collectedAmount || 0,
    1,
    true
  );
  if (!isActiveDeal) {
    collectedAmount = toCurrecyStringWithDecimals(
      asset.totalReturnsAmount || 0,
      1,
      true
    );
  }
  const enableAmountLeftBar = asset?.badges
    ?.split(',')
    ?.includes('amount left');

  const info: any[] = getAssetInfo(asset);
  const isMldAsset = isMldProduct(asset);
  const isReducedInvestment =
    asset.reducedTransactionAmount &&
    isFirstTimeInvestor(userInfo) &&
    isActiveDeal &&
    !isAssetBonds(asset);
  const badgesList: string[] = asset?.badges?.split(',') || [];
  const irrDroppingDate = asset?.irrDroppingDate
    ? new Date(asset.irrDroppingDate)
    : null;

  const pastDealsStartupEquityDetails = () => {
    return (
      <div
        className={styles.startupEquityPastAmount}
      >{`${toCurrecyStringWithDecimals(
        asset?.collectedAmount || 0,
        1,
        true
      )}`}</div>
    );
  };

  /**
   * This is card widget for asset list in past
   * Check is already in the return function
   */

  const CardReturnsWidget = () => {
    const status = assetPaymentStatus[asset.paymentStatus];

    const cardLabel = isCorporateBondAsset
      ? corporateBondConstant.returns
      : paymentStatusLabel[status];

    const amountRaisedLabel = isCorporateBondAsset
      ? corporateBondConstant.amountRaised
      : paymentStatusLabel[status];

    const paymentStatusImageUrl = isCorporateBondAsset
      ? `${GRIP_INVEST_BUCKET_URL}asset-details/Document.svg`
      : paymentStatusImage[status];

    const cardWidgetRightStyles = styles.CardReturnsWidgetRight;

    const cardWidgetLeftStyles = styles.CardReturnsWidgetLeft;

    return (
      <div
        className={`${styles.CardReturnsWidget} ${status.replace(/ /g, '')}`}
      >
        <div className={styles.CardReturnsWidgetInner}>
          <div className={cardWidgetLeftStyles}>
            <div className="Content">
              <Image
                src={paymentStatusImageUrl}
                alt={paymentStatusLabel[status]}
                layout={'intrinsic'}
                width={32}
                height={32}
              />
              <p>{cardLabel}</p>
            </div>
          </div>
          <div className={cardWidgetRightStyles}>
            <div className="Content">
              <label>{amountRaisedLabel}</label>
              {pastDealsStartupEquityDetails()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSpecialBadge = () => {
    const isSDISec = isSDISecondary(asset);
    const specialBadge = getSpecialBadgeLabel(isCorporateBondAsset, isSDISec);
    return specialBadge ? (
      <div className={`flex ${styles.specialBadgeContainer}`}>
        <div className={styles.specialBadgeText}>{specialBadge}</div>
        <TooltipCompoent
          toolTipText={getTooltipsForAssetSpecialBadge(
            isCorporateBondAsset,
            isSDISec
          )}
        >
          <div className={styles.specialBadgeImage}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}new-website/assets/blue-info.svg`}
              alt="blue-info"
            />
          </div>
        </TooltipCompoent>
      </div>
    ) : null;
  };

  const getMinInvestmentValue = (infoValue: string) => {
    return infoValue;
  };

  useEffect(() => {
    getMaxWidthOfBadge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMaxWidthOfBadge = (eleID?: string) => {
    const containerEl = document.getElementById(
      `list-badge-container-${asset.assetID}`
    );
    if (containerEl) {
      const containerWidth = containerEl.offsetWidth;
      let remainingContainerWidth = containerWidth;
      const badgeElements = document.querySelectorAll(
        `[id^="asset-list-badge-${asset.assetID}"]`
      );

      // NOSONAR: It is used like this not as for..of because of typescript errors which is to add new compilerOptions `downlevelIteration`
      // prettier-ignore
      for (let i = 0; i < badgeElements.length; i++) {
        // nosonar
        const badgeEl = badgeElements[i];
        const elWidth = badgeEl.clientWidth;
        const spanElement = badgeEl.getElementsByTagName('span')?.[0];
        if (spanElement) {
          if (remainingContainerWidth <= 0) {
            spanElement.style.display = 'none';
          } else if (remainingContainerWidth > elWidth) {
            spanElement.style.width = 'max-content';
          } else if (remainingContainerWidth <= elWidth) {
            const elID = badgeEl.id;
            const badgeDocumentEl = document.getElementById(elID);
            if (badgeDocumentEl) {
              spanElement.style.width = `${remainingContainerWidth}px`;
            }
          }
          remainingContainerWidth =
            remainingContainerWidth - (elWidth + ASSET_LIST_BADGE_MARGIN_LEFT);
        }
      }
    }
  };

  const getCardBodyStyles = () => {
    return `${styles.CardBody} ${!isActiveDeal ? styles.CardBodySE : ''}`;
  };

  const getLeadeTimePeriodStyles = (isSecondRow?: boolean) => {
    return `${styles.LeadeTimePeriod} ${
      !isActiveDeal ? styles.LeadeTimePeriodSE : ''
    } ${isSecondRow ? styles.BondSecondRow : ''}
    ${isMldAsset ? styles.MldBondsSecondRow : ''}`;
  };

  const getActiveTabName = (activeSectionTabName: string) => {
    return activeSectionTabName === 'Past Offers' ? 'past' : 'active';
  };

  const onClickLeaseCard = () => {
    if (props.customOnClick) {
      const canContinue = props.customOnClick();
      if (!canContinue) {
        return;
      }
    }

    localStorage.setItem('isFromAssetDetail', 'true');
    dispatch(
      setAssetsSort({
        tabSection: getTabName(
          sectionMapping,
          asset.productCategory || asset.financeProductType
        ) as validSections,
        tab: getActiveTabName(props.tab?.title),
        sortType: props.sortType,
      })
    );
    setTimeout(() => {
      router.push(generateAssetURL(asset));
    }, 100);
  };

  const handleDecimalValue = (data: any, n = 2) => {
    if (data?.suffix === '%') {
      return `${roundOff(data?.value, n)} ${data?.suffix}`;
    }
    return data?.value;
  };

  const getPartnerLogoheight = () => (props.isMobile ? 32 : 40);
  const getPartnerLogowidth = () => (props.isMobile ? 100 : 130);

  const inactiveBondsAssetDetails = () => {
    return (
      <div className={getLeadeTimePeriodStyles()}>
        <ul>
          <li className="text-left">
            <div className={styles.TimePeriodItem}>
              <h5>{handleDecimalValue(info[0])}</h5>
              <h6>{info[0]?.label}</h6>
            </div>
          </li>
          <li
            className={`text-center ${
              isMldAsset ? '' : styles.inactiveBondRating
            }`}
          >
            <div className={styles.TimePeriodItem}>
              <h5>
                <div
                  className={`${styles.bondRatingText} ${styles.inactiveBondRatingText}`}
                >
                  {isMldAsset ? info[4]?.value : info[5]?.value}
                </div>
              </h5>
              <h6
                className={`${
                  isMldAsset ? '' : styles.inactiveBondRatingTitle
                }`}
              >
                {isMldAsset ? info[4]?.label : info[5]?.label}
              </h6>
            </div>
          </li>
          <li className="text-right">
            <div className={classnames(styles.TimePeriodItem, styles.ellipsis)}>
              <h5>{handleDecimalValue(isMldAsset ? info[3] : info[4])}</h5>
              <h6>{isMldAsset ? info[3]?.label : info[4]?.label}</h6>
            </div>
          </li>
        </ul>
      </div>
    );
  };

  const isNegativeValue = (cutoutValue: any, value: any) => {
    return (
      parseFloat(cutoutValue?.replace(/[^\d.]/g, '')) >
      parseFloat(value?.replace(/[^\d.]/g, ''))
    );
  };

  const handleRemoveExtraSpace = (value = '') => {
    if (value?.includes('%')) {
      return value?.replace(/\s+/g, '');
    }
    return value;
  };

  const ListItem = (
    label: string,
    value: any,
    cutoutValue: any = null,
    valueLabel: any = null,
    showIrrDroppingSoon: boolean = false,
    isFirstItem: boolean = false
  ) => {
    const shouldHideCutOut =
      isFirstItem && isHideCutOut(irrDroppingDate, asset);

    return (
      <div className={styles.BondsListItemContainer}>
        <li className={styles.BondsListItem} key={`${label}_${value}`}>
          <div className={styles.BondsTitle}>{label}</div>
          <div className={styles.BondsValue}>
            {valueLabel ? (
              <span className={styles.valueLabel}>{valueLabel}</span>
            ) : null}
            {!shouldHideCutOut && cutoutValue && (
              <span className={styles.BondsCutOut}>
                {handleRemoveExtraSpace(cutoutValue)}
              </span>
            )}
            <span>{handleRemoveExtraSpace(value)}</span>
            {!shouldHideCutOut && cutoutValue && (
              <span
                className={`icon-arrow-up ${styles.Arrow} ${
                  isNegativeValue(cutoutValue, value) ? styles.DownArrow : ''
                }`}
              />
            )}
          </div>
        </li>
        {isIrrBadgeVisible(irrDroppingDate, asset) && showIrrDroppingSoon && (
          <div className={styles.IRRContainer}>
            <IRRDropBadge dropTime={irrDroppingDate} />
          </div>
        )}
      </div>
    );
  };

  const AssetCardList = () => {
    if (isHighYieldFd(asset) || isAssetBondsMF(asset)) {
      return (
        <ul className={styles.BondsInfo}>
          {info.map((ele) => {
            if (ele?.id === 'assetRating') {
              return null;
            }
            return ListItem(
              ele?.label,
              `${ele?.value} ${ele?.suffix}`,
              asset?.assetMappingData?.irrCutout
                ? `${asset?.assetMappingData?.irrCutout} ${ele?.suffix}`
                : null,
              ele?.valueLabel
            );
          })}
        </ul>
      );
    }
    const irrCutout =
      asset?.assetMappingData?.preTaxIrrCutout ||
      asset?.assetMappingData?.irrCutout;
    return (
      <ul className={styles.BondsInfo}>
        {ListItem(
          info[0]?.label,
          `${info[0]?.value} ${info[0]?.suffix}`,
          irrCutout ? `${irrCutout} ${info[0]?.suffix}` : null,
          null,
          true,
          true
        )}
        {ListItem('Tenure', `${info[1]?.value} ${info[1]?.suffix}`)}
        {ListItem(
          info[2]?.label,
          isReducedInvestment
            ? `₹ ${numberToCurrency(asset?.reducedTransactionAmount)}`
            : getMinInvestmentValue(info[2]?.value),
          asset?.assetMappingData?.minAmountCutout
            ? `₹ ${numberToCurrency(asset?.assetMappingData?.minAmountCutout)}`
            : null,
          null,
          false
        )}
      </ul>
    );
  };

  const RatingInfo = () => {
    if (asset?.productCategory === 'XCase') {
      return null;
    }
    const ratingInfo =
      info.filter((ele) => ele?.id === 'assetRating')?.[0] || '';
    return <RatingScale rating={ratingInfo?.value} />;
  };

  const assetCardInfo = () => {
    return (
      <div className={getLeadeTimePeriodStyles()}>
        <ul>
          <li className="text-left">
            <div className={styles.TimePeriodItem}>
              <h5>
                {info[0]?.value} {info[0]?.suffix}
              </h5>
              <h6>{info[0]?.label}</h6>
            </div>
          </li>
          <li className="text-center">
            <div className={classnames(styles.TimePeriodItem, styles.ellipsis)}>
              <h5>
                {info[1]?.value} {info[1]?.suffix}
              </h5>
              <h6>{info[1]?.label}</h6>
            </div>
          </li>
          <li className="text-right">
            <div className={styles.TimePeriodItem}>
              <h5>
                {isReducedInvestment ? (
                  <>
                    {' '}
                    {`${numberToIndianCurrency(
                      asset.reducedTransactionAmount
                    )}`}{' '}
                    {<span className={styles.OldPrice}>{info[2]?.value}</span>}
                  </>
                ) : (
                  getMinInvestmentValue(info[2].value)
                )}
              </h5>

              <h6>{info[2].label}</h6>
            </div>
          </li>
        </ul>
      </div>
    );
  };

  const bondAndSDIsecondaryCardInfo = () => {
    if (!isActiveDeal) {
      return inactiveBondsAssetDetails();
    }
    return (
      <>
        {assetCardInfo()}
        <div
          className={`${getLeadeTimePeriodStyles(true)} ${
            styles.bondDetailsLowerRow
          }`}
        >
          <ul>
            {!isMldAsset ? (
              <li className="text-left">
                <div className={styles.TimePeriodItem}>
                  <h5>{handleDecimalValue(info[3])}</h5>
                  <h6>{info[3]?.label}</h6>
                </div>
              </li>
            ) : null}
            <li className={isMldAsset ? 'text-left' : 'text-center'}>
              <div
                className={classnames(styles.TimePeriodItem, styles.ellipsis)}
              >
                <h5>{handleDecimalValue(info[isMldAsset ? 3 : 4])}</h5>
                <h6>{info[isMldAsset ? 3 : 4]?.label}</h6>
              </div>
            </li>
            <li className={isMldAsset ? 'text-center' : 'text-right'}>
              <div className={styles.TimePeriodItem}>
                <h5>
                  <div
                    className={`${styles.bondRatingText} ${styles.bondMldRatingText}`}
                  >
                    {info[isMldAsset ? 4 : 5]?.value}
                  </div>
                </h5>
                <h6>{info[isMldAsset ? 4 : 5]?.label}</h6>
              </div>
            </li>
          </ul>
        </div>
      </>
    );
  };

  const renderCardInfo = () => {
    if (isCorporateBondAsset || isSDISecondaryAsset) {
      return bondAndSDIsecondaryCardInfo();
    }
    return assetCardInfo();
  };

  const cardProgressbar = () => {
    if (enableAmountLeftBar) {
      return null;
    }
    if (!isActiveDeal) {
      return <CardReturnsWidget />;
    }
    return (
      <>
        <div className={styles.LeaseProgress}>
          <span
            style={{
              width: `${committedInvestment(asset)}%`,
            }}
          ></span>
        </div>
        <div className={styles.LeaseCompletion}>
          <p className={styles.LeaseCompletionFigure}>
            {collectedAmount?.split(' ')[0]} {collectedAmount?.split(' ')[1]}{' '}
            <span>
              /{' '}
              {toCurrecyStringWithDecimals(
                asset.totalAmount + asset.preTaxTotalAmount || 0,
                1,
                true
              )}
            </span>
          </p>

          <p className="text-center">
            <span>{committedInvestment(asset, true)}%</span>{' '}
            <span className={styles.CompletedText}>
              {getTextForProgressBar()}
            </span>
          </p>
        </div>
      </>
    );
  };

  const amoutLeftStrip = () => {
    if (!isActiveDeal || !enableAmountLeftBar) {
      return null;
    }
    return (
      <div className={styles.AmountLeftContainer}>
        <span className={`icon-quick ${styles.quickIcon}`} />
        <span className={styles.amount}>
          ₹
          {toCurrecyStringWithDecimals(
            asset.totalAmount + asset.preTaxTotalAmount - asset.collectedAmount,
            1,
            false,
            false
          )}
        </span>
        <span className={styles.text}> left!</span>
      </div>
    );
  };

  const cardFooterBadges = () => {
    if (isActiveDeal && asset?.badges?.length) {
      return (
        <div className={styles.CardFooter}>
          <BadgeList
            badges={asset?.badges?.split(',')}
            repeatInvestorsPercentage={asset?.repeatInvestorsPercentage}
          />
        </div>
      );
    }
    return null;
  };
  const handleLeaseCardClick = () => isCorporateBondAsset && onClickLeaseCard();

  return (
    <div className={styles.container}>
      {badgesList.includes('new') && (
        <div className={styles.NewFlag}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}assets/new-badge.svg`}
            alt="New Badge"
            width={70}
            height={40}
            layout="intrinsic"
          />
        </div>
      )}
      <div
        className={`${styles.LeaseDealCard} ${className ? className : ''}`}
        onClick={() => onClickLeaseCard()}
        id={asset.name}
      >
        <div
          className={`${styles.CardHeader} ${cardHeaderClass} ${
            isCorporateBondAsset ||
            isSDISecondary(asset) ||
            isAssetBasket(asset) ||
            isHighYieldFd(asset) ||
            isAssetBondsMF(asset)
              ? styles.BondsCardHeader
              : ''
          }`}
        >
          <div className={styles.CardHeaderInner}>
            <div className={`flex justify-between ${styles.CardHeaderImage}`}>
              <PartnerLogo
                isPartnershipText
                asset={asset}
                isAssetList
                height={getPartnerLogoheight()}
                width={getPartnerLogowidth()}
              />
            </div>
            {isCorporateBondAsset ||
            isSDISecondary(asset) ||
            isHighYieldFd(asset) ||
            isAssetBasket(asset) ||
            isAssetBondsMF(asset) ? (
              <RatingInfo />
            ) : (
              <div
                className={classnames(
                  'flex',
                  'flex-column',
                  isCorporateBondAsset
                    ? styles.bondBadgesContainer
                    : styles.badgesContainer,
                  {
                    [styles.whenJustInBadge]: badgesList.includes('just in'),
                  }
                )}
              >
                {isCorporateBondAsset || isSDISecondary(asset)
                  ? renderSpecialBadge()
                  : null}
                <AssetTypeFlag
                  className={styles.CardHeaderFlag}
                  asset={asset}
                  isAssetList
                />
              </div>
            )}
          </div>
          <p className={styles.assetHeader} onClick={onClickLeaseCard}>
            {asset?.header}
          </p>
        </div>
        <div className={getCardBodyStyles()} onClick={handleLeaseCardClick}>
          {/* CARD INFO SECTION */}
          {isCorporateBondAsset ||
          isSDISecondary(asset) ||
          isHighYieldFd(asset) ||
          isAssetBasket(asset) ||
          isAssetBondsMF(asset) ? (
            <AssetCardList />
          ) : (
            renderCardInfo()
          )}

          {/* CARD PROGRESS BAR */}
          {!isHighYieldFd(asset) && !isAssetBondsMF(asset)
            ? cardProgressbar()
            : null}
        </div>

        {/* CARD BOTTOM BADGES */}
        {amoutLeftStrip()}
        {cardFooterBadges()}
      </div>
    </div>
  );
};

export default LeaseCard;
