export type TableHeader = {
  key: string;
  label: string;
  formatter?: (value: unknown, ...args: any[]) => string;
  customRow?: (value: unknown) => React.ReactNode;
};

export type VisualiseTableData = {
  header: string;
  headers: TableHeader[];
  rows: Record<string, unknown>[];
};
