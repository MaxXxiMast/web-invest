const cartPositions = [
  {
    bottom: -25,
    zIndex: 4,
    transform: 'scale(1)',
    opacity: 0,
    containerOpacity: 0,
  },
  {
    bottom: 0,
    zIndex: 3,
    transform: 'scale(1)',
    opacity: 1,
    containerOpacity: 1,
  },
  {
    bottom: 35,
    zIndex: 2,
    transform: 'scale(0.8)',
    opacity: 1,
    containerOpacity: 1,
  },
  {
    bottom: 60,
    zIndex: 1,
    transform: 'scale(0.6)',
    opacity: 0.5,
    containerOpacity: 1,
  },
];

export const getCartPosition = (index: number) => {
  if (index > 3 || index < 0)
    return {
      bottom: 80,
      zIndex: 1,
      transform: 'scale(0.4)',
      opacity: 0,
      containerOpacity: 0,
    };
  return cartPositions[index];
};
