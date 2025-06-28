import React from 'react';

type Props = {
  size?: string;
  onClick?: any;
};

const CloseIcon = ({ size = '28', onClick = () => {} }: Props) => {
  return (
    <svg
      width={size}
      height={size}
      onClick={() => onClick()}
      viewBox="0 0 29 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.00195312" width={size} height={size} rx="14" fill="#282C3F" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.8507 10.3635L17.6385 9.15132L14.002 12.7879L10.3654 9.15132L9.15322 10.3635L12.7898 14.0001L9.15322 17.6366L10.3654 18.8488L14.002 15.2122L17.6385 18.8488L18.8507 17.6366L15.2141 14.0001L18.8507 10.3635Z"
        fill="white"
      />
    </svg>
  );
};

export default CloseIcon;
