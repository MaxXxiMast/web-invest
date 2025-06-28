// NODE MODULES
import { NextPage } from 'next';
import { connect, ConnectedProps } from 'react-redux';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Common Compoennts
import Seo from '../../layout/seo';
import ProfileSkeleton from '../../../skeletons/profile-skeleton/ProfileSkeleton';
import ProfileLayout from '../layout';
import ProfileHeader from '../header';

// Utils
import { fetchAPI } from '../../../api/strapi';
import { getAllLinks, getSeoData } from '../../../utils/strapi';
import {
  importCalendlyScript,
  removeCalendlyScript,
} from '../../../utils/ThirdParty/calendly';
import { trackEvent } from '../../../utils/gtm';

// Redux Slices
import { RootState } from '../../../redux';
import {
  fetchKycConfigStatus,
  fetchUccStatus,
  getPanAadhaarDetails,
} from '../../../redux/slices/user';

// Contexts
import { ProfileContext } from '../../ProfileContext/ProfileContext';

// API
import { fetchLeadOwnerDetails } from '../../../api/user';

//Hooks
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';

// Styles
import styles from '../../../styles/Profile.module.css';

const mapStateToProps = (state: RootState) => ({
  userData: state.user.userData,
});

const mapDispatchToProps = {
  getPanAadhaarDetails,
  fetchUccStatus,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

interface ProfileProps extends ConnectedProps<typeof connector> {
  pageData: any;
}

declare const window: any;

const Profile: NextPage = (props: ProfileProps) => {
  const [dataLoading, setDataLoading] = useState(true);
  const [userKycData, setUserKycData] = useState([]);
  const [showHeader, setShowHeader] = useState(true);
  const [headerBtn, setHeaderBtn] = useState(true);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [leadOwnerDetails, setLeadOwnerDetails] = useState({
    calendlyLink: '',
  });
  const router = useRouter();
  const dispatch = useAppDispatch();

  const seoData = getSeoData(props.pageData);
  const { default: kycData = {} } = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );

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
    Promise.all([props.getPanAadhaarDetails(), props.fetchUccStatus()]).then(
      () => {
        setDataLoading(false);
      }
    );
    fetchLeadOwnerDetails('calendlyLink')
      .then((res) => {
        setLeadOwnerDetails(res);
      })
      .catch((err) => {
        console.log('error', err);
      });

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
    if (!Object.keys(kycData)?.length) {
      dispatch(fetchKycConfigStatus('', handleKycFetch) as any);
    } else {
      handleKycFetch(kycData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBackClick = () => {
    router.back();
  };

  const onBookWM = () => {
    const { firstName, lastName, emailID, userID } = props.userData;
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
          {dataLoading ? (
            <ProfileSkeleton />
          ) : (
            <>
              <ProfileContext.Provider
                value={{
                  userKycData: userKycData,
                  handleHeaderBtn,
                  onBookWM: loadCalendlyAndBookMeeting,
                  supportPageLinks: getAllLinks(props.pageData),
                  userDetails: props?.userData,
                }}
              >
                <ProfileLayout
                  onBookWM={loadCalendlyAndBookMeeting}
                  handleShowHeader={setShowHeader}
                  headerBtn={headerBtn}
                />
              </ProfileContext.Provider>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps() {
  try {
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
    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default connector(Profile);
