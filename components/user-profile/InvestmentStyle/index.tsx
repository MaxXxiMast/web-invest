// NODE MODULES
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Components
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import { trackEvent } from '../../../utils/gtm';

// Hooks
import usePersonaTypeForm from '../../../utils/customHooks/usePersonaTypeForm';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../redux/slices/hooks';
import { isGCOrder } from '../../../utils/gripConnect';

// APIs
import { getKnowYourInvestorPersonality } from '../../../api/persona';

// Styles
import styles from './InvestmentStyle.module.css';

const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

export default function InvestmentStyle() {
  const router = useRouter();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery();
  const userID = useAppSelector((state) => state?.user?.userData?.userID) || '';
  const hideKYI =
    useAppSelector(
      (state) =>
        state?.gcConfig?.configData?.themeConfig?.pages?.profile?.hideKYI
    ) || false;

  const isGC = isGCOrder();
  const isKYIHidden = isGC ? hideKYI : false;

  const handleSubmitTypeFormCb = () => {
    trackEvent('quiz_completed', {
      isLoggedIn: !!userID,
    });
    router.push('/persona-results');
  };

  const { openTypeform, showModal, closeTypeform } = usePersonaTypeForm({
    formContainerRef,
    height: isMobile ? Math.min(window.innerHeight, 700) - 30 : 600,
    userID: String(userID),
    handleSubmitCB: handleSubmitTypeFormCb,
  });
  const [personaName, setPersonaName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function getServerData() {
    try {
      const investorPersonalityData = await getKnowYourInvestorPersonality();
      setPersonaName(
        investorPersonalityData?.data?.investorsPersonality?.toUpperCase() || ''
      );
    } catch (e) {
      console.log(e, 'error');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getServerData();
  }, []);

  if (isLoading) {
    return <CustomSkeleton styles={{ width: '100%', height: 16 }} />;
  }

  // When persona is here then we can show the persona and go to the persona page
  // When persona is not here then we can Know your Investment Style and open typeform
  const handleOnClick = () => {
    trackEvent('kyi_banner_clicked', {
      cta_text: personaName ? personaName : 'Know your Investment Style',
      section: 'profile',
      quiz_taken: Boolean(personaName),
      isLoggedIn: Boolean(userID),
    });

    if (Boolean(personaName)) {
      router.push('/persona-results');
    } else {
      // open typeform
      openTypeform();
    }
  };

  return (
    <>
      {isKYIHidden ? null : (
        <div
          className={`items-align-center-row-wise ${styles.textWrap}`}
          onClick={handleOnClick}
        >
          <div>
            {Boolean(personaName) ? personaName : 'Know your Investment Style'}
          </div>
          <span className="icon-caret-right" />
        </div>
      )}
      <MaterialModalPopup
        isModalDrawer={isMobile}
        showModal={showModal}
        closeIconSize={12}
        handleModalClose={closeTypeform}
        closeButtonClass={styles.MobileCloseBtn}
        drawerExtraClass={styles.TypeFormModal}
      >
        <div id="form" ref={formContainerRef}></div>
      </MaterialModalPopup>
    </>
  );
}
