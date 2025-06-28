import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';

import Image from '../../components/primitives/Image';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { sliderClasses } from './SwipperStyle';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../utils/string';

type SwipperProps = {
  sliderData: unknown[];
  customSliderComponent: (item: unknown) => React.ReactNode;
  classes?: Partial<{
    swiperSlideClass: any;
  }>;
};

function Swipper(props: SwipperProps) {
  const isMobile = useMediaQuery();

  const { sliderData, customSliderComponent, classes } = props;

  const renderPagination = () => {
    return (
      <div
        id="SliderPagination"
        className={sliderClasses.sliderPagination}
      ></div>
    );
  };

  const renderSwiper = (showPaginationMobile: boolean = false) => {
    return (
      <>
        <Swiper
          slidesPerView={1}
          spaceBetween={16}
          navigation={{
            prevEl: '#prevRef',
            nextEl: '#nextRef',
          }}
          pagination={{
            clickable: true,
            el: '#SliderPagination',
            bulletActiveClass: sliderClasses.swiperPaginationActiveBullet,
            bulletClass: sliderClasses.swiperBullet,
          }}
          modules={[Navigation, Pagination]}
        >
          {sliderData.length > 0 &&
            sliderData.map((item) => {
              return (
                <SwiperSlide
                  className={classes?.swiperSlideClass}
                  key={`slideItem_${item}`}
                >
                  {customSliderComponent(item)}
                </SwiperSlide>
              );
            })}
          {!showPaginationMobile ? renderPagination() : null}
        </Swiper>
        <div className={`flex ${sliderClasses.swiperButtons}`}>
          {/* Prev Button */}
          <div className={sliderClasses.buttonContainer} id="prevRef">
            <div className={sliderClasses.navigationIcon}>
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/backIcon.svg`}
                width={32}
                height={32}
                alt="backIcon"
              />
            </div>
          </div>
          {/* Pagination */}
          {showPaginationMobile ? renderPagination() : null}
          {/*  Next Button */}
          <div className={sliderClasses.buttonContainer} id="nextRef">
            <div className={sliderClasses.navigationIcon}>
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/nextIcon.svg`}
                width={32}
                height={32}
                alt="nextIcon"
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderChildren = () => {
    return isMobile ? renderSwiper(true) : renderSwiper();
  };

  return renderChildren();
}

export default Swipper;
