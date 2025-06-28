export interface ActionMenuOption {
  id: number;
  name: string;
  lockInDate?: string;
}

export const actionMenuOptions: ActionMenuOption[] = [
  {
    id: 1,
    name: 'Sell Units',
  },
  {
    id: 2,
    name: 'Transaction and Returns',
  },
  {
    id: 4,
    name: 'More Info',
  },
];

export const formatDateToReadable = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    const formattedDate = date.toLocaleDateString('en-GB', options);
    const [day, month, year] = formattedDate.split(' ');
    return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  } catch (error) {
    return dateString;
  }
};
