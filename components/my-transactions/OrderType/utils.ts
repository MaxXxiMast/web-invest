export const getStatus = (status: string, type: string) => {
  if (type === 'SELL' && status === 'pending') {
    return 'Processing';
  }
  if (type === 'BUY' && status === 'initiated') {
    return 'Settlement Pending';
  }
  return 'Payment ' + status;
};
