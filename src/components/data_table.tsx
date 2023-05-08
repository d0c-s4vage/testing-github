import React from 'react';

import styles from './data_table.module.css'

// ----------------------------------------------------------------------------
// PROPS

export type HeaderSpec<TDataType> =  {
  display: React.ReactNode;
  value: (rowData: TDataType) => React.ReactNode;
  width?: number;
  center?: boolean;
  ellipsis?: boolean;
};

type DataTableRowProps<TDataType> = {
  headers: HeaderSpec<TDataType>[];
  data: TDataType;
};

type DataTableProps<TDataType> = {
  headers: HeaderSpec<TDataType>[];
  keyFn: (val: TDataType) => string;
  data?: TDataType[];
};

// ----------------------------------------------------------------------------
// COMPONENTS

function DataTableRow<TDataType>({headers, data}: DataTableRowProps<TDataType>): React.ReactElement {
  return <tr className={styles.row}>
    {headers.map((col, idx) => (
      <td
        key={idx}
        className={[
          styles.field,
          (col.ellipsis ? styles.ellipsis : ""),
          (col.center ? "centered" : ""),
        ].join(" ")}
      >
        {col.value(data)}
      </td>
    ))}
  </tr>;
}

export default function DataTable<TDataType>({headers, data, keyFn}: DataTableProps<TDataType>): React.ReactElement {
  return (<>
    <table className={styles.table}>
      <thead className={styles.header}>
        <tr>
        {headers.map((header, idx) =>
          <th
            key={idx}
            style={{width: header.width}}
            className={[
              styles.header,
              header.center ? "centered" : "",
            ].join(" ")}
          >
            {header.display}
          </th>
        )}
        </tr>
      </thead>

      <tbody className={styles.body}>
        {data?.map((item) => <DataTableRow<TDataType> key={keyFn(item)} headers={headers} data={item}/>)}
      </tbody>

      <tfoot className={styles.footer}>
      </tfoot>
    </table>
  </>);
}
