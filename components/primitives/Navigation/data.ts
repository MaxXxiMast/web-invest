import {
  GRIP_INVEST_BUCKET_URL,
  GRIP_INVEST_GI_STRAPI_BUCKET_URL_WITHOUT_INNER,
} from '../../../utils/string';
import { LinkModel } from './NavigationModels';

export type CategoriesLinkType = {
  clickUrl?: string;
  title?: string;
  shortDescription?: string;
  openInNewTab?: boolean;
  isBgFilledIcon?: boolean;
  icon?: React.ReactNode;
  id: string;
  subLinks?: {
    title: string;
    clickUrl: string;
  }[];
};

export const categoryVideoData = {
  url: 'https://www.youtube.com/watch?v=5urouui77Ho',
  thumbnail: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL_WITHOUT_INNER}Bonds_Desktop_cf1f339d06.png`,
  duration: '2:09',
  title: 'All about Grip Alternative Investments',
};

export const LeftSideLinkArr = [
  'sdi',
  'bonds',
  'commercial-property',
  'startup-equity',
  'faqs',
];

export const RightSideLinkArr = ['baskets', 'fds'];

export const ProductCategoryLinkArr: CategoriesLinkType[] = [
  {
    clickUrl: '/product-detail/bonds',
    title: 'Corporate Bonds',
    shortDescription:
      'High-yielding corporate bonds earning secured and consistent return',
    openInNewTab: false,
    icon: `commons/prod-icon-bonds.svg`,
    id: 'bonds',
  },
  {
    title: 'Securitized Debt Instruments',
    shortDescription:
      'Earn fixed returns on investments backed by lease rentals, invoices, loans or bonds',
    openInNewTab: false,
    icon: `commons/prod-icon-leaseX.svg`,
    id: 'sdi',
    clickUrl: '/product-detail/leasex',
    subLinks: [
      {
        title: 'LeaseX',
        clickUrl: '/product-detail/leasex',
      },
      {
        title: 'InvoiceX',
        clickUrl: '/product-detail/invoicex',
      },
      {
        title: 'LoanX',
        clickUrl: '/product-detail/loanx',
      },
    ],
  },
  {
    clickUrl: '/product-detail/baskets',
    title: 'Baskets',
    shortDescription:
      'Theme based investing in a pool of bonds and SDIs with a single click',
    openInNewTab: false,
    icon: `commons/Basket.svg`,
    id: 'baskets',
  },
  {
    clickUrl: '/product-detail/high-yield-fds',
    title: "Corporate FD's",
    shortDescription:
      'Earn fixed-returns on corporate FDs from reputed Small Finance Banks and NBFCs',
    openInNewTab: false,
    icon: `commons/fd.svg`,
    id: 'fds',
  },
];

export const CategoriesLinkArr: CategoriesLinkType[] = [
  {
    clickUrl: '/product-detail/leaseX',
    title: 'Securitized Debt Instruments',
    shortDescription:
      'Investments backed by lease rentals, invoices, loans, or bonds through listed and rated instruments.',
    openInNewTab: false,
    icon: `commons/prod-icon-leaseX.svg`,
    id: 'leaseX',
  },
  {
    clickUrl: '/product-detail/bonds',
    title: 'Corporate Bonds',
    shortDescription: 'High-yielding corporate bonds earning secured return',
    openInNewTab: false,
    icon: `commons/prod-icon-bonds.svg`,
    id: 'bonds',
  },
  // {
  //   clickUrl: '/product-detail/commercial-property',
  //   title: 'Commercial Property',
  //   shortDescription:
  //     'Investments to own fractional share of pre-leased commercial property',
  //   openInNewTab: false,
  //   icon: `commons/prod-icon-commercial.svg`,
  //   id: 'commercial-property',
  // },
  // {
  //   clickUrl: '/product-detail/startup-equity',
  //   title: 'Startup Equity',
  //   shortDescription: 'Startup equity investments executed via registered AIFs',
  //   openInNewTab: false,
  //   icon: `commons/prod-icon-startup.svg`,
  //   id: 'startup-equity',
  // },
  {
    clickUrl: '/faq',
    title: 'FAQs',
    shortDescription: 'All your questions answered at one place',
    openInNewTab: false,
    isBgFilledIcon: true,
    icon: `commons/question-mark-filled.svg`,
    id: 'faqs',
  },
  {
    clickUrl: '/about-us',
    title: 'Company',
    shortDescription: 'Everything about Grip and people behind the scenes',
    openInNewTab: false,
    isBgFilledIcon: true,
    icon: `commons/upArrowGrey.svg`,
    id: 'about-us',
  },
  {
    clickUrl: '/transparency',
    title: 'Commitment to Transparency',
    shortDescription: 'Get to know about out stats and track record',
    openInNewTab: false,
    isBgFilledIcon: true,
    icon: `commons/eye-filled.svg`,
    id: 'transparency',
  },
];

export type BlogCategoryDataNav = CategoriesLinkType & {
  desktopVisibity?: boolean;
  mobileVisibity?: boolean;
  count?: number;
};

export const AllBlogCategory: BlogCategoryDataNav = {
  clickUrl: '/blog',
  title: 'All Blogs',
  shortDescription: '',
  openInNewTab: false,
  isBgFilledIcon: true,
  icon: `${GRIP_INVEST_BUCKET_URL}homev2/AllBlogs.svg`,
  id: 'blogs',
};

// Addition of Blogs in Navigation which will have children
export const NavigationBlogData = {
  id: 104,
  link: {
    id: 121,
    title: 'Blogs',
    accessibilityLabel: 'Blogs',
    clickUrl: '#',
    openInNewTab: false,
  },
  childrenLinks: [
    {
      id: 121,
      title: 'Grip Updates',
      accessibilityLabel: 'Grip Updates',
      clickUrl: '',
      openInNewTab: false,
    },
  ],
};

/**
 * Addition of Blogs just after the learn object
 * @param categories headers for the navigation
 * @returns array for navigation with blogs included in it
 */
export const addBlogsInNavigation = (categories: any) => {
  if (!(categories && categories.length)) {
    return categories;
  }
  /**
   * Using of destructuring, we are avoiding the variable pass by reference.
   * We are using splice which effects on the reference of the variable,
   * so by destructuring we are coping the content rather than passing a reference of original variable
   */
  const tempCategories = [...categories];
  let indexofLearn = tempCategories?.findIndex((category: LinkModel) =>
    category?.link?.title?.toLowerCase()?.includes('our products')
  );
  tempCategories?.splice(indexofLearn + 1 || 1, 0, NavigationBlogData);
  return tempCategories;
};
