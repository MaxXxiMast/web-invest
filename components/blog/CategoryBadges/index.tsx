import React, { Ref } from 'react';
import { handleExtraProps } from '../../../utils/string';
import classes from './CategoryBadges.module.css';

type Props = {
  tagList?: any[];
  className?: string;
  handleClickEvent?: (tag: string) => void;
};

const CategoryBadges = (
  { tagList = [], className = '', handleClickEvent = () => {} }: Props,
  ref: Ref<any>
) => {
  if (tagList.length === 0) {
    return null;
  }
  return (
    <div
      ref={ref}
      className={`${classes.Wrapper} ${handleExtraProps(className)}`}
    >
      {tagList.map((ele: any) => {
        return (
          <span
            onClick={() => handleClickEvent(ele)}
            title={ele}
            key={ele}
            className={`${classes.Badge} textEllipsis`}
          >
            {ele}
          </span>
        );
      })}
    </div>
  );
};

export default React.forwardRef(CategoryBadges);
