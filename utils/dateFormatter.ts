import dayjs from 'dayjs';

export const formatDateYearTime = 'DD MMM YYYY, hh:mm A';
export const formatDateTime = 'DD MMM, hh:mm A';
export const formatDateMonth = 'DD MMM';
export const formatDate = 'DD MMM YYYY';
export const ymdFormat = 'YYYY-MM-DD';

type Props = {
  dateTime: string;
  timeZoneEnable?: boolean;
  dateFormat?: string;
};

export const dateFormatter = ({
  dateTime,
  timeZoneEnable = false,
  dateFormat = formatDateTime,
}: Props) => {
  if (timeZoneEnable) {
    return dayjs(dateTime).tz('Asia/Kolkata').format(dateFormat) ?? '-';
  }
  return dayjs(dateTime).format(dateFormat) ?? '-';
};

export const isToday = (date: string) => {
  const dayFormat = 'DD-MM-YYYY';
  const todayDate = dayjs().tz('Asia/Kolkata').format(dayFormat);
  return todayDate === dayjs(date).tz('Asia/Kolkata').format(dayFormat);
};
