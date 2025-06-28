import { css } from '@emotion/css';
import hashReduce from 'lodash/reduce';

export const getClassNames = (styles = {}) => {
  return css({
    '&&': { ...styles },
  });
};

export const getObjectClassNames = (styles = {}) =>
  hashReduce(
    styles,
    (reducedStyles, style, key) => {
      reducedStyles[key] = getClassNames(style);
      return reducedStyles;
    },
    {}
  );

export const getColor = (color, shade = 'DEFAULT') => {
  if (typeof color === 'object') {
    return color[shade];
  }
  return color;
};
