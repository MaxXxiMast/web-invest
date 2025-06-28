import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ProfileSkeleton from '../../skeletons/profile-skeleton/ProfileSkeleton';
import MobileProfile from '../../components/user-profile/MobileProfile/MobileProfile';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

const ProfileDefault = () => {
  const router = useRouter();
  const mobile = useMediaQuery();

  useEffect(() => {
    if (router.pathname === '/profile' && !mobile) {
      router.replace('/profile/accountdetails');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!mobile) {
    return <ProfileSkeleton />;
  }

  return <MobileProfile />;
};

export default ProfileDefault;
