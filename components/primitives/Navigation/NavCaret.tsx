import React from 'react';
import { NavigationLinkModel } from './NavigationModels';
import classes from './Navigation.module.css';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

type Props = {
  linkArr: NavigationLinkModel[];
  handleClickEvent?: (e: any) => void;
};

const NavCaret = ({ linkArr = [], handleClickEvent }: Props) => {
  const caretRef = React.useRef<any>(null);
  const isMobileDevice = useMediaQuery('(max-width: 992px)');

  // Arrow should not come for desktop and no children are available
  if (!isMobileDevice && !linkArr.length) {
    return null;
  }

  return (
    <span
      ref={caretRef}
      className={`${classes.NavCaret} ${
        !linkArr.length ? classes.NavCaretRight : null
      }`}
      onClick={handleClickEvent}
    >
      <span className={`icon-caret-down`}></span>
    </span>
  );
};

export default NavCaret;
