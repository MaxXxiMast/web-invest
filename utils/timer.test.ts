import {
  getTimeInFormat,
  UPI_PAYMENT_DURATION,
  delay,
  debounce,
} from './timer';

const updateNumberInTimer = (num: number) => {
  const roundedNum = Math.round(num);
  return `${roundedNum <= 9 ? '0' : ''}${roundedNum}`;
};

describe('updateNumberInTimer', () => {
  test('adds leading zero for numbers < 10', () => {
    expect(updateNumberInTimer(5)).toBe('05');
    expect(updateNumberInTimer(0)).toBe('00');
  });

  test('returns number as string without leading zero for >= 10', () => {
    expect(updateNumberInTimer(12)).toBe('12');
    expect(updateNumberInTimer(9.6)).toBe('10');
  });
});

describe('getTimeInFormat', () => {
  test('converts seconds into mm:ss mins format', () => {
    expect(getTimeInFormat(65)).toBe('01:05 mins');
    expect(getTimeInFormat(125)).toBe('02:05 mins');
  });

  test('handles zero seconds correctly', () => {
    expect(getTimeInFormat(0)).toBe('00:00 mins');
  });
});

describe('UPI_PAYMENT_DURATION', () => {
  test('should be 300 seconds', () => {
    expect(UPI_PAYMENT_DURATION).toBe(300);
  });
});

describe('delay', () => {
  test('resolves after specified time', async () => {
    jest.useFakeTimers();
    const spy = jest.fn();
    delay(100).then(spy);
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    expect(spy).toHaveBeenCalled();
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  test('debounces function calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  test('debounce uses default timeout when ms is not provided', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const debounced = debounce(fn);

    debounced('x');
    jest.advanceTimersByTime(0);

    expect(fn).toHaveBeenCalledWith('x');

    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});
