type MediaType = {
  altText: string;
  desktopUrl: {
    data: {
      attributes: { url: string };
    };
  };
};

export type ModalContentType = {
  heading?: string;
  description: string;
  headerImage?: MediaType;
  descriptionImage?: MediaType;
  link?: {
    title: string;
    clickUrl?: string;
    openInNewTab?: boolean;
  };
};

export type DematCard = {
  title: string;
  icon?: MediaType;
  widthIcon?: number;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  isDesktopAccordian?: boolean;
  modalType: 'basic' | 'sequence' | 'multiple';
  modalTitle: string;
  subHeader?: string;
  subHeaderImg?: MediaType;
  modalContent: ModalContentType[];
  cardID: string;
};

export const initDematcardData: DematCard[] = [
  {
    title: 'Don’t have a Demat account?',
    cardID: 'NoDemat',
    isDesktopAccordian: true,
    modalTitle: 'Don’t have a Demat account?',
    modalContent: [
      {
        description: `Don't worry, we can help you open your Demat account. It's quick and simple!`,
        link: {
          title: 'Need Grip Assistance',
        },
      },
    ],
    modalType: 'basic',
  },
];
