import { useRef } from 'react';
import { useElapsedTime } from './useElapsedTime';

type ColorHex = `#${string}`;
type ColorRGBA = `rgba(${string})`;
type ColorURL = `url(#${string})`;
type ColorRGB = `rgb(${string})`;
type ColorFormat = ColorHex | ColorRGB | ColorRGBA | ColorURL;

type OnComplete = {
  /** Indicates if the loop should start over. Default: false */
  shouldRepeat?: boolean;
  /** Delay in seconds before looping again. Default: 0 */
  delay?: number;
  /** Set new initial remaining when starting over the animation */
  newInitialRemainingTime?: number;
};

type TimeProps = {
  remainingTime: number;
  elapsedTime: number;
  color: ColorFormat;
};

export type CountdownProps = {
  /** Countdown duration in seconds */
  duration: number;
  /** Set the initial remaining time if it is different than the duration */
  initialRemainingTime?: number;
  /** Update interval in seconds. Determines how often the timer updates. When set to 0 the value will update on each key frame. Default: 0 */
  updateInterval?: number;
  /** Width and height of the SVG element. Default: 180 */
  size?: number;
  /** Path stroke width. Default: 12 */
  strokeWidth?: number;
  /** Trail stroke width */
  trailStrokeWidth?: number;
  /** Path stroke line cap. Default: "round" */
  strokeLinecap?: 'round' | 'square' | 'butt';
  /** Progress path rotation direction. Default: "clockwise" */
  rotation?: 'clockwise' | 'counterclockwise';
  /** Circle trail color - takes any valid color format (HEX, rgb, rgba, etc.). Default: #d9d9d9 */
  trailColor?: ColorFormat;
  /** Play or pause animation. Default: false */
  isPlaying?: boolean;
  /** Indicates if the colors should smoothly transition to the next color. Default: true */
  isSmoothColorTransition?: boolean;
  /** Indicates if the progress path should be growing instead of shrinking. Default: false */
  isGrowing?: boolean;
  /** On animation complete event handler */
  onComplete?: (totalElapsedTime: number) => OnComplete;
  /** On remaining time update event handler */
  onUpdate?: (remainingTime: number) => void;
  /** color or url to a gradient */
  color: ColorFormat;
  /** Render function to customize the time/content in the center of the circle */
  children?: (props: TimeProps) => React.ReactNode;
};

export const getPathProps = (
  size: number,
  strokeWidth: number,
  rotation: 'clockwise' | 'counterclockwise'
) => {
  const halfSize = size / 2;
  const halfStrokeWith = strokeWidth / 2;
  const arcRadius = halfSize - halfStrokeWith;
  const arcDiameter = 2 * arcRadius;
  const rotationIndicator = rotation === 'clockwise' ? '1,0' : '0,1';

  const pathLength = 2 * Math.PI * arcRadius;
  const path = `m ${halfSize},${halfStrokeWith} a ${arcRadius},${arcRadius} 0 ${rotationIndicator} 0,${arcDiameter} a ${arcRadius},${arcRadius} 0 ${rotationIndicator} 0,-${arcDiameter}`;

  return { path, pathLength };
};

const getStartAt = (duration: number, initialRemainingTime?: number) => {
  if (duration === 0 || duration === initialRemainingTime) {
    return 0;
  }

  return typeof initialRemainingTime === 'number'
    ? duration - initialRemainingTime
    : 0;
};

const linearEase = (
  time: number,
  start: number,
  goal: number,
  duration: number,
  isGrowing: boolean
) => {
  if (duration === 0) {
    return start;
  }

  const currentTime = (isGrowing ? duration - time : time) / duration;
  return start + goal * currentTime;
};

export const useCountdown = (props: CountdownProps) => {
  const {
    duration,
    initialRemainingTime,
    updateInterval,
    size = 180,
    strokeWidth = 12,
    trailStrokeWidth,
    isPlaying = false,
    isGrowing = false,
    rotation = 'clockwise',
    onComplete,
    onUpdate,
  } = props;
  const remainingTimeRef = useRef<number>();
  const maxStrokeWidth = Math.max(strokeWidth, trailStrokeWidth ?? 0);
  const { path, pathLength } = getPathProps(size, maxStrokeWidth, rotation);

  const { elapsedTime } = useElapsedTime({
    isPlaying,
    duration,
    startAt: getStartAt(duration, initialRemainingTime),
    updateInterval,
    onUpdate:
      typeof onUpdate === 'function'
        ? (elapsedTime: number) => {
            const remainingTime = Math.ceil(duration - elapsedTime);
            if (remainingTime !== remainingTimeRef.current) {
              remainingTimeRef.current = remainingTime;
              onUpdate(remainingTime);
            }
          }
        : undefined,
    onComplete:
      typeof onComplete === 'function'
        ? (totalElapsedTime: number) => {
            const { shouldRepeat, delay, newInitialRemainingTime } =
              onComplete(totalElapsedTime) ?? {};
            if (shouldRepeat) {
              return {
                shouldRepeat,
                delay,
                newStartAt: getStartAt(duration, newInitialRemainingTime),
              };
            }
          }
        : undefined,
  });

  const remainingTimeRow = duration - elapsedTime;

  return {
    elapsedTime,
    path,
    pathLength,
    remainingTime: Math.ceil(remainingTimeRow),
    rotation,
    size,
    stroke: props.color,
    strokeDashoffset: linearEase(
      elapsedTime,
      0,
      pathLength,
      duration,
      isGrowing
    ),
    strokeWidth,
  };
};
