import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import styles from './TooltipCompoent.module.css';

type PlacementProp =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top';

type TooltipType = {
  children?: any;
  toolTipText: any;
  trigger?: any;
  placementValue?: PlacementProp;
  linkClass?: any;
  checkOnScrollTooltip?: boolean;
  additionalStyle?: any;
};

const TooltipCompoent = ({
  children,
  toolTipText = '',
  placementValue,
  linkClass,
  checkOnScrollTooltip = false,
  additionalStyle = {},
}: TooltipType) => {
  const isMobile = useMediaQuery();
  const toolTipRef = React.useRef(null);
  const [openTooltip, setOpenTooltip] = React.useState(false);
  const placementDefaultValue = window.innerWidth >= 767 ? 'top-end' : 'top';
  const placement = placementValue || placementDefaultValue;

  React.useEffect(() => {
    if (toolTipRef) {
      const clickOutsideEvent = (event: Event) => {
        if (toolTipRef.current && !toolTipRef.current.contains(event.target)) {
          setOpenTooltip(false);
        }
      };

      window.addEventListener('click', clickOutsideEvent);
      return () => {
        window.removeEventListener('click', clickOutsideEvent);
      };
    }
  }, []);

  // Use the event when tooltip is open for mobile and scroll is happening
  React.useEffect(() => {
    if (
      checkOnScrollTooltip &&
      openTooltip &&
      window.innerWidth <= 767 &&
      toolTipRef
    ) {
      const onScrollWhenTooltipOpen = (event: Event) => {
        if (toolTipRef.current && !toolTipRef.current.contains(event.target)) {
          setOpenTooltip(false);
        }
      };
      window.addEventListener('scroll', onScrollWhenTooltipOpen);
      return () => {
        window.removeEventListener('scroll', onScrollWhenTooltipOpen);
      };
    }
  });

  const MobileToltip = () => {
    return (
      <Tooltip
        open={openTooltip}
        onClick={() => setOpenTooltip(!openTooltip)}
        placement={placement}
        enterTouchDelay={0}
        title={toolTipText}
        arrow
        ref={toolTipRef}
        classes={{
          arrow: `${styles.Arrow} ${additionalStyle?.ArrowStyle}`,
          tooltip: `${styles.ToolTip} ${additionalStyle?.ToolTipStyle}`,
          popper: `${styles.TooltipPopper} ${additionalStyle?.ParentClass}`,
        }}
      >
        <span className={`${styles.ToolTipData} ${linkClass ? linkClass : ''}`}>
          {children}
        </span>
      </Tooltip>
    );
  };

  const DesktopTootip = () => {
    return (
      <Tooltip
        placement={placement}
        enterTouchDelay={0}
        title={toolTipText}
        arrow
        classes={{
          arrow: `${styles.Arrow} ${additionalStyle?.ArrowStyle}`,
          tooltip: `${styles.ToolTip} ${additionalStyle?.ToolTipStyle}`,
          popper: `${styles.TooltipPopper} ${additionalStyle?.ParentClass}`,
        }}
      >
        <span className={`${styles.ToolTipData} ${linkClass ? linkClass : ''}`}>
          {children}
        </span>
      </Tooltip>
    );
  };

  if (!toolTipText) {
    return null;
  }

  return isMobile ? MobileToltip() : DesktopTootip();
};

export default TooltipCompoent;
