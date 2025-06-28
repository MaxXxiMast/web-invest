import React, { ComponentType, useEffect, useState } from 'react';
import useIntersectionObserver from './useIntersectionObserver';
import CustomSkeleton from '../components/primitives/CustomSkeleton/CustomSkeleton';

const withLazyLoad = <P extends object>(
  WrappedComponent: ComponentType<P>,
  threshold = 0.3
): React.FC<P> => {
  // eslint-disable-next-line react/display-name
  return (props: P) => {
    const [isInView, ref] = useIntersectionObserver(threshold);
    const [hasLoaded, setHasLoaded] = useState(false);
    useEffect(() => {
      if (isInView && !hasLoaded) {
        setHasLoaded(true);
      }
    }, [isInView, hasLoaded]);
    return (
      <div ref={ref}>
        {hasLoaded ? (
          <WrappedComponent {...props} />
        ) : (
          <CustomSkeleton
            styles={{
              width: '100%',
              height: '150px',
            }}
          />
        )}
      </div>
    );
  };
};

export default withLazyLoad;
