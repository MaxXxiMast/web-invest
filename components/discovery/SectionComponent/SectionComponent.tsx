// NODE MODULES
import { useEffect, useState } from 'react';
import { SwiperProps } from 'swiper/react';

// Components
import SwiperComponent from '../../primitives/SwiperComponent/SwiperComponent';
import SwiperNavigation from '../../primitives/SwiperNavigation/SwiperNavigation';
import Image from '../../primitives/Image';

// utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Styles
import classes from './SectionComponent.module.css';

type Props = {
  data: any;
  sectionKey?: any;
  sliderDataArr?: any[];
  handleSlideComponent?: (ele: unknown) => React.ReactNode;
  sliderOptions?: SwiperProps;
  isSliderSection?: boolean;
  otherComponent?: () => JSX.Element;
  isShowBlurEnd?: boolean;
  isInvestedUser?: boolean;
  className?: string;
  navigationClassName?: string;
  showNewNavigation?: boolean;
  stylingClass?: string;
  colored?: boolean;
};

const SectionComponent = ({
  data,
  sectionKey = 0,
  handleSlideComponent,
  sliderDataArr = [],
  sliderOptions,
  isSliderSection = true,
  otherComponent = () => null,
  isShowBlurEnd = false,
  isInvestedUser = false,
  className = '',
  navigationClassName = '',
  showNewNavigation = false,
  stylingClass,
  colored,
}: Props) => {
  const [isLastSlide, setIsLastSlide] = useState(false);
  const [isFirstSlide, setIsFirstSlide] = useState(true);

  const isMobileDevice = useMediaQuery('(max-width: 992px)');

  useEffect(() => {
    if (sliderDataArr.length - Number(sliderOptions?.slidesPerView) > 0) {
      setIsLastSlide(false);
    } else {
      setIsLastSlide(true);
    }
  }, [sliderOptions?.slidesPerView, sliderDataArr]);

  const handleSectionClassName = (ele: any) => {
    if (ele?.sectionId === 'explainerVideos') {
      if (!isInvestedUser) {
        return classes.AssetSection;
      } else {
        return classes.InvestedAssetSection;
      }
    }
    return '';
  };

  const handleSlideChange = (slidedata: any) => {
    if (slidedata?.activeIndex != 0) {
      setIsFirstSlide(false);
    } else {
      setIsFirstSlide(true);
    }

    if (
      slidedata?.activeIndex ==
      sliderDataArr.length - Math.floor(Number(sliderOptions?.slidesPerView))
    ) {
      setIsLastSlide(true);
    } else {
      setIsLastSlide(false);
    }
  };

  const handleSliderClasses = () => {
    if (data?.showInCard === true || data?.showInCard === null) {
      return ` ${
        !isFirstSlide && showNewNavigation ? classes.LastSlider : ''
      } ${!isFirstSlide ? classes.ShowLeftBlur : ''} ${
        isLastSlide ? '' : classes.AssetSlider
      }  ${sliderDataArr.length <= 2 ? classes.BlankLastSlider : ''}`;
    }
    return isShowBlurEnd
      ? `${classes.BlurEndSlider} ${
          isLastSlide ? classes.BlurEndLastSlider : ''
        }`
      : '';
  };

  const isAllowTouchMove = () => {
    return window?.innerWidth < 768 ? true : sliderDataArr.length > 2;
  };

  const handleBodyComponent = () => {
    if (!isSliderSection) {
      return <div>{handleSlideComponent('')}</div>;
    }

    return (
      <SwiperComponent
        sliderDataArr={sliderDataArr}
        customSliderComponent={handleSlideComponent}
        navigation={{
          nextEl: `#next_section__${sectionKey}`,
          prevEl: `#prev_section__${sectionKey}`,
        }}
        scrollbar={{
          el: `#progress_section__${sectionKey}`,
          draggable: true,
        }}
        className={`${classes.SliderSection} ${
          classes.SwiperWrapper
        } ${handleSliderClasses()}`}
        onSlideChange={(slidedata) => handleSlideChange(slidedata)}
        onTouchEnd={(slidedata) => handleSlideChange(slidedata)}
        onTouchMove={() => setIsLastSlide(false)}
        slidesOffsetAfter={20}
        allowTouchMove={isAllowTouchMove()}
        {...sliderOptions}
      />
    );
  };

  const renderNavigationArrow = (
    <Image
      src={`${GRIP_INVEST_BUCKET_URL}homev3/ArrowRight.svg`}
      width={10}
      height={10}
      layout="fixed"
      alt="Arrowright"
    />
  );

  const renderLeftNavigation = () => {
    return !isMobileDevice ? (
      <div
        className={`${classes.NavArrow} ${classes.PrevArrow} ${
          isFirstSlide ? classes.hidden : ''
        }`}
        id={`prev_section__${sectionKey}`}
      >
        {renderNavigationArrow}
      </div>
    ) : null;
  };

  const renderRightNavigation = () => {
    return !isMobileDevice ? (
      <div
        className={`${classes.NavArrow} ${isLastSlide ? classes.hidden : ''}`}
        id={`next_section__${sectionKey}`}
      >
        {renderNavigationArrow}
      </div>
    ) : null;
  };

  if (!data || (isSliderSection && sliderDataArr.length == 0)) {
    return null;
  }

  return (
    <div
      key={`ContentSection_${sectionKey}`}
      className={`${classes.ContentSection} ${handleSectionClassName(
        data
      )} ${handleExtraProps(className)}`}
    >
      {(data?.sectionTitle || isSliderSection) && (
        <div className={classes.CardHeader}>
          <div className={classes.HeaderLeft}>
            <h3>{data?.sectionTitle}</h3>
            {data?.sectionSubTitle ? <h4>{data?.sectionSubTitle}</h4> : null}
          </div>
        </div>
      )}
      <div
        className={`${classes.CardBody} ${
          isShowBlurEnd ? 'position-relative' : ''
        }`}
      >
        {handleBodyComponent()}
      </div>
      {otherComponent()}
      {showNewNavigation && renderLeftNavigation()}
      {showNewNavigation && renderRightNavigation()}
      {isSliderSection && sliderDataArr.length > 2 && (
        <div className={`${classes.HeaderRight} ${navigationClassName}`}>
          <SwiperNavigation
            colored={colored}
            isFirstSlide={isFirstSlide}
            isLastSlide={isLastSlide}
            nextBtnId={`next_section__${sectionKey}`}
            prevBtnId={`prev_section__${sectionKey}`}
            stylingClass={stylingClass}
          />
        </div>
      )}
    </div>
  );
};

export default SectionComponent;
