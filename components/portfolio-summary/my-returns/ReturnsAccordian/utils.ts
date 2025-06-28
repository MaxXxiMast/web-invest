export const returnsSplitMapping = {
  interestAmount: { label: 'Interest', displayOrder: 2 },
  principalAmount: { label: 'Principal', displayOrder: 1 },
  // preTaxReturn: { label: '- TDS', displayOrder: 3 },
};

export const getReturnsSplitByDisplayOrder = (mapping: Record<string, any>) => {
  return Object.keys(mapping).sort((a, b) => {
    const firstOrder = returnsSplitMapping[a]?.displayOrder ?? 0;
    const secondOrder = returnsSplitMapping[b]?.displayOrder ?? 0;
    return firstOrder - secondOrder;
  });
};
