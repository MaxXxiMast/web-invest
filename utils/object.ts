export function customSortAssets(
  arr: any[] = [],
  orderArr: number[] = [],
  key = ''
) {
  // Added temp array for not passing the array reference
  const tempArr = [...arr];

  // Create a dictionary to store the order of elements in orderArr
  const orderDict = {};
  orderArr.forEach((value, index) => {
    orderDict[value] = index;
  });

  // Filter and sort the elements that exist in both arrays
  const sortedArr = tempArr.filter((item) =>
    orderDict.hasOwnProperty(item?.[key])
  );
  sortedArr.sort((a, b) => orderDict[a?.[key]] - orderDict[b?.[key]]);

  // Return the sorted elements to first and removing sorted from array and adding to the end
  return [
    ...sortedArr,
    ...tempArr.filter((value) => !orderArr.includes(value?.[key])),
  ];
}

export const isEmpty = (obj) =>
  [Object, Array].includes((obj || {}).constructor) &&
  !Object.entries(obj || {}).length;
