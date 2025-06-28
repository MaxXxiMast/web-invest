// NODE MODULES
import { memo } from 'react';
import { Tooltip } from '@mui/material';

// TYPES
import { TableProps } from './types';

// Utils
import { handleExtraProps } from '../../../utils/string';

// STYLES
import styles from './Table.module.css';

export default function Table({ headers, rows: data, className }: TableProps) {
  const tableHeaders = headers.map((header) => (
    <th key={header.key} style={header?.style}>
      {header.label}
    </th>
  ));

  const DataValue = memo(function DataValue({ header, item, key }: any) {
    let value = item?.[header?.key] ?? '';
    const isFormatter = typeof header?.formatter === 'function';

    if (isFormatter) {
      value = header?.formatter(value);
    }

    if (header?.showTooltip) {
      return (
        <td key={key} className={`TextStyle1 ${styles.ReturnTxt}`}>
          <Tooltip title={item?.[header?.key]}>
            {header?.customRow?.(item) ?? (value || '-')}
          </Tooltip>
        </td>
      );
    }
    return (
      <td key={key} className={`TextStyle1 ${styles.ReturnTxt}`}>
        {header?.customRow?.(item) ?? (value || '-')}
      </td>
    );
  });

  const renderData = (item: any) => {
    return headers.map((header) => (
      <DataValue header={header} item={item} key={header.key} />
    ));
  };

  const ThingRow = memo(function ThingRow({ item, key }: any) {
    return (
      <tr className={styles.TableRow} key={key}>
        {renderData(item)}
      </tr>
    );
  });

  return (
    <>
      <table
        className={`CustomTable ${handleExtraProps(className)}`}
        data-testid="table"
      >
        <thead>
          <tr>{tableHeaders}</tr>
        </thead>
        <tbody>
          {data.map((item: any, index: number) => {
            return (
              <ThingRow item={item} index={index} key={`tableRow_${item}`} />
            );
          })}
        </tbody>
      </table>
    </>
  );
}
