import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Autoplay, Pagination, Navigation } from 'swiper';
import dompurify from 'dompurify';
import { Swiper, SwiperSlide } from 'swiper/react';

import Image from '../../components/primitives/Image';
import Button from '../primitives/Button';

import { GRIP_INVEST_BUCKET_URL, handleExtraProps } from '../../utils/string';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { getOS } from '../../utils/userAgent';
import { trackEvent } from '../../utils/gtm';
import { isGCOrder } from '../../utils/gripConnect';
import { redirectHandler } from '../../utils/windowHelper';

import { fetchAPI } from '../../api/strapi';
import { isRenderedInWebview } from '../../utils/appHelpers';
import KnowYourInvestor from '../discovery/KnowYourInvestor';

import styles from './FooterBanner.module.css';
// Import Swiper styles
import 'swiper/css';

interface CTAData {
  link?: string;
  device?: string;
}

type Props = {
  className?: string;
  isFetchPersonality?: boolean;
};

const KnowYourInvestment = 'KnowYourInvestment';

const FooterBanner = ({ className = '', isFetchPersonality = true }: Props) => {
  const sanitizer = dompurify.sanitize;
  const isMobileDevice = useMediaQuery();
  const [bannerDataArray, setBannerDataArray] = useState([]);
  const router = useRouter();
  const pageName = router.pathname.split('/')[1];
  const isGC = isGCOrder();

  const handleRedirection = (
    data: any,
    ctaData: CTAData | any,
    ctaText: string
  ) => {
    if (ctaData?.link) {
      trackEvent('button_clicked', {
        CTA_text:
          ctaData.device?.toLowerCase() === 'android'
            ? 'Get it on Google Play'
            : 'Download on the App Store',
        page: pageName,
      });
      redirectHandler({
        pageUrl: ctaData.link,
        pageName: 'footer_banner',
      });
    } else {
      const deviceType = getOS();
      const deviceData = data?.storeDevices?.mobile?.find(
        (item) => item.device.toLowerCase() === deviceType.toLowerCase()
      );
      trackEvent('button_clicked', {
        CTA_text: ctaText,
        page: pageName,
      });
      if (deviceData?.link) {
        redirectHandler({
          pageUrl: deviceData.link,
          pageName: 'footer_banner',
        });
      } else {
        console.error('No link found for the current device');
      }
    }
  };

  const getFooterData = async () => {
    const homePageTopFold = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/mobile-banner',
        },
        populate: {
          pageData: {
            populate: '*',
          },
        },
      },
      {},
      false
    );

    const bannerData = homePageTopFold?.data[0]?.attributes?.pageData || [];
    setBannerDataArray([
      ...(bannerData?.[0]?.objectData?.bannerDataArr ?? []),
      {
        id: KnowYourInvestment,
      },
    ]);
  };

  useEffect(() => {
    if (!isRenderedInWebview()) {
      getFooterData();
    }
  }, []);

  const renderFooterBanner = (ele: any) => {
    const footerData = ele;
    const title = ele?.title?.split(' ')[0];
    const footerSentence = ele?.title.split(' ').slice(1).join(' ');
    return (
      <div className={`${styles.sliderCustom}`} key={ele?.title}>
        <div className={styles.footer_leftSection}>
          <div className={styles.footer_banner_heading}>
            <span className={styles.footer_banner_headingBold}>{title}</span>{' '}
            <span>{footerSentence}</span>
          </div>
          {isMobileDevice ? (
            <div className={`flex ${styles.BtnGrp}`}>
              {footerData?.storeDevices?.mobile?.map((footerBtn) => {
                return (
                  <div
                    className={styles.footerBtn}
                    key={footerBtn?.device}
                    onClick={() => handleRedirection(ele, footerBtn, '')}
                  >
                    <Image
                      src={footerBtn?.logo}
                      width={15}
                      height={17}
                      layout="fixed"
                      alt={footerBtn?.device}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`flex-column ${styles.ListGrp}`}>
              {footerData?.keys?.map((value) => (
                <div
                  key={value}
                  className={`flex items-center ${styles.footer_banner_listItem}`}
                >
                  <Image
                    src={`${GRIP_INVEST_BUCKET_URL}icons/checkMark.svg`}
                    width={18}
                    height={18}
                    layout="fixed"
                    alt={'bullet-point'}
                  />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: sanitizer(value),
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={`${styles.footer_rightSection}`}>
          {isMobileDevice ? (
            <Button
              onClick={() => handleRedirection(ele, {}, 'Get the App')}
              width={'100%'}
            >
              Get the App
            </Button>
          ) : (
            <>
              <Image
                src={footerData?.QrCode}
                width={490}
                height={350}
                layout="fixed"
                alt={'qr-code'}
              />
              <div className={`flex ${styles.BottomBtn}`}>
                {footerData?.storeDevices?.desktop?.map((footerBtn) => {
                  return (
                    <div
                      className={styles.footerBtn}
                      key={footerBtn?.device}
                      onClick={() => handleRedirection(ele, footerBtn, '')}
                    >
                      <Image
                        src={footerBtn?.logo}
                        width={180}
                        height={58}
                        layout="fixed"
                        alt={footerBtn?.device}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!bannerDataArray.length || router.pathname.includes('/persona-results')) {
    return null;
  }

  const renderPagination = () => {
    return (
      <div
        id={'FooterSliderPagination'}
        className={`flex justify-center ${styles.pagination}`}
      ></div>
    );
  };

  if (!isRenderedInWebview() && !isGC) {
    return (
      <>
        <div
          className={`${styles.footer_banner} ${handleExtraProps(className)}`}
        >
          <div className="containerNew" style={{ position: 'relative' }}>
            <span className={`icon-caret-left ${styles.prevArrow}`} />
            <Swiper
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              centeredSlides={true}
              pagination={{
                clickable: true,
                el: `#FooterSliderPagination`,
                bulletActiveClass: styles.swiperBulletActive,
                bulletClass: styles.swiperBullet,
              }}
              navigation={{
                prevEl: `.${styles.prevArrow}`,
                nextEl: `.${styles.nextArrow}`,
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              modules={[Autoplay, Pagination, Navigation]}
              className={styles.sliderContainer}
            >
              {bannerDataArray.map((ele, _idx) => {
                return (
                  <SwiperSlide key={`${ele?.id || ele?.title}`}>
                    {ele?.id === KnowYourInvestment ? (
                      <KnowYourInvestor
                        clickFrom="banner"
                        isFetchPersonality={isFetchPersonality}
                      />
                    ) : (
                      renderFooterBanner(ele)
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
            <span className={`icon-caret-right ${styles.nextArrow}`} />
          </div>
        </div>
        {renderPagination()}
      </>
    );
  }

  return null;
};

export default FooterBanner;
