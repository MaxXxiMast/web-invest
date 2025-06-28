import { isEmpty } from './object';

export const hasSpvCategoryBank = (categoryDetails: any) => {
  return !isEmpty(categoryDetails?.spvCategoryBank || {});
};
