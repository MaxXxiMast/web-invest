import get from 'lodash/get';

// Components
import GripLoading from '../../layout/Loading';
import RupeesIcon from '../../assets/static/assetList/RupeesIcon.svg';

// Types
import type { TableHeader, VisualiseTableData } from './types';

// Utils
import {
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';

// Styles
import styles from './VisualiseTable.module.css';

type Props = {
  showSchedule: boolean;
  data: VisualiseTableData;
  loading?: boolean;
  className?: string;
  handleCloseModal?: () => void;
  handleBackEvent?: () => void;
  returnSchedule?: any;
};

const VisualiseTable = ({
  showSchedule,
  data,
  className = '',
  handleCloseModal = () => {},
  handleBackEvent = () => {},
  loading = false,
}: Props) => {
  const getDataValue = (
    header: TableHeader,
    item: Record<string, unknown>,
    index: number
  ) => {
    let value = get(item, header?.key) ?? '';
    const isFormatter = typeof header?.formatter === 'function';

    if (isFormatter) {
      value = header?.formatter(value);
    }

    if (header?.key === '#') {
      value = index + 1;
    }

    return (
      <td key={`${header?.key}-data-value-${value}`}>
        {header?.customRow?.(item) ?? ((value || '-') as any)}
      </td>
    );
  };

  const getRows = () => {
    const finalRowsData = data?.rows || [];
    if (!Array.isArray(finalRowsData) || finalRowsData?.length === 0) {
      return null;
    }

    return finalRowsData?.map((item, index: number) => {
      return (
        <tr key={`value=${item}`}>
          {data?.headers?.map((header) => {
            return getDataValue(header, item, index);
          })}
        </tr>
      );
    });
  };

  if (loading) {
    return <GripLoading />;
  }

  return (
    <div className={`${handleExtraProps(className)}`}>
      <div>
        <div className={styles.Card}>
          <div className={styles.CardInner}>
            <div className={styles.CardHeader}>
              <div className={styles.CardHeaderLeft}>
                {!showSchedule && (
                  <span
                    className={styles.ArrowRight}
                    onClick={() => handleBackEvent()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}ArrowRight.svg`}
                      alt="ArrowRight"
                    />
                  </span>
                )}
                <span className={`${styles.ImageIcon}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={RupeesIcon.src} alt="RupeesIcon" />
                </span>
                <span className={styles.Label}>
                  {/* Header */}
                  {data.header}
                </span>
              </div>
            </div>
            <div className={styles.CardBody}>
              <table>
                <thead>
                  {/* headers */}
                  <tr>
                    {data?.headers?.map((header) => (
                      <th key={`${header.key}-${header.label}`}>
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* Rows */}
                <tbody>{getRows()}</tbody>
              </table>
            </div>
            <div className={styles.CardFooter}>
              <span onClick={() => handleCloseModal()}>Okay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualiseTable;
