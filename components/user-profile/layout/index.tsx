// NODE MODULES
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

// UTILS
import { SectionType } from '../utils/sidebar';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { SectionMapping } from './common/utils';
import { trackEvent } from '../../../utils/gtm';

// CUSTOM COMPONENTS
import { FormTitle } from '../section-title';
import ProfileSidebar from '../sidebar';
import ProfileCardRfq from '../profile-card';
import ProfileHeader from '../header';
import CompleteKYCNudge from '../CompleteKYCNudge';

// Redux Slices
import { logout } from '../../../redux/slices/user';

// STYLESHEETS
import classes from './ProfileLayout.module.css';

type Props = {
  onBookWM?: () => void;
  handleShowHeader?: (val: boolean) => void;
  headerBtn?: boolean;
};

const ProfileLayout = ({ onBookWM, handleShowHeader, headerBtn }: Props) => {
  const isMobile = useMediaQuery();
  const router = useRouter();
  const dispatch = useDispatch();

  const [showEditModal, setShowEditModal] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>(null);

  const handleEditModal = () => {
    setShowEditModal((pre) => !pre);
  };

  useEffect(() => {
    if (isMobile) {
      handleShowHeader(!activeSection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const allowedRoutes = [
    'accountdetails',
    'mydocuments',
    'wealthmanager',
    'support',
    'preferences',
    'signOut',
    'terms',
    'mytransactions',
    'termsandconditions',
  ];

  const handleChange = (val: SectionType, route = '') => {
    if (val && !allowedRoutes.includes(val)) {
      router.push('/404');
      return;
    }

    trackEvent('button_clicked', {
      page_name: `Profile Page`,
      page_section: val,
    });

    if (val === 'preferences') {
      router.push('/preferences');
      return;
    }

    if (val === 'signOut') {
      dispatch(logout({ isAutoLogout: false, redirect: '' }) as any);
      return;
    }

    if (val === 'mytransactions') {
      router.push(route ?? '/transactions');
      return;
    }

    if (val === 'wealthmanager') {
      router.push(route ?? '/profile/support');
      return;
    }

    // The UTM Params should not be considered
    const slug = router.query.slug;
    if (slug) {
      setActiveSection(slug as SectionType);
    }

    if (val) {
      router.replace(`/profile/${val}`);
    }
  };

  useEffect(() => {
    if (router?.asPath) {
      const pathSegments = router?.asPath.split('/');
      const slugPart = pathSegments?.includes('profile')
        ? pathSegments[pathSegments?.indexOf('profile') + 1]
        : pathSegments[1];

      handleChange(slugPart as SectionType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  return (
    <>
      {((!activeSection && isMobile) || !isMobile) && (
        <ProfileCardRfq
          className={classes.RfqProfileCard}
          onBookClick={onBookWM}
        />
      )}

      {isMobile && !activeSection ? <CompleteKYCNudge /> : null}

      <div className={`flex ${classes.Layout}`}>
        {((!activeSection && isMobile) || !isMobile) && (
          <div className={classes.Sidebar}>
            <ProfileSidebar
              handleChange={handleChange}
              active={activeSection}
              className={classes.Sidebar}
            />
          </div>
        )}

        {activeSection && (
          <div className={`flex-column 6546564 ${classes.Wrapper}`}>
            {isMobile && (
              <ProfileHeader
                showRightBtn={false}
                title={SectionMapping[activeSection]?.title}
                showEditBtn={
                  headerBtn && SectionMapping[activeSection]?.showEditBtn
                }
                handleEditModal={handleEditModal}
                showEditModal={showEditModal}
                editData={{
                  editTitle: SectionMapping[activeSection]?.editText,
                  subtitle: SectionMapping[activeSection]?.editText,
                }}
                className={classes.SectionHeader}
                onBackClick={() => {
                  setActiveSection(null);
                  router.replace('/profile');
                }}
              />
            )}

            <FormTitle
              className={classes.Title}
              title={SectionMapping[activeSection]?.title}
              isSectionTitle={true}
              showEditBtn={
                headerBtn && SectionMapping[activeSection]?.showEditBtn
              }
              showEditModal={showEditModal}
              editData={{
                editTitle: SectionMapping[activeSection]?.editText,
                subtitle: SectionMapping[activeSection]?.editText,
              }}
              handleEditModal={handleEditModal}
            />
            {SectionMapping[activeSection]?.component}
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileLayout;
