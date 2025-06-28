//NODE_MODULES
import React, { useEffect } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Image from '../../primitives/Image';
import Swipper from '../../common/Swipper';
import MobileDrawer from '../../primitives/MobileDrawer/MobileDrawer';
import { useAppSelector } from '../../../redux/slices/hooks';
import { useRouter } from 'next/router';

//ICONS
import ModalCloseIcon from '../../../components/assets/static/assetList/ModalCloseIcon.svg';

//UTILS
import { getMenuDrawerBackground, getSlideIcon } from '../utils';
import {
  importCalendlyScript,
  removeCalendlyScript,
} from '../../../utils/ThirdParty/calendly';
import { trackEvent } from '../../../utils/gtm';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { hideAssets } from '../../../utils/financeProductTypes';
import { isGCOrder } from '../../../utils/gripConnect';
import { getActiveStateByHash } from '../../../utils/assetList';
import useHash from '../../../utils/customHooks/useHash';

// API
import { fetchLeadOwnerDetails } from '../../../api/user';

//STYLES
import classes from './TitleSection.module.css';
import GridOverlay from '../../GridOverlay';

const VideoPlayerComponent = dynamic(
  () => import('../../primitives/VideoPlayerComponent/VideoPlayerComponent'),
  {
    ssr: false,
  }
);

type Props = {
  data?: any;
  className?: string;
  productType?: string;
  id?: string;
};

const productTypeMapper = {
  highyieldfd: `High Yield FDs`,
  sdi: `SDIs`,
  bonds: `Bonds`,
  baskets: `Baskets`,
  bondsmfs: `Bond MFs`,
};

const formatProductType = (productType: string) => {
  if (!productType) return '';
  return productTypeMapper[productType.toLowerCase()] || '';
};

