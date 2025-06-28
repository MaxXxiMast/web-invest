export type BannerData = {
  heading: string;
  message: string;
};

type FnProps = {
  pageName: 'discover' | 'portfolio';
  isInvestedUser: boolean;
  subPage?: 'summary' | 'myInvestments';
  isAnyPendingOrder?: boolean;
  isKycUnderVerification?: boolean;
};

export const bannerData = ({
  pageName,
  isInvestedUser,
  subPage = 'summary',
  isAnyPendingOrder = false,
  isKycUnderVerification = false,
}: FnProps): BannerData => {
  const discoverBanner = () => {
    if (isKycUnderVerification) {
      return {
        heading: 'KYC in verification?',
        message:
          'Turn on notifications to know as soon as your account is ready for investing',
      };
    }

    if (isInvestedUser) {
      return {
        heading: 'Stay Informed',
        message:
          'Get monthly returns updates about your investments by turning on notifications',
      };
    }

    return {
      heading: 'New deals are waiting!',
      message:
        'Enable notifications to be the first to know about investment opportunities',
    };
  };

  const portfolioBanner = () => {
    if (isInvestedUser) {
      if (subPage === 'summary') {
        return {
          heading: 'Stay updated on your Portfolio performance',
          message:
            'Turn on notifications to receive monthly returns updates and new deals',
        };
      }

      return {
        heading: `Don't miss out on new deals!`,
        message:
          'Enable notifications to stay in the loop on investment opportunities',
      };
    }

    if (subPage === 'myInvestments' && isAnyPendingOrder) {
      return {
        heading: `Your order is pending!`,
        message:
          'Turn on notifications to receive timely updates on its status',
      };
    }
    return {
      heading: `Don't miss out on new deals!`,
      message:
        'Enable notifications to stay in the loop on investment opportunities',
    };
  };

  switch (pageName) {
    case 'discover':
      return discoverBanner();
    case 'portfolio':
      return portfolioBanner();
    default:
      return {
        heading: 'Stay Informed',
        message:
          'Get monthly returns updates about your investments by turning on notifications',
      };
  }
};
