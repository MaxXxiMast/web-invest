import { getGripURL } from '../../api/strapi';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

export const referralConstants = Object.freeze({
  headLine: 'Refer & Earn upto ₹2,000',
  bodyLine: 'when your friend makes their first Grip Investment',
  linkLine: 'Learn more',
  linkTo: '/referral',
  gaMappingDashboard: {
    Twitter: 'referByDashboardTwitterIconClick',
    linkedin: 'referByDashboardLinkedinIconClick',
    Facebook: 'referByDashboardFbIconClick',
    Whatsapp: 'referByDashboardWhatsappIconClick',
    sms: 'referByDashboardSmsIconClick',
    Mail: 'referByDashboardMailIconClick',
  },
  gaMappingHome: {
    Twitter: 'referByHomeTwitterIconClick',
    linkedin: 'referByHomeLinkedinIconClick',
    Facebook: 'referByHomeFbIconClick',
    Whatsapp: 'referByHomeWhatsappIconClick',
    sms: 'referByHomeSmsIconClick',
    Mail: 'referByHomeMailIconClick',
  },
  gaMappingOrders: {
    Twitter: 'referByOrderTwitterIconClick',
    linkedin: 'referByOrderLinkedinIconClick',
    Facebook: 'referByOrderFbIconClick',
    Whatsapp: 'referByOrderWhatsappIconClick',
    sms: 'referByOrderSmsIconClick',
    Mail: 'referByOrderMailIconClick',
  },
});
const defaultReferralInviteText = `Join Grip Invest - Make Your Investments Smarter! 
  \n\nI’ve been investing with Grip Invest and absolutely love their secure, regulated fixed-income opportunities, including Corporate Bonds, SDIs, and FDs. It’s a game-changer for building wealth with confidence! 
  \n\nFun fact: Grip was the first SEBI-authorized OBPP platform to sell bonds online! 
  \n\nStart your investment journey today using my referral link <gcReferralUrl> or use code <referral_code> 
  \n\nLet’s grow our wealth together!`;

export const shareIcons = (
  referralCode: string,
  type: string,
  gcReferralInviteText: string = '',
  gcReferralUrl: string = ''
) => {
  const getShareUrl = (type: string = '') => {
    return gcReferralUrl
      ? gcReferralUrl.replace(/<referral_code>/g, referralCode)
      : `${getGripURL()}/?referralCode=${referralCode}&utm_medium=referralLink&utm_source=${type}`;
  };
  const getText = (type: string) => {
    return (gcReferralInviteText || defaultReferralInviteText)
      .replace(/<referral_code>/g, referralCode)
      .replace(/<gcReferralUrl>/g, getShareUrl(type));
  };
  const iconDict = {
    Whatsapp: {
      src: `${GRIP_INVEST_BUCKET_URL}referral/whatsapp.svg`,
      text: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        getText('Whatsapp')
      )}`,
      mobileText: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        getText('Whatsapp')
      )}`,
      iosChrome: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        getText('Whatsapp')
      )}`,
      iosDeviceWhatsapp: `whatsapp://send?text=${encodeURIComponent(
        getText('Whatsapp')
      )}`,
      name: 'Whatsapp',
    },
    linkedin: {
      src: `${GRIP_INVEST_BUCKET_URL}referral/linkedin.svg`,
      text: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        `${getGripURL()}/?referralCode=${referralCode}&utm_medium=referralLink&utm_source=LinkedIN`
      )}&title=${encodeURIComponent(getText('LinkedIN'))}`,
      mobileText: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        getText('LinkedIN')
      )}`,
      name: 'Linkedin',
    },
    Facebook: {
      src: `${GRIP_INVEST_BUCKET_URL}referral/facebook.svg`,
      text: `https://www.facebook.com/sharer.php?u=${
        window.location.href
      }/?referralCode=${referralCode}&utm_medium=referralLink&utm_source=FB&hashtag=${encodeURIComponent(
        getText('FB')
      )}`,
      mobileText: `https://www.facebook.com/sharer.php?u=${
        window.location.href
      }/?referralCode=${referralCode}&utm_medium=referralLink&utm_source=FB&hashtag=${encodeURIComponent(
        getText('FB')
      )}`,
      iosChrome: `https://www.facebook.com/sharer.php?u=${
        window.location.href
      }/?referralCode=${referralCode}&utm_medium=referralLink&utm_source=FB&hashtag=${encodeURIComponent(
        getText('FB')
      )}`,
      name: 'Facebook',
    },
    sms: {
      src: `${GRIP_INVEST_BUCKET_URL}referral/sms.svg`,
      text: `sms:?&body=${encodeURIComponent(getText('sms'))}`,
      mobileText: `sms:?&body=${encodeURIComponent(getText('sms'))}`,
      name: 'Message',
    },
    Twitter: {
      src: `${GRIP_INVEST_BUCKET_URL}referral/twitter.svg`,
      text: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        getText('twitter')
      )}`,
      mobileText: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        getText('twitter')
      )}`,
      iosChrome: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        getText('twitter')
      )}`,
      name: 'Twitter',
    },
    Mail: {
      src: `${GRIP_INVEST_BUCKET_URL}referral/mail.svg`,
      text: `mailto:?subject=Check this out at Grip&body=${encodeURIComponent(
        getText('email')
      )}`,
      mobileText: `mailto:?subject=Check this out at Grip&body=${encodeURIComponent(
        getText('email')
      )}`,
      iosChrome: `https://mail.google.com/mail/?view=cm&fs=1&su=Check this out at Grip&body=${encodeURIComponent(
        getText('email')
      )}`,
      name: 'Email',
    },
  };

  return iconDict[type];
};

export const howItWorks = [
  {
    icon: { src: `${GRIP_INVEST_BUCKET_URL}icons/referralIcon1.svg` },
    title: 'Refer Your Friend',
    description:
      'Refer your friend and ensure they sign up using your referral code or link',
    stepNumber: 1,
    id: 'step1',
  },
  {
    icon: { src: `${GRIP_INVEST_BUCKET_URL}icons/referralIcon2.svg` },
    title: 'Your friend invests',

    id: 'referee',
    description:
      'Earn 100% of the brokerage (upto ₹2,000 each time) on every investment they make in first 6 months. Referral rewards are applicable for upto 10 friends',
    stepNumber: 2,
  },
  {
    icon: { src: `${GRIP_INVEST_BUCKET_URL}icons/referralIcon3.svg` },
    title: 'You receive referral bonus',
    id: 'referral',
    description:
      'Your rewards are directly credited to your bank account registered with Grip on the 10th of the subsequent month',
    stepNumber: 3,
  },
];
