import classes from './DematAdd.module.css';

// swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/css';

// Primitive Components
import Image from '../../../primitives/Image';
import CustomSkeleton from '../../../primitives/CustomSkeleton/CustomSkeleton';

// Utils
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import { trackEvent } from '../../../../utils/gtm';

export const DematModals = (props) => {
  const { cardLists, setSelectedModalData, hideCards = false } = props || {};
  const isMobile = useMediaQuery();

  const handleClick = (item) => {
    trackEvent('Demat_Card_Opened', { name: item?.title || '' });
    setSelectedModalData(item);
  };

  const handleKeyDown = (event, item) => {
    if (event.key === 'Enter') {
      handleClick(item);
    }
  };

  const Card = ({ item }) => {
    const source = item?.icon?.data?.attributes?.url ?? '';

    return (
      <div
        className={`flex-column ${classes.Card}`}
        onClick={() => handleClick(item)}
        onKeyUp={(e) => handleKeyDown(e, item)}
        role="button"
        tabIndex={0}
      >
        <p>{item?.title ?? ''}</p>
        <div className={`flex ${classes.Icons}`}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/ArrowUpRight.svg`}
            alt="Tick"
            width={24}
            height={24}
            layout={'fixed'}
          />
          {source ? (
            <Image
              src={source}
              alt="BrokersStack"
              width={item?.widthIcon ?? 60}
              height={24}
              layout={'fixed'}
            />
          ) : null}
        </div>
      </div>
    );
  };

  const renderPagination = () => (
    <div id="DematSliderPagination" className={`flex ${classes.pagination}`} />
  );

  if (!Array.isArray(cardLists) || hideCards) {
    return null;
  }

  if (cardLists?.length === 0)
    return (
      <CustomSkeleton
        styles={{
          width: '100%',
          height: 100,
          marginTop: isMobile ? 24 : 0,
        }}
      />
    );

  const list = cardLists?.filter((item) =>
    isMobile ? item?.showOnMobile : item?.showOnDesktop
  );

  const sliderSpacing = isMobile ? 40 : 0;

  return (
    <div className={`${classes.container}`}>
      <Swiper
        slidesPerView={isMobile ? 2.3 : 2}
        spaceBetween={15}
        pagination={{
          clickable: true,
          el: '#DematSliderPagination',
          bulletActiveClass: classes.swiperBulletActive,
          bulletClass: classes.swiperBullet,
        }}
        slidesOffsetBefore={sliderSpacing}
        slidesOffsetAfter={sliderSpacing}
        modules={[Pagination]}
        className={`flex direction-column ${classes.SwiperComponent}`}
      >
        {list?.length > 2 ? renderPagination() : null}
        {list.map((t) => (
          <SwiperSlide className={classes.testimonial} key={'DematCard-' + t}>
            <Card item={t?.title} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
