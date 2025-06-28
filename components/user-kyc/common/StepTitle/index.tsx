import { ReactNode } from 'react';
import classes from './StepTitle.module.css';
import { handleExtraProps } from '../../../../utils/string';

type Props = {
  text?: string;
  children?: ReactNode;
  className?: string;
};

const StepTitle = ({ text = '', className = '', children }: Props) => {
  return (
    <div className={`${handleExtraProps(className)}`}>
      <h3 className={classes.Title}>{text}</h3>
      {children}
    </div>
  );
};

export default StepTitle;
