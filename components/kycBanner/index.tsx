import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// COMPONENTS
import Button from '../primitives/Button';
import Image from '../primitives/Image';
import CustomSkeleton from '../primitives/CustomSkeleton/CustomSkeleton';
import TooltipCompoent from '../primitives/TooltipCompoent/TooltipCompoent';

// UTILS
import { getContent } from './utils';
import { trackEvent } from '../../utils/gtm';
import { getKycStepStatus } from '../user-kyc/utils/helper';
import { sortingEntryBannerArr } from '../CommentBox/utils';
import { getDiscoveryKycStatus } from '../../utils/discovery';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { setActiveClass } from '../../utils/scroll';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

// APIs
import { callErrorToast, fetchAPI } from '../../api/strapi';
import { getUserPortfolioCategoryCount } from '../../api/user';

// REDUX
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../redux/slices/hooks';
import { setOpenCommentBox } from '../../redux/slices/rfq';
import { getCommentsCountForKYC } from '../../redux/slices/config';

// STYLESHEETS
import classes from './KycBanner.module.css';

const Announcement = dynamic(
  () => import('../Announcement/Announcement').then((x) => x.Announcement),
  {
    ssr: false,
  }
);

type KycBannerProps = {
  isUserOBPPInvested?: boolean;
  isUserFDInvested?: boolean;
  isInvestmentDataLoaded?: boolean;
  mockContent?: any;
};

