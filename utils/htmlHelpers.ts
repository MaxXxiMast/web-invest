export const handleElementFocus = (
  element: any,
  callback?: () => void,
  callBackTimer = 100
) => {
  const ele = document.querySelector(element);
  if (ele) {
    setTimeout(() => {
      ele.focus();
      if (callback) {
        callback();
      }
    }, callBackTimer);
  }
};
