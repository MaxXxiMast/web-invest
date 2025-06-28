export const defaultData = {
  header: "Oops, You're watering somewhere else :(",
  subHeader: "We can't find the page you’re looking for",
  button: {
    id: 100,
    label: 'View Opportunities',
    subLabel: null,
    accessibilityLabel: null,
    type: 'primary',
    clickUrl: '/assets',
  },
  image: {
    id: 160,
    altText: '404',
    dekstopUrl: 'commons/NoFoundPage.svg',
  },
  homeButton: {
    id: 101,
    label: 'Back to home',
    subLabel: null,
    accessibilityLabel: null,
    type: 'secondary',
    clickUrl: '/',
  },
};

export type NoFoundPage = Partial<{
  header?: string;
  subHeader?: string;
  button: Partial<{
    id: number;
    label: string;
    subLabel: string;
    accessibilityLabel: string;
    type: string;
    clickUrl: string;
  }>;
  image: Partial<{
    id: number;
    altText: string;
    desktopUrl: any;
    mobileUrl: any;
  }>;
  homeButton: Partial<{
    id: number;
    label: string;
    subLabel: string;
    accessibilityLabel: string;
    type: string;
    clickUrl: string;
  }>;
  seo: any;
}>;
