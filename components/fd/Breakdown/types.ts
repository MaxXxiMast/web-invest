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
  value?: string | number;
  isRound?: boolean;
};

type DataProps = {
  label: string;
  value: string | number;
  tooltipData?: string;
};

type BreakdownComponentData = {
  label: string;
  tooltipText: string;
  uiValue: string;
  breakDownData: AmountBreakdown[];
};

type CalculateData = {
  chipArr: number[];
  uniValue: string;
  hideHeaderData?: boolean;
  headerData?: DataProps;
  preTaxReturnsBreakdown: BreakdownComponentData;
  payableAmountBreakdown: BreakdownComponentData;
};
