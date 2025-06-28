// NODE MODULES
import dayjs from 'dayjs';
import { Tooltip } from '@mui/material';

// Components
import ReturnsAccordian from '../ReturnsAccordian';
import ReturnsTableAsset from '../ReturnsTableAsset';
import TablePagination from '../../../primitives/TablePagination';

// Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

// Types
import type { ReturnsData } from '../ReturnsTable/types';

// Utils
import { handleStringLimit } from '../../../../utils/string';
import { ROWS_PER_PAGE } from '../ReturnsTable/constants';

// Styles
import styles from './ReturnsTableMobile.module.css';

type ReturnsTableMobileProps = {
  onPageChange: (pageNo: number) => void;
  pageNo: number;
  isShowRemark?: boolean;
  selectedType?: string;
};

export default function ReturnsTableMobile({
  isShowRemark = false,
  onPageChange,
  pageNo = 1,
  selectedType,
}: ReturnsTableMobileProps) {
  const {
    returns: { data },
    selectedAssetType,
  } = useAppSelector((state) => state.portfolioSummary);

  const totalCount = data?.length || 0;

  const renderRemarkForReturns = (remark: string) => {
    if (!remark || !isShowRemark) return null;

    return (
      <div className={styles.RemarkContainer}>
        <span>Remark: </span>
        {remark}
      </div>
    );
  };

  const renderAssetCell = (value1 = '', value2 = '') => {
    return (
      <div className={`flex-column items-end ${styles.AssetCell}`}>
        <span>{value1}</span>
        <span>{value2}</span>
      </div>
    );
  };

  const renderReturnsNumber = (value: any) => {
    const date = dayjs(value?.dateOfReturn).format('MMM DD YYYY');

    if (selectedAssetType === 'High Yield FDs') {
      return date;
    }

    return `${date} •${' '} ${`Return ${value?.noOfReturn}/${value?.noOftotalReturns}`}`;
  };

  const renderDealID = (value: any) => {
    if (selectedAssetType === 'Bonds, SDIs & Baskets') {
      return value?.isinNumber
        ? handleStringLimit(`Security: ${value?.assetDesc}`, 25)
        : null;
    }

    const label =
      selectedAssetType === 'High Yield FDs' ? 'Deal Code' : 'Deal ID';

    return handleStringLimit(`${label}: ` + value?.assetName, 25);
  };

  const renderLLPName = (value: any) => {
    if (selectedAssetType === 'High Yield FDs') return '';

    if (selectedAssetType === 'Bonds, SDIs & Baskets') {
      return value?.assetDesc
        ? handleStringLimit(`ISIN: ` + value?.isinNumber, 25)
        : null;
    }

    const llpLabel =
      selectedAssetType === 'LLPs & CRE' ? 'LLP name' : 'Trust/LLP Name';
    return `${llpLabel}: ${handleStringLimit(value?.llpName, 14)}`;
  };

  const returnsCell = (value: ReturnsData) => {
    return (
      <div className={styles.ReturnsCell}>
        <div className="flex justify-between items-center">
          <ReturnsTableAsset item={value} />
          <Tooltip
            classes={{
              tooltip: styles.popperTooltip,
            }}
            title={`${value?.assetName} • ${value?.llpName}`}
            placement="bottom-start"
          >
            {renderAssetCell(renderDealID(value), renderLLPName(value))}
          </Tooltip>
        </div>
        <div className="flex justify-between items-center">
          {renderAssetCell(renderReturnsNumber(value))}
          <ReturnsAccordian
            returnsSplit={value?.returnsSplit ?? {}}
            totalAmount={value?.amount ?? 0}
            tdsAmount={
              ['upcoming', 'arrears'].includes(selectedType) &&
              selectedAssetType === 'Bonds, SDIs & Baskets'
                ? 0
                : value?.tdsAmount ?? 0
            }
          />
        </div>
        {renderRemarkForReturns(value?.comments)}
      </div>
    );
  };

  return (
    <>
      <div className={styles.ReturnsContainer}>
        {data
          .slice((pageNo - 1) * ROWS_PER_PAGE, pageNo * ROWS_PER_PAGE)
          .map((item) => returnsCell(item))}
      </div>
      <TablePagination
        totalCount={totalCount}
        onPageChange={onPageChange}
        rowsPerPage={ROWS_PER_PAGE}
        className={styles.PaginationContainer}
        page={pageNo}
        siblingCount={0}
      />
    </>
  );
}