const TitleSection = ({ data, className, productType, id = '' }: Props) => {
  const [showFlyer, setShowFlyer] = React.useState(false);
  const [showVideoModal, setShowVideoModal] = React.useState(false);
  const [showMobileMoreDetails, setShowMobileMoreDetails] =
    React.useState(false);
  const [calendlyLoaded, setCalendlyLoaded] = React.useState(false);
  const [showSliderMenu, setShowSliderMenu] = React.useState(false);
  const [selectedActionData, setSelectedActionData] = React.useState({
    title: '',
    sliderData: [],
  });

  const isGC = isGCOrder();
  const selectAssetList = (state) =>
    state.gcConfig?.configData?.themeConfig?.pages?.assetList ?? {};
  const localProps = useAppSelector((state) => state.assets.assetProps);

  const SDITabArr =
    localProps?.pageData?.find((item: any) => item.keyValue === 'SDITabArr')
      ?.objectData?.SDITabArr || [];

  const assetList = useAppSelector(selectAssetList);
  const isShowSupportBanner = isGC ? assetList?.hideRMAboutBonds : false;
  const router = useRouter();
  const { hash } = useHash();
  const isMobile = useMediaQuery('(max-width: 992px)');
  const userData = useAppSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );
  const { assetSubType: subCategory } = getActiveStateByHash(hash);
  const getRegulatoryText = (id: string, productType: string) => {
    const regulatoryMapping: Record<string, string> = {
      rbi_section: 'RBI regulated',
      sebi_section: 'SEBI regulated',
    };
    const productTypeOverrides: Record<string, string> = {
      highyieldfd: 'RBI regulated',
      bonds: 'SEBI regulated',
      baskets: 'SEBI regulated',
      bondsmfs: 'SEBI regulated',
    };
    if (regulatoryMapping[id]) {
      return regulatoryMapping[id];
    }
    if (productTypeOverrides[productType?.toLowerCase()]) {
      return productTypeOverrides[productType?.toLowerCase()];
    }
    return 'RBI regulated';
  };

  const loadCalendlyAndBookMeeting = () => {
    if (!calendlyLoaded) {
      importCalendlyScript()
        .then(() => {
          setCalendlyLoaded(true);
          onBookWM();
        })
        .catch((error) => {
          console.error('Failed to load Calendly script:', error);
        });
    } else {
      onBookWM();
    }
  };

  const onBookWM = async () => {
    try {
      const responseData = await fetchLeadOwnerDetails(
        'firstName,lastName,calendlyLink,email'
      );
      if (responseData) {
        const { userID } = userData;
        const prefill = {
          name: `${responseData?.firstName} ${responseData?.lastName}`,
          firstName: responseData?.firstName,
          lastName: responseData?.lastName,
          email: responseData?.email,
        };
        const url = `${responseData?.calendlyLink}?utm_campaign=profile&utm_source=${userID}`;
        trackEvent('Click_book_a_call', {
          url: router.pathname,
        });
        if (window?.['Calendly']) {
          window?.['Calendly'].initPopupWidget({
            url,
            prefill,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      removeCalendlyScript();
    };
  }, []);

  useEffect(() => {
    const ele = document.querySelector('body');
    if (ele) {
      if (!showVideoModal) {
        ele.classList.remove('scroll-hidden');
      } else {
        ele.classList.add('scroll-hidden');
      }
    }
  }, [showVideoModal]);

  const renderSlide = (item: any) => {
    return (
      <div className={`flex-column ${classes.swipperSlideContainer}`}>
        <div className={classes.slideIcon}>
          <Image
            src={
              item?.icon?.startsWith('https://')
                ? item?.icon
                : getSlideIcon(productType)
            }
            alt="slideIcon"
          />
        </div>
        <div className={classes.slideSubtitle}>{item?.subTitle}</div>
        <div className={classes.slideDesc}>{item?.description}</div>
      </div>
    );
  };

  const renderSliderDrawer = () => {
    return (
      <Swipper
        sliderData={selectedActionData.sliderData}
        customSliderComponent={renderSlide}
        classes={{
          swiperSlideClass: classes.swiperSlideClass,
        }}
      />
    );
  };

  const onClickDrawerAction = (value) => {
    setSelectedActionData(value);
    setShowMobileMoreDetails(false);
    setShowSliderMenu(true);
  };

  const closeAllModal = () => {
    setShowMobileMoreDetails(false);
    setShowVideoModal(false);
    setShowFlyer(false);
    setShowSliderMenu(false);
  };

  const moreDetailsDrawer = () => {
    return (
      <div className={classes.moreDetailsContainer}>
        <div>
          <div className={`flex ${classes.moreDetailsHeadingContainer}`}>
            <div className={classes.moreDetailsIcon}>
              <span className="icon-question"></span>
            </div>
            <div className={classes.moreDetailsHeading}>
              {data?.learnData?.learnHeading}
            </div>
            <span
              className={`icon-cross ${classes.closeIcon}`}
              onClick={closeAllModal}
            />
          </div>
          {isMobile && (
            <div>
              <VideoPlayerComponent videoLink={data?.videoUrl} height={200} />
              <span
                className={classes.ModalCLose}
                onClick={() => setShowVideoModal(false)}
              ></span>
            </div>
          )}
          <div className={classes.detailsContainer}>
            {data?.learnData?.learnDrawer.map((value, index) => {
              return (
                <div
                  key={`${value?.id}`}
                  className={classNames(
                    classes.detailsStep,
                    {
                      [classes.removeBorder]:
                        index === data.learnData.learnDrawer.length - 1,
                    },
                    'flex'
                  )}
                  onClick={() => onClickDrawerAction(value)}
                >
                  <div className={classes.detailsStepText}>{value.title}</div>
                  <span
                    className={`icon-caret-right ${classes.forwardArrow}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {!isShowSupportBanner && (
          <div className={`justify-center items-center ${classes.LastDiv}`}>
            <h2 className={classes.LastDivFirstText}>
              {`Still got doubts? we'll be happy to help you.`}
            </h2>
            <h2
              className={classes.LastDivSecondText}
              onClick={loadCalendlyAndBookMeeting}
            >
              {`Get in touch with your Relationship Manager`}
            </h2>
          </div>
        )}
      </div>
    );
  };

  const menuDrawer = () => {
    return (
      <div
        className={!isMobile && classes.menuDrawerContainer}
        style={{ background: getMenuDrawerBackground(productType) }}
      >
        <div className={`flex justify-between ${classes.menuDrawerHeader}`}>
          <div className="flex">
            <span
              className={`icon-arrow-left ${classes.arrowBack}`}
              onClick={() => {
                setShowMobileMoreDetails(true);
                setShowSliderMenu(false);
              }}
            />
            <div className={classes.sliderDrawerHeading}>
              {selectedActionData?.title ?? ''}
            </div>
          </div>
          {!isMobile && (
            <span
              className={`icon-cross ${classes.menuDrawerCloseIcon}`}
              onClick={closeAllModal}
            />
          )}
        </div>
        {renderSliderDrawer()}
      </div>
    );
  };

  const renderDesktopModal = () => {
    if (showMobileMoreDetails) {
      return moreDetailsDrawer();
    }

    if (showSliderMenu) {
      return menuDrawer();
    }

    if (showFlyer && data?.videoUrl) {
      return (
        <div className={classes.VideoContainer}>
          <VideoPlayerComponent
            videoLink={data?.videoUrl}
            autoPlay
            height={492}
          />
          <span
            className={classes.ModalCLose}
            onClick={() => setShowVideoModal(false)}
          >
            <Image
              src={ModalCloseIcon.src}
              alternativeText="ModalCloseIcon"
              alt="ModalCloseIcon"
            />
          </span>
        </div>
      );
    }
  };

  const onClickKnowMoreMobile = () => {
    if (data?.learnData) {
      setShowMobileMoreDetails(true);
    } else {
      setShowFlyer(true);
    }
  };

  function handleDescription(isMobile, data) {
    if (!data) {
      return '';
    }
    if (isMobile) {
      return data?.mobileDescription;
    }
    return data?.description;
  }

  const getMobileTitleSection = () => {
    return hideAssets(productType) ? null : (
      <div
        className={classes.mobileTitleSectionContainer}
        id={isMobile ? id : ''}
      >
        <GridOverlay>
          <div className={`flex ${classes.mobileSectionTitle}`}>
            <div>
              <div className={classes.headerContainerAccordian}>
                <h4 className={classes.mobileDescription}>
                  {handleDescription(isMobile, data)}
                </h4>
              </div>
              <div className={classes.bodyContainerAccodian}>
                <div
                  className={`flex justify-between items-center ${classes.SebiBadgeDiv}`}
                >
                  <div className={`flex justify-between items-center`}>
                    <button
                      className={`flex justify-between items-center ${classes.SEBIText}`}
                    >
                      <span
                        className={`icon-shield ${classes.ShieldCheck}`}
                      ></span>
                      {getRegulatoryText(id, productType)}
                    </button>
                  </div>
                  <div className={`flex justify-between items-center`}>
                    <button
                      className={`flex justify-between items-center ${classes.SEBITextBlue}`}
                      onClick={onClickKnowMoreMobile}
                    >
                      About {formatProductType(productType)}{' '}
                      <span className={`icon-info ${classes.InfoIcon}`}></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GridOverlay>
      </div>
    );
  };

  const openKnowMoreModal = () => {
    if (data?.learnData) {
      setShowMobileMoreDetails(true);
    } else {
      setShowFlyer(true);
    }
    setShowVideoModal(true);
  };
  const getHeadingClass = () => {
if (!isMobile && productType === 'sdi') {
    if (SDITabArr?.[1]?.key === subCategory) {
      return classes.sdiTabheadingSecond;
    }

    if (SDITabArr?.[0]?.key === subCategory) {
      return classes.sdiTabheadingFirst;
    }
  }
  return classes.headingContainer;
};

  const renderHeading = () => {
    return (
      <div className={getHeadingClass()} id={!isMobile ? id : ''}>
        {(data?.description || data?.videoUrl) && (
          <div>
            {data?.description && (
              <div className={`${classes.knowMoreContainer} ${productType}`}>
                <div className={classes.productTypeDesc}>
                  <span className={classes.Text}>{data.description}</span>

                  {!hideAssets(productType) ? (
                    <span
                      className={classes.knowMoreAboutHeading}
                      onClick={openKnowMoreModal}
                    >
                      {data?.videoButtonName}
                    </span>
                  ) : null}
                </div>
                {data?.videoUrl ? (
                  <div
                    className={classes.watchVideoLink}
                    onClick={() => {
                      setShowVideoModal(true);
                      setShowFlyer(true);
                    }}
                  >
                    <span>Watch Now</span>
                    <div className={classes.watchVideoIconContainer}>
                      <span className={`icon-video ${classes.PlayIcon}`} />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`${classes.TitleSectionMain} ${className}`}>
        {renderHeading()}
      </div>
      {showVideoModal && (
        <div className={classes.VideoModal}>{renderDesktopModal()}</div>
      )}
      {isMobile && getMobileTitleSection()}

      <MobileDrawer
        showFlyer={showFlyer && isMobile}
        handleDrawerClose={(res: boolean) => {
          setShowFlyer(res);
        }}
      >
        <div className={classes.FlyerVideoContent}>
          <h3 className="Heading4">{data?.title}</h3>
          <p className="TextStyle1">{data?.description}</p>
        </div>

        <div className={classes.FlyerVideo}>
          <VideoPlayerComponent
            videoLink={data?.videoUrl}
            autoPlay
            height={200}
          />
        </div>
      </MobileDrawer>

      <MobileDrawer
        showFlyer={showMobileMoreDetails}
        handleDrawerClose={(res: boolean) => setShowMobileMoreDetails(res)}
      >
        {moreDetailsDrawer()}
      </MobileDrawer>

      <MobileDrawer
        className={classes.mobileMenuDrawer}
        showFlyer={showSliderMenu}
        handleDrawerClose={(res: boolean) => setShowSliderMenu(res)}
        backgroundColor={getMenuDrawerBackground(productType)}
      >
        {menuDrawer()}
      </MobileDrawer>
    </>
  );
};

export default TitleSection;
