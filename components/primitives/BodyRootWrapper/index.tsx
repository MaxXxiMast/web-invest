import ReactDOM from 'react-dom';

/**
 * Append children at body root
 * @param props Children props
 * @returns
 */
const BodyRootWrapper = (props: any) => {
  const modalRoot = document.querySelector('body');

  return ReactDOM.createPortal(props.children, modalRoot);
};

export default BodyRootWrapper;
