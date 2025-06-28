export type AmountBreakdown = {
  label: string;
  id: string;
  tooltip: string;
  modalLinkLabel?: string;
  modalTitle?: string;
  modalContent?: string;
  strapiText?: string;
  isHTML?: boolean;
  decimals: number;
  value?: string;
  isRound?: boolean;
  isShowTooltip?: boolean;
};

export type DataProps = {
  label: string;
  value: string | number;
  tooltipData?: string;
};

export type BreakdownComponentData = {
  label: string;
  tooltipText: string;
  uiValue: string;
  breakDownData: AmountBreakdown[];
  numValue: number;
};

export type CalculateData = {
  uniValue: string;
  hideHeaderData?: boolean;
  headerData?: DataProps;
  preTaxReturnsBreakdown: BreakdownComponentData;
  payableAmountBreakdown: BreakdownComponentData;
};
