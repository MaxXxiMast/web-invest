//Node Modules
import { useEffect } from 'react';

// utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';

//API
import { fetchAPI } from '../../../api/strapi';

//Redux
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { setRatingData } from '../../../redux/slices/assets';

// styles
import styles from './RatingScale.module.css';
import Image from '../../primitives/Image';

const RatingScale = ({
  rating = '',
  isShowLevel = true,
  ratedBy = '',
  className = '',
  containerClass = '',
}) => {
  const dispatch = useAppDispatch();
  const ratingScaleMapping =
    useAppSelector((state) => state?.assets?.ratingScaleData) || {};

  const { riskLevel, elevationAngle = -1 } =
    ratingScaleMapping?.[rating?.split(' ')?.[1]?.toUpperCase() || rating] ||
    {};

  const getRatingScaleData = async () => {
    const ratingScale = await fetchAPI('/inner-pages-data', {
      filters: {
        url: '/rating-scale',
      },
      populate: '*',
    });
    const ratingScaleMapping =
      ratingScale?.data?.[0]?.attributes?.pageData?.find(
        (item: any) => item.keyValue === 'map'
      )?.objectData;
    dispatch(setRatingData(ratingScaleMapping));
  };

  useEffect(() => {
    if (Object.keys(ratingScaleMapping)?.length === 0) {
      getRatingScaleData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!riskLevel || elevationAngle === -1) {
    return null;
  }

  return (
    <div className={`${styles.container} ${handleExtraProps(containerClass)}`}>
      <div className={`flex items-center ${styles.header} rating-header`}>
        <div className={styles.meterContainer}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}assets/rating-meter.svg`}
            className={styles.ratingMeter}
            alt="rating meter"
            layout={'intrinsic'}
          />
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${GRIP_INVEST_BUCKET_URL}assets/needle.svg`}
              className={styles.needle}
              alt="needle"
              style={{
                transform: `rotate(${elevationAngle}deg)`,
              }}
            />
          </>
        </div>

        <span className={`${styles.rating} ${handleExtraProps(className)}`}>
          {ratedBy ? `${ratedBy} ` : ''}
          {rating}
        </span>
      </div>
      {isShowLevel && <div className={styles.label}>{riskLevel}</div>}
    </div>
  );
};

export default RatingScale;
