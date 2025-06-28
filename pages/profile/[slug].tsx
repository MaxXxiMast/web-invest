// NODE MODULES
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Common Compoennts
import Seo from '../../components/layout/seo';
import ProfileSkeleton from '../../skeletons/profile-skeleton/ProfileSkeleton';
import ProfileLayout from '../../components/user-profile/layout';
import ProfileHeader from '../../components/user-profile/header';

// Utils
import { fetchAPI } from '../../api/strapi';
import { getAllLinks, getSeoData } from '../../utils/strapi';
import {
  importCalendlyScript,
  removeCalendlyScript,
} from '../../utils/ThirdParty/calendly';
import { trackEvent } from '../../utils/gtm';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

// Contexts
import { ProfileContext } from '../../components/ProfileContext/ProfileContext';

// Redux Slices
import { fetchUccStatus, getPanAadhaarDetails } from '../../redux/slices/user';

// API
import { fetchLeadOwnerDetails } from '../../api/user';

//Hooks
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';

// Styles
import styles from '../../styles/Profile.module.css';

declare const window: any;

const Profile: NextPage = () => {
  const { userData } = useAppSelector((state) => (state as any)?.user ?? {});
  const { default: kycData = {} } = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );
  const dispatch = useAppDispatch();
  const [dataLoading, setDataLoading] = useState(true);
  const [userKycData, setUserKycData] = useState([]);
  const [showHeader, setShowHeader] = useState(true);
  const [headerBtn, setHeaderBtn] = useState(true);
  const [pageData, setPageData] = useState([]);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [leadOwnerDetails, setLeadOwnerDetails] = useState({
    calendlyLink: '',
  });

  const router = useRouter();
  const isMobile = useMediaQuery();

  const seoData = getSeoData(pageData);

  const loadCalendlyAndBookMeeting = () => {
    if (!calendlyLoaded) {
      importCalendlyScript()
        .then(() => {
          setCalendlyLoaded(true);
          onBookWM(); // Open the widget after the script is loaded
        })
        .catch((error) => {
          console.error('Failed to load Calendly script:', error);
        });
    } else {
      onBookWM();
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(getPanAadhaarDetails()),
        dispatch(fetchUccStatus()),
      ]).then(() => {
        setDataLoading(false);
      });
    })();

    return () => {
      removeCalendlyScript();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKycFetch = (data: any) => {
      if (data?.kycTypes) {
        setUserKycData(data?.kycTypes);
      }
    };
    handleKycFetch(kycData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageData = async () => {
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/profile',
        },
        populate: '*',
      },
      {},
      false
    );
    setPageData(pageData?.data?.[0]?.attributes?.pageData);
  };

  useEffect(() => {
    fetchLeadOwnerDetails('calendlyLink')
      .then((res) => {
        setLeadOwnerDetails(res);
      })
      .catch((err) => {
        console.log('error', err);
      });
    handlePageData();
  }, []);

  const onBackClick = () => {
    router.back();
  };

  const onBookWM = () => {
    const { firstName, lastName, emailID, userID } = userData;
    const prefill = {
      name: `${firstName} ${lastName}`,
      firstName: firstName,
      lastName: lastName,
      email: emailID,
    };
    const url = `${leadOwnerDetails.calendlyLink}?utm_campaign=profile&utm_source=${userID}`;

    trackEvent('Book a Meeting');
    window.Calendly &&
      window.Calendly.initPopupWidget({
        url,
        prefill,
      });
  };

  const handleHeaderBtn = (val: boolean) => {
    setHeaderBtn(val);
  };

  const renderContent = () => {
    if (dataLoading && !isMobile) {
      return <ProfileSkeleton />;
    } else {
      return (
        <ProfileContext.Provider
          value={{
            userKycData: userKycData,
            handleHeaderBtn,
            onBookWM: loadCalendlyAndBookMeeting,
            supportPageLinks: getAllLinks(pageData),
            userDetails: userData,
          }}
        >
          <ProfileLayout
            onBookWM={loadCalendlyAndBookMeeting}
            handleShowHeader={setShowHeader}
            headerBtn={headerBtn}
          />
        </ProfileContext.Provider>
      );
    }
  };

  return (
    <>
      <Seo seo={seoData} />
      <div className={styles.RfqContainer}>
        {showHeader && (
          <ProfileHeader
            onBackClick={onBackClick}
            onBookClick={loadCalendlyAndBookMeeting}
          />
        )}
        <div className={`flex-column ${styles.ProfileContentWrapper}`}>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default Profile;
