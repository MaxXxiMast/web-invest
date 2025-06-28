import React from 'react';

type Props = {
  size?: string;
  width?: string;
  height?: string;
  className?: string;
  strokeWidth?: number;
};

const CloseLineIcon = ({
  size = '28',
  width = '12',
  height = '12',
  className,
  strokeWidth = 1,
}: Props) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      style={{ color: className ? 'inherit' : '#282C3F' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_3745_107536"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="12"
        height="12"
      >
        <rect
          y="12"
          width="12"
          height="12"
          transform="rotate(-90 0 12)"
          fill="#C4C4C4"
        />
      </mask>
      <g mask="url(#mask0_3745_107536)">
        <path
          d="M11 1L1 11"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1 1L11 11"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default CloseLineIcon;
