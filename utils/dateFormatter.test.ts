import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import {
  dateFormatter,
  isToday,
  formatDateTime,
  formatDate,
} from './dateFormatter';

dayjs.extend(utc);
dayjs.extend(timezone);

const sampleDate = '2024-06-16T10:30:00Z';

describe('dateFormatter', () => {
  test('formats date with timezone (Asia/Kolkata)', () => {
    const result = dateFormatter({
      dateTime: sampleDate,
      timeZoneEnable: true,
    });
    const expected = dayjs(sampleDate)
      .tz('Asia/Kolkata')
      .format(formatDateTime);
    expect(result).toBe(expected);
  });

  test('formats with custom format', () => {
    const result = dateFormatter({
      dateTime: sampleDate,
      dateFormat: formatDate,
    });
    const expected = dayjs(sampleDate).format(formatDate);
    expect(result).toBe(expected);
  });

  test('returns "Invalid Date" for empty date string', () => {
    const result = dateFormatter({ dateTime: '' });
    expect(result).toBe('Invalid Date');
  });
});

describe('isToday', () => {
  test('returns false for a past date', () => {
    const past = dayjs()
      .subtract(3, 'days')
      .tz('Asia/Kolkata')
      .format('YYYY-MM-DD');
    expect(isToday(past)).toBe(false);
  });
});
