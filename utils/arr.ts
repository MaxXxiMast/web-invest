export const mapOrder = (arr: any[] = [], order: any[] = []) => {
  if (!arr.length) {
    return [];
  }
  const orderMap = {};
  order.forEach((key, index) => {
    orderMap[key] = index;
  });

  return arr.slice().sort((a, b) => orderMap[a] - orderMap[b]);
};

export const removeDuplicateFromArray = (arr: any[] = []) => {
  return Array.from(new Set(arr));
};
