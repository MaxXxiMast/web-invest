import { handleExtraProps } from '../../../utils/string';
import classes from './CustomSkeleton.module.css';

type Props = {
  styles?: React.CSSProperties;
  className?: string;
  [key: string]: any;
};

const CustomSkeleton = ({ className = '', styles = {}, ...props }: Props) => {
  return (
    <div
      data-testid="skeleton"
      className={`${classes.Wrapper} ${handleExtraProps(className)}`}
      style={{ ...styles }}
      {...props}
    />
  );
};

export default CustomSkeleton;
