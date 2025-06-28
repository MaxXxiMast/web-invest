/*
 * Created by abm on 16/02/2020
 */

import React from 'react';

/*
 * This is an image component
 * For any css, just pass css={{}} to the element for inline styles
 */

// const Image = styled('img')({}, props => ({
//   ...props.css,
//   props
// }));
const Image = (props) => {
  return <img alt="dummy" loading="lazy" {...props} />;
};
export default Image;
