import React from 'react';
import { handleExtraProps } from '../../../utils/string';
import classes from './SwiperNavigation.module.css';

type Props = {
  prevBtnId?: string;
  nextBtnId?: string;
  progressBarId?: string;
  isFirstSlide?: boolean;
  isLastSlide?: boolean;
  showNavigation?: boolean;
  showScrollbar?: boolean;
  className?: string;
  id?: string;
  stylingClass?: string;
  colored?: boolean;
};

const SwiperNavigation = ({
  prevBtnId = '',
  nextBtnId = '',
  progressBarId = '',
  showNavigation = true,
  showScrollbar = false,
  className = '',
  id = '',
  isFirstSlide,
  isLastSlide,
  stylingClass,
  colored = false,
}: Props) => {
  const eleRef = React.useRef(null);
  React.useEffect(() => {
    const ele = document.getElementById(handleExtraProps(progressBarId));
    if (eleRef && eleRef.current) {
      if (ele && ele.classList.contains('swiper-scrollbar-lock')) {
        eleRef.current.classList.add(classes.HideNaV);
      } else {
        eleRef.current.classList.remove(classes.HideNaV);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`${stylingClass} ${
        classes.SwiperNavigation
      } ${handleExtraProps(className)}`}
      ref={eleRef}
      id={handleExtraProps(id)}
    >
      {showNavigation && (
        <div
          className={`${classes.NavArrow} SwiperNavArrow`}
          id={handleExtraProps(prevBtnId)}
        >
          <span
            className={`${
              isFirstSlide
                ? ''
                : `icon-caret-left ${classes.Arrow} ${
                    colored ? '' : classes.colored
                  }`
            }`}
          />
        </div>
      )}
      {showScrollbar && (
        <div
          className={`${classes.NavProgress} SwiperNavProgress`}
          id={handleExtraProps(progressBarId)}
        ></div>
      )}
      {showNavigation && (
        <div
          className={`${classes.NavArrow} SwiperNavArrow`}
          id={handleExtraProps(nextBtnId)}
        >
          <span
            className={`${
              isLastSlide
                ? ''
                : `icon-caret-right ${classes.Arrow} ${
                    colored ? '' : classes.colored
                  }`
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default SwiperNavigation;
