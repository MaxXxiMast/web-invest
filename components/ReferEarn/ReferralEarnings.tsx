import { Navigation, Pagination, Scrollbar } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

//Components
import EarnMore from './EarnMore';
import ReferralRewardCard from './ReferralRewardCard';
import SwiperNavigation from '../primitives/SwiperNavigation/SwiperNavigation';

//Utils
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../redux/slices/hooks';
import { isGCOrder } from '../../utils/gripConnect';

//Styles
import styles from '../../styles/Referral/ReferralEarnings.module.css';
import 'swiper/css/navigation';

type ReferralEarningsProps = {
  earnMoreContent: any;
};

const moreRewardsList = [
  {
    productType: 'Corporate Bonds',
    brokerage: 0.5,
    icon: 'commons/bondx.svg',
    id: 'bonds',
  },
  {
    productType: 'SDIs',
    brokerage: '1.0',
    icon: 'commons/sdi.svg',
    id: 'sdi',
  },
  {
    productType: 'Baskets',
    icon: 'commons/basketicon.svg',
    id: 'baskets',
  },
];

const ReferralEarnings = ({ earnMoreContent }: ReferralEarningsProps) => {
  const isMobile = useMediaQuery();
  const isGC = isGCOrder();
  const assetCardsToShow =
    useAppSelector(
      (state) =>
        state.gcConfig?.configData?.themeConfig?.pages?.referral
          ?.assetCardsToShow
    ) || [];

  const assetCards =
    isGC && assetCardsToShow?.length
      ? moreRewardsList.filter((asset) => assetCardsToShow.includes(asset.id))
      : moreRewardsList;

  const renderForMobile = () => {
    return (
      <div className={'flex-column items-center justify-between'}>
        {assetCards.map((item: any, index: number) => {
          return (
            <ReferralRewardCard
              data={item}
              className={`ReferralType${index + 1}`}
              key={item?.productType}
            />
          );
        })}
      </div>
    );
  };

  const renderForDesktop = () => {
    const swiperView = moreRewardsList?.length > 3;
    return (
      moreRewardsList?.length && (
        <div
          className={`${
            swiperView
              ? styles.ReferralEarningsSlider
              : `${styles.ReferralEarningsNoSlider}`
          } ${
            moreRewardsList?.length < 3
              ? `${styles?.[`leftMargin${moreRewardsList?.length}`]}`
              : ''
          }`}
        >
          <Swiper
            spaceBetween={30}
            slidesPerView={2}
            modules={[Pagination, Navigation, Scrollbar]}
            navigation={{
              prevEl: '#navigationPrevRef',
              nextEl: '#navigationNextRef',
            }}
            scrollbar={{
              el: `#navigationScroll`,
              draggable: true,
            }}
            breakpoints={{
              0: {
                spaceBetween: 16,
                slidesPerView: 1.1,
              },
              600: {
                spaceBetween: 16,
                slidesPerView: 2,
              },
              768: {
                spaceBetween: 20,
                slidesPerView: 2,
              },
              900: {
                spaceBetween: 20,
                slidesPerView: 2.5,
              },
              1200: {
                spaceBetween: 30,
                slidesPerView: 3,
              },
            }}
          >
            {assetCards?.map((item: any, index: number) => {
              return (
                <SwiperSlide key={item?.productType}>
                  <ReferralRewardCard
                    data={item}
                    className={`ReferralType${index + 1}`}
                  />
                </SwiperSlide>
              );
            })}
            {swiperView && (
              <div className={`${styles.SliderNavigation}`}>
                <SwiperNavigation
                  nextBtnId={`navigationNextRef`}
                  prevBtnId={`navigationPrevRef`}
                  progressBarId={`navigationScroll`}
                  className={styles.ScrollBar}
                />
              </div>
            )}
          </Swiper>
        </div>
      )
    );
  };

  return (
    <div className={`${styles.ReferralEarnings} slide-up`} id="EarnMore">
      <div className="">
        <div className={`${styles.ReferralEarningsinner}`}>
          <EarnMore className={styles.EarnMore} data={earnMoreContent} />
          {isMobile ? renderForMobile() : renderForDesktop()}
        </div>
      </div>
    </div>
  );
};

export default ReferralEarnings;
