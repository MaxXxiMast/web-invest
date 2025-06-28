import { ButtonType } from '../../primitives/Button';

export const wealthDetails = {
  wealthManagerDetails: [
    {
      id: 'emailId',
      label: 'Email',
    },
    {
      id: 'mobileNo',
      label: 'Phone',
    },
  ],
  wealthNoteText:
    'Your Wealth Manager will be available on WhatsApp chat between 9:30AM and 7:30PM on Every Monday to Friday.',
  wealthButtons: [
    {
      id: 'whatsapp',
      title: 'Chat with us',
      icon: 'commons/Chat.svg',
      variant: ButtonType.Primary,
    },
    {
      id: 'calendly',
      title: 'Schedule a Call',
      variant: ButtonType.Secondary,
    },
  ],
};