const KycBanner = (props: KycBannerProps) => {
  const router = useRouter();
  const [learnMore, setLearnMore] = useState(false);
  const dispatch = useDispatch();

  const [userKycData, setUserKycData] = useState({});
  const { userData, kycDetails = {} } = useAppSelector((state) => state.user);

  const commentsCountData = useAppSelector(
    (state) => state.config.commentsCount
  );

  const isOldKYCComplete =
    getDiscoveryKycStatus(userData, kycDetails) === 'verified';
  const isInvestedUser = userData?.investmentData?.isInvested || false;

  const { NSE: uccStatus = {} } = useAppSelector(
    (state) => state.user?.uccStatus
  );
  const [isUserFDInvested, setIsUserFDInvested] = useState(false);
  const [isUserOBPPInvested, setIsUserOBPPInvested] = useState(false);

  const [fetchingData, setFetchingData] = useState(true);

  const [subStatusMapping, setSubStatusMapping] = useState({});
  const [contentMapping, setContentMapping] = useState({});
  const [commonMessages, setCommonMessages] = useState({} as any);
  const [moduleTillKycIsComplete, setModuleTillKycIsComplete] = useState('');
  const [content, setContent] = useState(props.mockContent || ({} as any));

  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery();
  const message = isMobile
    ? content?.mobile?.heading
    : content?.desktop?.heading;

  const {
    kycTypes = [],
    kycStatusLoaded = false,
    isFilteredKYCComplete = false,
  } = useAppSelector((state) => state?.user?.kycConfigStatus?.default) || {};

  useEffect(() => {
    const getInvestedDeals = async () => {
      if (props.isInvestmentDataLoaded) {
        setIsUserFDInvested(props.isUserFDInvested);
        setIsUserOBPPInvested(props.isUserOBPPInvested);
      } else {
        const res = await getUserPortfolioCategoryCount();
        setIsUserOBPPInvested(res?.isUserOBPPInvested);
        setIsUserFDInvested(res?.isUserFDInvested);
      }
    };
    const getInnerPageData = async () => {
      const innerPageData = await fetchAPI('/inner-pages-data', {
        filters: { url: '/kyc-entry-banner' },
        populate: '*',
      });
      const pageData = innerPageData?.data?.[0]?.attributes?.pageData || [];
      setSubStatusMapping(
        pageData.find((p) => p?.keyValue === 'subStatus')?.objectData || {}
      );
      setContentMapping(
        pageData.find((p) => p?.keyValue === 'content')?.objectData || {}
      );
      setCommonMessages(
        pageData.find((p) => p?.keyValue === 'commonMessages')?.objectData || {}
      );
    };
    const fetchData = async () => {
      await Promise.all([
        getInvestedDeals(),
        getInnerPageData(),
        dispatch(getCommentsCountForKYC() as any),
      ]);
    };
    if (!props.isUserOBPPInvested) {
      fetchData()
        .then(() => setFetchingData(false))
        .catch((err) => {
          callErrorToast(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isInvestmentDataLoaded, props.isUserOBPPInvested]);

  useEffect(() => {
    if (kycStatusLoaded && kycTypes?.length) {
      const kycModules = kycTypes.reduce((acc, kycType) => {
        acc[kycType.name] = kycType;
        return acc;
      }, {});
      setUserKycData(kycModules);

      const stepStatusArr = getKycStepStatus(kycTypes);
      const sortedStatus = sortingEntryBannerArr(stepStatusArr);

      const status = sortedStatus.find(
        (ele) => ele.status === 0 && ele?.name !== 'pan'
      );
      setModuleTillKycIsComplete(status?.name ?? 'address');
    }
  }, [kycStatusLoaded, kycTypes]);

  const handlePrimaryClick = () => {
    trackEvent('FTI_Banner', {
      message,
      'CTA Clicked': content?.primaryButtonTxt,
      'KYC completed till': moduleTillKycIsComplete,
    });
    router.push(content?.primaryButtonCTA);
  };

  const handleSecondaryClick = () => {
    trackEvent('FTI_Banner', {
      message,
      'CTA Clicked': content?.secondaryButtonTxt,
      'KYC completed till': moduleTillKycIsComplete,
    });
    router.push('/' + content?.secondaryButtonCTA);
  };

  const handleCommentClick = async () => {
    dispatch(setOpenCommentBox(true));
  };

  useEffect(() => {
    if (isUserOBPPInvested && !fetchingData) {
      setLoading(false);
      return;
    }
    if (
      typeof isOldKYCComplete === 'boolean' &&
      typeof isInvestedUser === 'boolean' &&
      !fetchingData &&
      kycStatusLoaded
    ) {
      let content = getContent({
        userKycData,
        isOldKYCComplete,
        isInvestedUser,
        uccStatus,
        isUserFDInvested: isUserFDInvested,
        isUserOBPPInvested: isUserOBPPInvested,
        subStatusMapping,
        page: router.pathname,
        commentsCountData,
        contentMapping,
        commonMessages,
      });
      setContent(content);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOldKYCComplete,
    isInvestedUser,
    fetchingData,
    commentsCountData,
    userKycData,
    isUserFDInvested,
    isUserOBPPInvested,
    subStatusMapping,
    contentMapping,
    commonMessages,
  ]);

  // On Scroll changes for banner in mobile and assets page
  useEffect(() => {
    if (window.innerWidth <= 767 && router.pathname === '/assets') {
      let scrollPosition = 0;
      // Scroll event handler function
      const handleScroll = () => {
        const kycEntryBanner = document.getElementById('KYC-ENTRY-BANNER');
        const isY50 = window.scrollY > 50;
        // Handle KYC banner visibility based on scroll position
        if (kycEntryBanner) {
          setActiveClass(kycEntryBanner, isY50, 'Active');
        }

        scrollPosition = window.scrollY;
      };
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    !Object.keys(content).length ||
    !content?.visibilty ||
    (isFilteredKYCComplete && router.pathname === '/assets')
  )
    return null;

  if (loading && !props.isUserOBPPInvested)
    return <CustomSkeleton styles={{ width: '100%', height: 120 }} />;

  return (
    <div className={`${classes.Card}`} data-testid="KYC-ENTRY-BANNER">
      <div className={`flex-column ${classes.CardWrapper}`}>
        <div className={`flex items-center ${classes.ContentWrapper}`}>
          <div className={classes.Image}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/${content?.icon}`}
              width={102.75}
              height={102}
              layout="fixed"
              alt="Banner Image"
            />
          </div>
          <div className={`flex-column ${classes.Content}`}>
            <div
              className={`flex items-center justify-between ${classes.HeadingContainer}`}
            >
              <p className={classes.InlineText}>
                {message}
                {content?.showToolTip && isMobile ? (
                  <span className={classes.InfoIcon}>
                    <TooltipCompoent
                      toolTipText={content?.subHeading}
                      checkOnScrollTooltip
                    >
                      <span className={`icon-info ${classes.ToolInfoIcon}`} />
                    </TooltipCompoent>
                  </span>
                ) : null}
              </p>
              {content?.mobile?.primaryButtonTxt &&
                !content?.mobile?.secondaryButtonTxt &&
                isMobile && (
                  <Button
                    onClick={handlePrimaryClick}
                    width={'min-content'}
                    className={classes.PrimaryButton}
                  >
                    {content?.mobile?.primaryButtonTxt}
                  </Button>
                )}
            </div>
            <div className={`flex ${classes.DesktopSubTitle}`}>
              <p>{content?.desktop?.subHeading || content?.subHeading}</p>
              {content.learnMore && (
                <p className={classes.link} onClick={() => setLearnMore(true)}>
                  Learn More
                </p>
              )}
              {content.needHelp && (
                <p className={classes.link} onClick={handleCommentClick}>
                  Click here
                </p>
              )}
            </div>
            {content?.desktop?.primaryButtonTxt &&
            (content?.desktop?.secondaryButtonTxt || !isMobile) ? (
              <div className={`flex ${classes.Buttons}`}>
                {content?.desktop.secondaryButtonTxt ? (
                  <Button
                    onClick={handleSecondaryClick}
                    width={isMobile ? '50%' : 'min-content'}
                    className={classes.SecondaryButton}
                  >
                    {isMobile
                      ? content?.mobile?.secondaryButtonTxt
                      : content?.desktop?.secondaryButtonTxt}
                  </Button>
                ) : null}
                <Button
                  onClick={handlePrimaryClick}
                  width={isMobile ? '50%' : 'min-content'}
                  className={classes.PrimaryButton}
                >
                  {isMobile
                    ? content?.mobile?.primaryButtonTxt
                    : content?.desktop?.primaryButtonTxt}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Announcement
        showAnnouncementModal={learnMore}
        setShowAnnouncementModal={setLearnMore}
      />
      {content?.mobileSubHeading && (
        <div className={`flex ${classes.Extension}`}>
          <p>
            {content?.mobile?.subHeading || content?.subHeading}
            {content?.learnMore && (
              <span className={classes.link} onClick={() => setLearnMore(true)}>
                Learn More
              </span>
            )}
          </p>
          {content.needHelp && (
            <p className={classes.link} onClick={handleCommentClick}>
              Click here
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KycBanner;
