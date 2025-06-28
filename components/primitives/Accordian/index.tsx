import { useEffect, useState } from 'react';
import { handleExtraProps } from '../../../utils/string';
import classes from './Accordian.module.css';

type Props = {
  defaultValue?: boolean;
  title?: string;
  titleClassName?: string;
  children: React.ReactNode;
  containerClass?: string;
  size?: number;
  toggleCallback?: () => void;
};

const Accordian = (props: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    defaultValue = false,
    title = '',
    children,
    titleClassName = '',
    containerClass = '',
    size = 18,
    toggleCallback = () => {},
  } = props;

  useEffect(() => {
    setIsExpanded(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccordian = () => {
    setIsExpanded((pre) => !pre);
    toggleCallback();
  };

  const renderHeader = () => {
    return (
      <div
        className={`items-align-center-row-wise ${
          classes.pointer
        } ${handleExtraProps(containerClass)}`}
        onClick={handleAccordian}
      >
        <span className={`flex-one ${classes.title} ${titleClassName}`}>
          {title ?? ''}
        </span>

        <span
          className={`icon-caret-down ${classes.ArrowIcon} ${
            isExpanded ? classes.Rotate180 : ''
          }`}
        />
      </div>
    );
  };

  return (
    <>
      {renderHeader()}
      {isExpanded ? children : null}
    </>
  );
};

export default Accordian;
