export const scrollIntoViewByScrollId = (id: string, property: {}) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView(property);
  }
};

export const setActiveClass = (
  element: Element,
  isActive: boolean,
  className = 'active'
) => {
  element?.classList?.toggle(className, isActive);
};
