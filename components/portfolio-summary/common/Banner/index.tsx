import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import { useRouter } from 'next/router';

import Image from '../../../primitives/Image';

import { handleExtraProps } from '../../../../utils/string';
import { trackEvent } from '../../../../utils/gtm';
import { useAppSelector } from '../../../../redux/slices/hooks';

import classes from './Banner.module.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
type BannerProps = {
  data?: any;
  sectionKey?: string;
  sliderDataArr?: any[];
  className?: string;
  sliderId?: string;
};

const BannerSlider = ({
  data = {},
  sectionKey = 'portfolioSlider',
  sliderDataArr = [],
  className = '',
  sliderId = 'PortfolioSliderPagination',
}: BannerProps) => {
  const router = useRouter();

  // GET selectedAssetType
  const {
    selectedAssetType = 'Bonds, SDIs & Baskets',
    totalAmountInvested = 0,
  } = useAppSelector((state) => state.portfolioSummary);

  // GET UserID
  const { userID = '' } = useAppSelector((state) => state?.user?.userData);
  if (sliderDataArr.length === 0) {
    return null;
  }

  const handleBannerClick = (el: any) => {
    trackEvent('portfolio_summary_comms_banner', {
      'user id': userID,
      timestamp: new Date().toISOString(),
      asset_type: selectedAssetType,
      comms_URL: el?.img_src,
    });
    router.push(el?.clickUrl);
  };

  const navClick = (el: any) => {
    trackEvent('portfolio_summary_navigation_arrows', {
      'user id': userID,
      timestamp: new Date().toISOString(),
      asset_type: selectedAssetType,
      comms_URL: el?.img_src,
      widget_used: 'Comms Banner',
      'amount invested': totalAmountInvested,
    });
  };

  const renderNavigation = (isPrev: boolean = false) => (
    <div id={`${isPrev ? 'prev' : 'next'}_section__${sectionKey}`}>
      <span
        className={`icon-caret-left-circle ${classes.Arrows} ${
          !isPrev ? classes.left : classes.right
        }`}
        style={{
          transform: `rotate(${!isPrev ? '180deg' : ''})`,
          display: 'inline-block',
          marginTop: '-60%',
          position: 'absolute',
          zIndex: '5',
        }}
      />
    </div>
  );

  const handleSection = (el: any) => (
    <div className={classes.bannerSlide} onClick={() => handleBannerClick(el)}>
      <Image
        alt={el?.alternativeText}
        src={`${el?.img_src}`}
        height={360}
        layout="fill"
      />
    </div>
  );

  const handleBodyComponent = () => (
    <div>
      <Swiper
        modules={[Pagination, Navigation]}
        slidesPerView={1}
        spaceBetween={30}
        loop={false}
        pagination={{
          clickable: true,
          el: `#${sliderId}`,
          bulletActiveClass: `${classes.ActiveBullet}`,
          bulletClass: `${classes.Bullet}`,
        }}
        navigation={{
          nextEl: `#next_section__${sectionKey}`,
          prevEl: `#prev_section__${sectionKey}`,
        }}
        centeredSlides={true}
        allowTouchMove={true}
      >
        {sliderDataArr?.map((el) => (
          <SwiperSlide key={`SwiperSlide__${el}`}>
            {handleSection(el)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  return (
    <div
      className={`flex-column ${classes.ContentSection} ${handleExtraProps(
        className
      )}`}
    >
      {data?.sectionTitle && (
        <div className={`flex justify-between`}>
          <div className={classes.HeaderLeft}>
            <h3>{data?.sectionTitle ?? 'slider Title'}</h3>
            {data?.sectionSubTitle ? <h4>{data?.sectionSubTitle}</h4> : null}
          </div>
        </div>
      )}
      <div className={`${classes.CardBody}`}>{handleBodyComponent()}</div>
      {sliderDataArr?.length > 1 ? (
        <div
          className={`flex_wrapper ${classes.Navigation}`}
          onClick={navClick}
        >
          {renderNavigation(true)}
          <div className={`flex justify-evenly items-center`}>
            <div
              id={sliderId}
              className={`flex justify-evenly items-center gap-4 ${classes.pagination}`}
            ></div>
          </div>
          {renderNavigation(false)}
        </div>
      ) : null}
    </div>
  );
};

export default BannerSlider;
