import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../../utils/string';
import Image from '../../../primitives/Image';
import classes from './Note.module.css';

type Props = {
  text: string;
  iconName: string;
  className: string;
  isSetDangerously?: boolean;
};
const Note = ({
  text = '',
  iconName = 'icons/info.svg',
  className = '',
  isSetDangerously = false,
}: Partial<Props>) => {
  if (!text || text.trim() === '') {
    return null;
  }
  return (
    <div className={`${classes.Note} ${handleExtraProps(className)}`}>
      {iconName ? (
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}${iconName}`}
          alt="info"
          width={11}
          height={11}
          layout="fixed"
        />
      ) : null}{' '}
      {isSetDangerously ? (
        <div
          dangerouslySetInnerHTML={{
            __html: text,
          }}
        />
      ) : (
        text
      )}
    </div>
  );
};

export default Note;
