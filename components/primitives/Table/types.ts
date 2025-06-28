export type TableHeader = {
  key: string;
  label: React.ReactNode;
  customRow?: (value: unknown) => React.ReactNode;
  formatter?: (value: unknown, ...args: any[]) => string;
  style?: React.CSSProperties;
  showTooltip?: boolean;
};

export type TableProps = {
  headers: TableHeader[];
  rows: Record<string, unknown>[];
  className?: string;
};
