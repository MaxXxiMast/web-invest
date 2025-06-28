import NextImage, { StaticImageData } from 'next/legacy/image';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

export type SafeNumber = number | `${number}`;

type ImageProps = {
  src: string | StaticImageData;
  alternativeText?: string;
  alt?: string;
  width?: SafeNumber;
  height?: SafeNumber;
  layout?: 'responsive' | 'intrinsic' | 'fill' | 'fixed';
  className?: string;
  sizes?: string;
  unoptimized?: boolean;
  title?: string;
  onClick?: () => any;
  objectPosition?: string;
  onError?: () => void;
  style?: React.CSSProperties;
};

const Image = ({
  src,
  alternativeText,
  alt,
  width = 100,
  height = 100,
  layout = 'responsive',
  className,
  sizes,
  unoptimized = false,
  title = '',
  onClick = () => null,
  objectPosition,
  onError,
  style = {},
}: ImageProps) => {
  return (
    <NextImage
      onClick={onClick}
      className={className}
      layout={layout}
      width={width}
      height={height}
      objectFit="contain"
      src={src || `${GRIP_INVEST_BUCKET_URL}commons/placeHolder.png`}
      alt={alternativeText || alt || ''}
      loading="lazy"
      sizes={sizes}
      title={title}
      unoptimized={unoptimized}
      objectPosition={objectPosition}
      onError={onError}
      style={style}
    />
  );
};

export default Image;
