import React, { useContext } from 'react';
import dompurify from 'dompurify';
import Link from 'next/link';
import { GlobalContext } from '../../../../pages/_app';
import { getStrapiMediaS3Url } from '../../../../utils/media';
import Image from '../../../primitives/Image';

import FooterBanner from '../../../FooterBanner/FooterBanner';

import styles from './AppLayoutFooter.module.css';
import KnowYourInvestor from '../../../discovery/KnowYourInvestor';

function getSocialIcon(url: string) {
  const socialIcons = {
    'instagram.com': 'icon-instagram',
    'linkedin.com': 'icon-linkedin',
    'facebook.com': 'icon-facebook',
    'twitter.com': 'icon-twitter-x',
  };

  for (let domain in socialIcons) {
    if (url.includes(domain)) {
      return socialIcons[domain];
    }
  }
  return 'icon-default';
}
const Footer = () => {
  const sanitizer = dompurify.sanitize;
  const { Footer, footerSections, experimentsData }: any =
    useContext(GlobalContext);

  const showReferral = experimentsData?.showReferral;
  const returnSocialIcon = (media: any) => {
    if (media?.socialMediaIcon) {
      return (
        <span className={`${media?.socialMediaIcon} ${styles.SocialMedia}`} />
      );
    }
    const socialIcon = getSocialIcon(media?.clickUrl);
    if (socialIcon !== 'icon-default') {
      return <span className={`${socialIcon} ${styles.SocialMedia}`} />;
    }
    return (
      <Image
        src={getStrapiMediaS3Url(media.logo)}
        height={20}
        width={20}
        alt={media['altText']}
        layout="fixed"
      />
    );
  };

  return (
    <>
      <FooterBanner
        className={styles.FooterBanner}
        isFetchPersonality={false}
      />
      <div className={styles.footer}>
        <div className="containerNew">
          <div className={styles.Nav}>
            <div className={styles.footer_section}>
              <a href="#">
                <Image
                  src={getStrapiMediaS3Url(Footer?.footerLogo)}
                  layout={'fixed'}
                  width={'101'}
                  height={'36'}
                  alt="footerLogo"
                />
              </a>
              <div className={styles.Subtext}>{Footer?.info}</div>
              <div className={'mt-40'}>
              <a href="https://maps.app.goo.gl/1F9kXFKcmC8HNNE47" target='_blank'> 
                <span className={`icon-building ${styles.Building}`} />
              </a>
                <div className={'mt-12'}>
                  <div className={styles.SectionHead}>
                    {Footer?.addressHeader}
                  </div>
                  <div className="mt-12">
                    <div>{Footer?.address}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.right_section} mt-40`}>
            
              <div className={styles.right_top}>
                <div className={styles.SectionHead}>
                
                  {footerSections?.[0].sectionHead}
                </div>
                <div className={'flex items-start mt-12'}>
                  <div className={`${styles.LinkWrapper}`}>
                    {footerSections?.[0]?.links?.map(
                      (link: any, index: number) => (
                        <div
                          key={`link-${link?.id}`}
                          className={`${styles.Link} ${
                            index === 0 ? 'mt-0' : ''
                          }`}
                        >
                          {link?.clickUrl == '/persona-results' ? (
                            <KnowYourInvestor clickFrom="footer" className={styles.gripLinks}/>
                          ) : (
                            <Link className={styles.gripLinks}
                              href={link?.clickUrl}
                              legacyBehavior
                              prefetch={false}
                            >
                              {link?.title}
                            </Link>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <div className={`flex ${styles.LinkWrapper} ml-60`}>
                    {footerSections[1]?.links?.map(
                      (link: any, index: number) => (
                        <div
                          key={`link-${link?.id}`}
                          className={`${styles.Link}`}
                        >
                          <Link className={styles.gripLinks}
                            href={link?.clickUrl}
                            legacyBehavior
                            prefetch={false}
                          >
                            {link?.title}
                          </Link>
                        </div>
                      )
                    )}
                  </div>

                  <div className={`flex ${styles.LinkWrapper} ml-60`}>
                    {footerSections[2]?.links?.map(
                      (link: any, index: number) => {
                        // hide referral link if showReferral is off
                        if (!showReferral && link?.clickUrl === '/referral') {
                          return null;
                        }
                        return (
                          <div
                            key={`link-${link?.id}`}
                            className={`${styles.Link}`}
                          >
                            <Link className={styles.gripLinks}
                              href={link?.clickUrl}
                              legacyBehavior
                              prefetch={false}
                            >
                              {link?.title}
                            </Link>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.right_bottom}>
                <div className={`${styles.Social} mt-44`}>
                  <div className={styles.SectionHead}>Mail Us</div>

                  <div className="mt-12">
                    <a
                      className={styles.footer__mail_to}
                      href="mailto:invest@gripinvest.in"
                    >
                      {Footer.gripMail}
                    </a>
                  </div>
                </div>

                <div className={`${styles.Social} mt-44`}>
                  <div
                    className={`${styles.SectionHead} ${styles.social_header}`}
                  >
                    Find Us
                  </div>

                  <div className={`flex mt-12 ${styles.FooterSocialIcons}`}>
                    {Footer?.socialMedia?.map((media: any, index: number) => (
                      <div
                        key={`social-${media.id}`}
                        className={`flex ${styles.SocialIcons}  ${
                          index === 0 ? 'ml-0' : ''
                        }`}
                        onClick={() =>
                          window.open(
                            media.clickUrl,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }
                      >
                        {returnSocialIcon(media)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="containerNew">
          <div
            className={styles.footer_disclaimer}
            dangerouslySetInnerHTML={{
              __html: sanitizer(Footer?.disclaimerRichText),
            }}
          />
        </div>
        <div className="FooterBottom">
          <div className="containerNew">
            <div
              className={styles.footer_bottom}
              style={{
                marginTop: 40,
                borderTop: '1px solid #EBEBF0',
                fontSize: 12,
                lineHeight: '20px',
                color: '#555770',
                textAlign: 'center',
              }}
            >
              <div className="flex justify-center items-center">
                <Link
                  href={Footer?.terms?.clickUrl}
                  className={styles.gripLinks}
                  target="_blank"
                  prefetch={false}
                >
                  {Footer?.terms?.title}
                </Link>
                <div className="ml-32">
                  <Link
                    href={Footer?.privacy?.clickUrl}
                    className={styles.gripLinks}
                    target="_blank"
                    prefetch={false}
                  >
                    {Footer?.privacy?.title}
                  </Link>
                </div>
                <div className="ml-32">
                  <Link
                    href={Footer?.investorCorner?.clickUrl}
                    className={styles.gripLinks}
                    target="_blank"
                    prefetch={false}
                  >
                    {Footer?.investorCorner?.title}
                  </Link>
                </div>
                <div className="ml-32">
                  <Link
                    href={Footer?.contactUs?.clickUrl}
                    className={styles.gripLinks}
                    target="_blank"
                    prefetch={false}
                  >
                    {Footer?.contactUs?.title}
                  </Link>
                </div>
              </div>
              <div className={styles.copyright}>
                <div
                  className="gripLuminous"
                  dangerouslySetInnerHTML={{
                    __html: sanitizer(Footer.copyRightText),
                  }}
                />
                <div className="gripLuminous ml-8">, Grip </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
