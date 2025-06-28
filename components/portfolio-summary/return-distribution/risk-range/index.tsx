import { useContext, useState } from 'react';
import { useSelector } from 'react-redux';

// CONTEXT
import { PortfolioContext } from '../../context';

// UTILS
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';

// COMPONENTS
import Image from '../../../primitives/Image';

// STYLES
import styles from './RiskRange.module.css';

const RiskRange = () => {
  const { pageData = [] } = useContext(PortfolioContext);

  const { photo, firstName, lastName } = useSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );
  const [photoError, setPhotoError] = useState(false);

  const { preTaxIrr = 0 }: { preTaxIrr: number } = useSelector(
    (state: any) => state?.portfolioSummary
  ) as any;

  const objectData = (pageData || []).find((el) => el.keyValue === 'returnDistribution')?.objectData;
  const avgGripInvestorIRR = objectData?.avgGripInvestorIRR ?? 0;
  const lowerLimit = objectData?.lowerLimit ?? 8;
  const upperLimit = objectData?.upperLimit ?? 16;

  const getAvgGripInvestorIRR = () => {
    return (
      <>
        <div></div>
        <div className="items-align-center-column-wise">
          <span>{parseFloat(avgGripInvestorIRR.toFixed(1))}%</span>
          <span>Avg.</span>
          <span>Grip Investor</span>
        </div>
      </>
    );
  };

  const getIndicatorAndDetails = () => {
    if (preTaxIrr < 8 || preTaxIrr > 16) return null;

    const profilePhotoError = () => {
      setPhotoError(true);
    };

    return (
      <>
        <div className={`flex_wrapper ${styles.indicator}`}>
          {photo && !photoError ? (
            <Image
              src={photo}
              alt={`${firstName} ${lastName}`}
              height={27}
              width={27}
              onError={profilePhotoError}
              layout={'intrinsic'}
            />
          ) : (
            <div className="flex_wrapper">
              {firstName && firstName.charAt(0).toUpperCase()}
              {lastName && lastName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className={`items-align-center-column-wise ${styles.details}`}>
          <span>{parseFloat(preTaxIrr.toFixed(1))}%</span>
          <span>Your</span>
          <span>Portfolio</span>
        </div>
      </>
    );
  };

  return (
    <>
      <div className={styles.desktopDialer}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}portfolio/return-range.svg`}
          alt="Return Distribution"
          width={1000}
          height={300}
          layout="intrinsic"
        />
        <span className={styles.lowerLimit}>{lowerLimit}%</span>
        <div
          style={{
            left: `${
              12 + (65 / (upperLimit - lowerLimit)) * (preTaxIrr - lowerLimit)
            }%`,
          }}
          className={`items-align-center-column-wise ${styles.dial}`}
        >
          {getIndicatorAndDetails()}
        </div>
        {Math.abs(avgGripInvestorIRR - preTaxIrr) <= 1.5 ? null : (
          <div
            style={{
              left: `${
                12 +
                (65 / (upperLimit - lowerLimit)) *
                  (avgGripInvestorIRR - lowerLimit)
              }%`,
            }}
            className={`items-align-center-column-wise justify-center ${styles.avgIndicator}`}
          >
            {getAvgGripInvestorIRR()}
          </div>
        )}
        <span className={styles.upperLimit}>{upperLimit}%</span>
      </div>
      <div className={styles.mobileDialer}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}portfolio/return-range-mobile.svg`}
          alt="Return Distribution"
          width={1000}
          height={500}
          layout="intrinsic"
        />
        <span className={styles.lowerLimit}>{lowerLimit}%</span>
        <div
          style={{
            left: `${
              6 + (61 / (upperLimit - lowerLimit)) * (preTaxIrr - lowerLimit)
            }%`,
          }}
          className={`items-align-center-column-wise ${styles.dial}`}
        >
          {getIndicatorAndDetails()}
        </div>
        {Math.abs(avgGripInvestorIRR - preTaxIrr) < 3.2 ? null : (
          <div
            style={{
              left: `${
                6 +
                (61 / (upperLimit - lowerLimit)) *
                  (avgGripInvestorIRR - lowerLimit)
              }%`,
            }}
            className={`items-align-center-column-wise ${styles.avgIndicator}`}
          >
            {getAvgGripInvestorIRR()}
          </div>
        )}
        <span className={styles.upperLimit}>{upperLimit}%</span>
      </div>
    </>
  );
};

export default RiskRange;
