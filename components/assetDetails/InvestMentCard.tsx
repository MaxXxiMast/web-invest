// NODE MODULES
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

// Components
import AssetInfo from '../assetsList/AssetInfo';

// Utils
import { GRIP_INVEST_BUCKET_URL, handleExtraProps } from '../../utils/string';
import {
  assetStatus,
  committedInvestment,
} from '../../utils/asset';
import {
  isAssetBonds,
  isAssetStartupEquity,
  isHighYieldFd,
  isSDISecondary,
} from '../../utils/financeProductTypes';
import { toCurrecyStringWithDecimals } from '../../utils/number';
import { getTextForProgressBar } from '../../utils/ipo';
import { fetchScheduleOfReturn } from '../../api/bonds';
// Hooks
import { useAppSelector } from '../../redux/slices/hooks';

// Styles
import styles from '../../styles/InvestMentCard.module.css';

type Props = {
  className?: string;
  pageData?: any;
};
const InvestMentCard = ({ className, pageData }: Props) => {
  const [scheduleList, setPaymentScheduleData] = useState([]);

  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const backgroundImageUrl =
    asset?.bgimageWebsite ||
    `${GRIP_INVEST_BUCKET_URL}dealsV2/PlaceholderBanner.png`;

  const fetchScheduleData = async (id: number) => {
    const retuenSchedule = await fetchScheduleOfReturn(id);
    setPaymentScheduleData(retuenSchedule?.msg?.list);
  };
  const router = useRouter();

  const { value } = router.query;

  // Payment Schedule
  useEffect(() => {
    const assetId = Number(value[value.length - 1]);
    if (
      assetId &&
      Object.keys(asset).length > 0 &&
      assetStatus(asset) === 'past' &&
      (isAssetBonds(asset) || isSDISecondary(asset))
    ) {
      fetchScheduleData(assetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.assetStatus]);

  const isActiveDeal = assetStatus(asset) === 'active';
  const isStartupEquity = isAssetStartupEquity(asset);

  let collectedAmount = toCurrecyStringWithDecimals(
    asset?.collectedAmount || 0,
    1,
    true
  );

  if (!isActiveDeal && !isStartupEquity) {
    collectedAmount = toCurrecyStringWithDecimals(
      asset?.totalReturnsAmount || 0,
      1,
      true
    );
  }

  const getStats = () => {
    if (isHighYieldFd(asset)) {
      const FdInvestedUsersData =
        (pageData as any[])
          ?.find((d: any) => d?.keyValue === 'FdInvestedUsersData')
          ?.objectData?.find((d: any) => d?.assetName === asset?.name) ?? null;
      return (
        <div
          className={`flex ${
            FdInvestedUsersData ? 'justify-between' : 'justify-evenly'
          } items-center ${styles.FdStatsContainer}`}
        >
          <div className={styles.FdInterestContainer}>
            <p>
              up to{' '}
              <span className={styles.value}>
                {asset?.assetMappingData?.calculationInputFields?.maxInterest}%
              </span>
            </p>
            <p>Interest</p>
          </div>
          <div className={styles.TenureContainer}>
            <p>
              from{' '}
              <span className={styles.value}>
                {asset?.assetMappingData?.calculationInputFields?.tenure}{' '}
                {asset?.assetMappingData?.calculationInputFields?.tenureType}
              </span>
            </p>
            <p>Tenure</p>
          </div>
          {FdInvestedUsersData ? (
            <div
              className={`flex items-center ${styles.InvestedUsersContainer}`}
            >
              <div className={styles.InvestedUsersImage}>
                {FdInvestedUsersData?.userImages?.map(
                  (img: string) => (
                    <Image
                      src={`${GRIP_INVEST_BUCKET_URL}fd/${img}`}
                      alt="img"
                      key={`users-${img}`}
                    />
                  )
                )}
              </div>
              <p>
                <span className={styles.value}>
                  {FdInvestedUsersData?.investedUsers} users
                </span>{' '}
                invested in this FD over last 1 month
              </p>
            </div>
          ) : null}
        </div>
      );
    }

    if (isAssetBonds(asset) || isSDISecondary(asset)) {
      return (
        <div
          className={`${styles.assetInfoClass} ${styles.BondsInfo} flex items-center`}
        >
          <AssetInfo
            asset={asset}
            isPercentBar
            scheduleList={scheduleList}
            isAssetDetailPage
          />
        </div>
      );
    }

    return (
      <ul>
        <div className={`flex ${styles.assetInfoClass}`}>
          <AssetInfo asset={asset} isAssetDetailPage />
        </div>
        <li className={`text-right ${styles.ProgressBarAssetDetails}`}>
          <div className={styles.LeaseProgress}>
            <span
              style={{
                width: `${committedInvestment(asset, false)}%`,
              }}
            ></span>
          </div>
          <div className={styles.LeaseCompletion}>
            <p className={styles.LeaseCompletionFigure}>
              <span className="GreyColor">
                {collectedAmount?.split(' ')[0]}{' '}
                {collectedAmount?.split(' ')[1]}
              </span>{' '}
              <span>
                /{' '}
                {toCurrecyStringWithDecimals(
                  isActiveDeal || isStartupEquity
                    ? asset?.totalAmount + asset?.preTaxTotalAmount || 0
                    : asset?.returnsToBePaid || 0,
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
        </li>
      </ul>
    );
  };

  return (
    <div className={`${styles.InvestMentCard} ${handleExtraProps(className)}`}>
      <div className={styles.CardTopSection}>
        <div className={styles.BgImage}>
          <Image
            src={backgroundImageUrl}
            alt="investment_banner"
            width={692}
            quality={70}
            height={288}
            priority={true}
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,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"
          />
        </div>
      </div>

      {(isAssetBonds(asset) || isSDISecondary(asset)) &&
      !isActiveDeal ? null : (
        <div className={styles.StatCard}>
          <div className={styles.StatCardInner}>
            <div className={styles.LeadeTimePeriod}>{getStats()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestMentCard;
