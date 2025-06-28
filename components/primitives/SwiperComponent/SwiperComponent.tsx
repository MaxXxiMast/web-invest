import React from 'react';
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper';
import { handleExtraProps } from '../../../utils/string';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Props = SwiperProps & {
  sliderDataArr?: any[];
  customSliderComponent?: (item: unknown) => React.ReactNode;
  className?: string;
  id?: string;
  SwiperSlideClassName?: string;
};

const SwiperComponent = ({
  sliderDataArr = [],
  customSliderComponent,
  className = '',
  id = '',
  SwiperSlideClassName = '',
  ...props
}: Props) => {
  const [swiperOptions, setSwiperOptions] = React.useState(props);
  const [swiperInstace, setSwiperInstace] = React.useState(null);

  // TO RESOLVE INIT ISSUE FOR NAVIGATION
  React.useEffect(() => {
    if (swiperInstace) {
      setTimeout(() => {
        setSwiperOptions({ ...props });
      }, 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swiperInstace]);

  if (sliderDataArr.length === 0) {
    return null;
  }

  return (
    <div
      className={`${handleExtraProps(className)} SwiperComponent`}
      id={handleExtraProps(id)}
    >
      <Swiper
        modules={[Pagination, Navigation, Scrollbar]}
        slidesPerView={1.2}
        spaceBetween={22}
        onSwiper={(swiper) => setSwiperInstace(swiper)}
        allowTouchMove={props?.allowTouchMove}
        {...swiperOptions}
      >
        {sliderDataArr.length > 0 &&
          sliderDataArr.map((ele: any) => {
            return (
              <SwiperSlide
                className={`${handleExtraProps(SwiperSlideClassName)}`}
                key={`SwiperSlide__${ele.id || ele.altText || ele?.assetID}`}
              >
                {customSliderComponent(ele)}
              </SwiperSlide>
            );
          })}
      </Swiper>
    </div>
  );
};

export default SwiperComponent;
