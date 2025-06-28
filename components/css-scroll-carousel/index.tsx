import React, { useRef, useState, useEffect } from 'react';
import { handleExtraProps } from '../../utils/string';

import styles from './CssScrollCarousel.module.css';

type Props<T> = {
  data: any[];
  slideWidth: number;
  gap?: number;
  dragSpeed?: number;
  animationSpeed?: number;
  animationTimingFunction?: string;
  animationIterationCount?: string | number;
  renderItem?: (item: T, index: number) => React.ReactNode;
  className?: string;
};

const CssScrollCarousel = <T,>({
  data = [],
  gap = 20,
  slideWidth = 290,
  dragSpeed = 2,
  animationSpeed = 20,
  animationTimingFunction = 'linear',
  animationIterationCount = 'infinite',
  className = '',
  renderItem,
}: Props<T>) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Continuous scrolling effect
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let animationFrameId: number;

    const scrollContinuously = () => {
      if (!isDragging && !isHovered) {
        slider.scrollLeft += 1;
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scrollContinuously);
    };

    scrollContinuously();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging, isHovered]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current!.offsetLeft);
    setScrollLeft(sliderRef.current!.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current!.offsetLeft;
    const walk = (x - startX) * dragSpeed;
    sliderRef.current!.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      className={`${styles.slider} ${handleExtraProps(className)}`}
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onTouchMove={(e) => handleMouseMove(e as any)}
      onMouseEnter={() => setIsHovered(true)}
      style={
        {
          '--slideWidth': `-${slideWidth}px`,
          '--slideCount': data.length,
        } as any
      }
    >
      <div
        className={styles.slideTrack}
        style={{
          gap: `${gap}px`,
          animationDuration: `${animationSpeed}s`,
          animationTimingFunction: animationTimingFunction,
          animationIterationCount: animationIterationCount,
        }}
      >
        {data.map((item: T, index: number) => (
          <div
            className={`carousal-slide ${styles.slide}`}
            key={(item as any).id || `item-${item}`}
          >
            {renderItem(item, index)}
          </div>
        ))}
        {data.map((item: T, index: number) => (
          <div
            className={`carousal-slide ${styles.slide}`}
            key={
              (item as any).id
                ? `${(item as any).id}-duplicate`
                : `item-${item}`
            }
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CssScrollCarousel;
