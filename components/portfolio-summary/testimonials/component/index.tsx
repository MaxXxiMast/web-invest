import React, { useContext, useMemo } from 'react';
import Image from 'next/image';

// swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';

// context
import { PortfolioContext } from '../../context';

// css
import classes from './Testimonials.module.css';

const Testimonials = () => {
  const { pageData = [] } = useContext(PortfolioContext);

  const testimonials = useMemo(
    () =>
      ((pageData as any[]) || []).filter(
        (d: any) => d?.__component === 'shared.testimonial-component'
      )[0]?.testimonials || [],
    [pageData]
  );

  const renderPagination = () => {
    return (
      <div id="SliderPagination" className={`flex ${classes.pagination}`}></div>
    );
  };

  if (!testimonials.length) return null;

  return (
    <div className={`${classes.container}`}>
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        centeredSlides={true}
        pagination={{
          clickable: true,
          el: '#SliderPagination',
          bulletActiveClass: classes.swiperBulletActive,
          bulletClass: classes.swiperBullet,
        }}
        modules={[Autoplay, Pagination]}
        className="flex direction-column-reverse"
      >
        {testimonials.map((t) => (
          <SwiperSlide
            className={classes.testimonial}
            key={'testimonials-' + t}
          >
            <h2>{t?.content}</h2>
            <div className={`flex items-center ${classes.profile}`}>
              <Image
                className={classes.profileImg}
                src={t?.profileImage?.data?.attributes?.url}
                alt="datalogo"
                height={52}
                width={52}
              />
              <div>
                <p>{t?.name}</p>
                <p>{t?.subTitle}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
        {renderPagination()}
      </Swiper>
    </div>
  );
};

export default Testimonials;
