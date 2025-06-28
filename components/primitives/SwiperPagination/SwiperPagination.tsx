import { handleExtraProps } from '../../../utils/string';
import classes from './SwiperPagination.module.css';

type Props = {
  paginationId: string;
  className?: string;
};

const SwiperPagination = ({ paginationId = '', className = '' }: Props) => {
  return (
    <div
      className={`${classes.Pagination} ${handleExtraProps(
        className
      )} SwiperPagination`}
      id={handleExtraProps(paginationId)}
    ></div>
  );
};

export default SwiperPagination;
