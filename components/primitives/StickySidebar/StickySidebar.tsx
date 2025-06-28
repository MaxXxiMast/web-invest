import React from 'react';
import Sticky from 'react-sticky-el';

type Props = {
  children?: any;
  parentId?: string;
  className?: string;
  stickyClassName?: string;
  bottomOffset?: number;
  isSticky?: boolean;
};

const StickySidebar = ({
  children,
  parentId,
  className,
  stickyClassName,
  bottomOffset = 80,
  isSticky = true,
}: Props) => {
  if (!isSticky) {
    return children;
  }
  return (
    <Sticky
      mode="top"
      boundaryElement={`${parentId}`}
      bottomOffset={bottomOffset}
      stickyClassName={`${stickyClassName}`}
    >
      {children}
    </Sticky>
  );
};

export default StickySidebar;
