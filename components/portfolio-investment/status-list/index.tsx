import { StatusListArr } from '../../../utils/portfolio';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import Image from '../../primitives/Image';
import classes from './StatusList.module.css';

type Props = {
  className?: string;
  dataArr?: StatusListArr[];
};

const iconStyles = {
  amo: {
    color: 'var(--gripPrimaryGreen, #00b8b7)',
    fontSize: 20,
  },
  completed: {
    color: 'var(--gripPrimaryGreen, #00b8b7)',
    fontSize: 20,
  },
  pending: {
    color: 'var(--gripYellowOrange, #fcac46)',
    fontSize: 20,
  },
};

const iconMap = {
  isAmo: <span style={iconStyles.amo} className="icon-amo-icon" />,
  completed: (
    <span style={iconStyles.completed} className="icon-check-circle" />
  ),
  pending: <span style={iconStyles.pending} className="icon-danger-triangle" />,
  initiated: (
    <Image
      src={`${GRIP_INVEST_BUCKET_URL}icons/PendingStatus.svg`}
      width={20}
      height={20}
      layout="fixed"
      alt="icon"
    />
  ),
};
const renderIcon = (status: string) => iconMap[status] || null;

/**
 * Return status list component
 * @param dataArr List of data with status
 * @param className Component extra class name
 * @returns
 */
const StatusList = ({ className = '', dataArr = [] }: Props) => {
  return (
    <div className={`${classes.List} ${handleExtraProps(className)}`}>
      <ul className="flex">
        {dataArr.map((ele) => {
          return (
            <li key={`${ele?.date}__${ele?.name}__${Date.now()}`}>
              <div className={`flex ${classes.Status}`}>
                <div
                  className={`${classes.StepIcon} ${
                    ele?.status === '' ? classes.Blank : ''
                  }`}
                >
                  {renderIcon(ele?.status)}
                </div>
                <div className={`flex-column ${classes.Content}`}>
                  <div className={`flex items-center ${classes.NameSepator}`}>
                    <span
                      className={`${
                        ele?.status === '' ? classes.NoStatusTxt : ''
                      }`}
                    >
                      {ele?.name}
                    </span>
                    <span className={classes.Separator} />
                  </div>
                  <label>
                    {ele?.status === 'completed' && ele?.name === 'Payment'
                      ? 'Received'
                      : ele?.status === 'pending'
                      ? 'Pending'
                      : ele?.status === 'initiated'
                      ? 'Processing'
                      : ele?.date}
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StatusList;
