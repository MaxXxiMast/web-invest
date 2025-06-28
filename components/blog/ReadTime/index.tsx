import { handleExtraProps } from '../../../utils/string';
import classes from './ReadTime.module.css';

type Props = {
  showReadTime?: boolean;
  description?: string;
  className?: string;
};

const ReadTime = ({
  description = '',
  showReadTime = false,
  className = '',
}: Props) => {
  const wpm = 225; //Average words per minute

  const getReadTime = (desc: string) => {
    const innerText = desc?.replace(/<[^>]*>/g, '');
    const words = innerText.trim().split(/\w+/g).length;
    const readTimeCount = Math.ceil(words / wpm);
    return readTimeCount > 12 ? 12 : readTimeCount;
  };
  if (!showReadTime || !description || description.trim() === '') {
    return null;
  }
  return (
    <div
      className={`ReadTime ${classes.readTimeTextContainer} ${handleExtraProps(
        className
      )}`}
    >
      <span className={classes.readTimeText}>
        {getReadTime(description)}
        {getReadTime(description) > 1 ? ' mins' : ' min'} read
      </span>
    </div>
  );
};

export default ReadTime;
