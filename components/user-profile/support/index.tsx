// NODE MODULES
import { useContext } from 'react';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';

// Contexts
import { ProfileContext } from '../../ProfileContext/ProfileContext';

// Components
import Image from '../../primitives/Image';

// Utils
import { SharedLinks } from '../../../utils/strapi';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { redirectHandler } from '../../../utils/windowHelper';

// Styles
import styles from './Support.module.css';

const WealthManager = dynamic(() => import('../../common/RMCard'), {
  ssr: false,
});

const getLinkIcon = (title: string) => {
  switch (title) {
    case 'Email Us':
      return `${GRIP_INVEST_BUCKET_URL}profile/mail.svg`;
    case 'FAQs':
      return `${GRIP_INVEST_BUCKET_URL}profile/message-square-text.svg`;
    case 'Privacy Policy':
      return `${GRIP_INVEST_BUCKET_URL}profile/book-check.svg`;
    case 'Terms & Conditions':
      return `${GRIP_INVEST_BUCKET_URL}profile/file-text.svg`;
    default:
      return `${GRIP_INVEST_BUCKET_URL}profile/FAQ.svg`;
  }
};

export default function Support({ accessibilityLabel = 'support' }) {
  const { supportPageLinks }: any = useContext(ProfileContext);

  const handleLinkClick = (url: string) => {
    const application = Cookies.get('webViewRendered')
      ? 'Mobile App'
      : 'Website';
    if (application === 'Mobile App') {
      redirectHandler({
        pageUrl: url,
        pageName: 'Support',
      });
      return;
    }
    window.open(url, '_blank', 'noopener');
  };

  const renderLinkComponent = (link: SharedLinks) => {
    return (
      <div className={styles.supportContainer}>
        <div className={styles.supportButton}>
          <Image
            src={getLinkIcon(link.title)}
            layout={'fixed'}
            width={20}
            height={20}
            alt={link.title}
          />
          <span className={styles.supportButtonTitle}>{link.title}</span>
        </div>
        <div className={styles.caret}>
          <span className={`icon-caret-right ${styles.CaretIcon}`} />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.supportWrap}>
        {supportPageLinks
          ?.filter(
            (link: SharedLinks) =>
              link.accessibilityLabel === accessibilityLabel
          )
          ?.map((link: SharedLinks) => {
            return (
              <div
                key={`support-${link.title}`}
                className={`flex ${styles.buttonContainer}`}
              >
                {link?.clickUrl.toLowerCase()?.startsWith('mailto:') ? (
                  <a
                    href={link?.clickUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {renderLinkComponent(link)}
                  </a>
                ) : (
                  <div
                    className="width100"
                    onClick={() => handleLinkClick(link?.clickUrl)}
                  >
                    {renderLinkComponent(link)}
                  </div>
                )}
              </div>
            );
          })}
      </div>
      {accessibilityLabel === 'support' && <WealthManager isProfile />}
    </>
  );
}
