import React from 'react';

type Props = {
  size?: string;
};

const PlusGreyRounded = ({ size = '28' }: Props) => {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} rx="14" fill="#FAFAFC" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.8571 8H13.1429V13.1429H8V14.8571H13.1429V20H14.8571V14.8571H20V13.1429H14.8571V8Z"
        fill="#282C3F"
      />
    </svg>
  );
};

export default PlusGreyRounded;
