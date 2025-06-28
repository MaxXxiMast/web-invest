import type { NextPage } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import Cookie from 'js-cookie';
import dynamic from 'next/dynamic';
import { connect } from 'react-redux';

import {
  ApplyNow,
  BannerSection,
  FAQ,
  HowItWorks,
  ReferralEarnings,
} from '../../components/ReferEarn';
import Seo from '../../components/layout/seo';

import { RootState } from '../../redux';
import { useAppDispatch } from '../../redux/slices/hooks';
import { fetchUserInfo, getUserKycDocuments } from '../../redux/slices/user';
import { fetchReferralDetails } from '../../redux/slices/referral';

import { getEnv } from '../../utils/constants';
import { trackEvent } from '../../utils/gtm';

import { fetchAPI } from '../../api/strapi';

// Import Swiper styles
import 'swiper/css';
import { isUserLogged } from '../../utils/user';
import ReferralProgramBreakBanner from '../../components/ReferEarn/ReferralProgramBreakBanner';
import { GlobalContext } from '../_app';

const Security = dynamic(() => import('../../components/Security'), {
  ssr: false,
});

const ReferEarn: NextPage = (props: any) => {
  const [isDevEnvironment, setIsDevEnvironment] = useState(false);
  const [isDevLoggedIn, setIsDevLoggedIn] = useState(false);
  const { experimentsData }: any = useContext(GlobalContext);

  const updateDevLoggedInMethod = () => {
    setIsDevLoggedIn(Cookie.get('devLoggedIn') === 'true');
  };
  useEffect(() => {
    if (getEnv() !== 'production') {
      setIsDevEnvironment(true);
      updateDevLoggedInMethod();
    }
  }, [isDevEnvironment]);

  useEffect(() => {
    updateDevLoggedInMethod();
  }, [isDevLoggedIn]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    props.fetchReferralDetails();
    if (isUserLogged()) {
      props?.getUserKycDocuments(props?.user?.userData?.userID);
    }
    dispatch(fetchUserInfo(props.user?.userData?.userID?.toString()));
    //* anytime an entity needs to be slid up when in view, we can add the class "slide-up" to it and it should just work
    const sliders = document.querySelectorAll('.slide-up');

    //* threshold: 1 works for our case, but it waits for the element to appear fully in the viewport
    const appearOptions = {
      threshold: 0.3,
    };

    const appearOnScroll = new IntersectionObserver(function (
      entries,
      appearOnScroll
    ) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          appearOnScroll.unobserve(entry.target);
        }
      });
    },
    appearOptions);

    sliders.forEach((slider) => {
      appearOnScroll.observe(slider);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props?.user?.userData?.userID) {
      trackEvent('refer_and_earn', {
        referral_code: props?.user?.userData?.referralCode,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.user?.userData?.userID]);

  const faqData = props?.pageData?.filter(
    (item: any) => item.__component === 'shared.faq'
  );
  const seoData = props?.pageData?.filter(
    (item: any) => item.__component === 'shared.seo'
  )[0];

  const extraReferralData = props?.pageData?.filter(
    (item: any) => item.__component === 'shared.json-object'
  )?.[0];

  const earnMoreDetails = extraReferralData?.objectData?.['earnMore'];

  const scrollTo = () => {
    const header = document.getElementById('ReferralBonusCard');
    window.scroll({
      behavior: 'smooth',
      left: 0,
      top: window.scrollY + header.getBoundingClientRect().top - 80,
    });
  };

  const ApplyNowData = {
    title: 'Start Referring Today!',
    subTitle: `Unlock Rewards: Start Your Referral Journey Today!`,
    button: {
      onClick: () => {
        scrollTo();
      },
      label: 'Refer Now',
    },
  };

  const ReferralOnBreak = {
    title: 'Our referral program is on a break !',
    subTitle: `We are re-designing the referral program for you, and we will be back soon.`,
  };

  if (!experimentsData?.showReferral) {
    return (
      <ReferralProgramBreakBanner data={ReferralOnBreak} showButton={false} />
    );
  }

  return isDevEnvironment && !isDevLoggedIn ? (
    <Security onChangeLoggedIn={setIsDevLoggedIn} />
  ) : (
    <>
      <Seo seo={seoData} isPublicPage />
      <BannerSection
        data={{
          user: props.user,
          campaignName: extraReferralData?.objectData?.campaignName,
          validTo: extraReferralData?.objectData?.campaignValidTill,
        }}
      />
      <ReferralEarnings earnMoreContent={earnMoreDetails} />
      <HowItWorks />
      <ApplyNow data={ApplyNowData} />
      <FAQ data={faqData} />
    </>
  );
};
const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

const mapDispatchToProps = {
  fetchReferralDetails,
  getUserKycDocuments,
};

export async function getServerSideProps() {
  try {
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/referral',
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

export default connect(mapStateToProps, mapDispatchToProps)(ReferEarn);
