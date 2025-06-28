// NODE MODULES
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

// Components
import AssetData from '../AssetsPersona';
import CloseLineIcon from '../../assets/CloseLineIcon';
import LoggedOutState from '../LoggedOutState';
import PersonaCard from '../PersonaCard';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import GenericModal from '../../user-kyc/common/GenericModal';
import KYILoader from '../KYILoader';

// Utils
import { handleExtraProps } from '../../../utils/string';
import { isUserLogged } from '../../../utils/user';
import { useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { trackEvent } from '../../../utils/gtm';
import { delay } from '../../../utils/timer';
import { personaData } from '../PersonaCard/utils';

// Hooks
import usePersonaTypeForm from '../../../utils/customHooks/usePersonaTypeForm';

// api
import {
  AssetsResultsPersona,
  getAssetsResultsPersona,
  resetQuiz,
} from '../../../api/persona';
import { fetchAPI } from '../../../api/strapi';

import {
  fetchPeronality,
  SetAndGetPeronality,
  setCustomerPersonality,
} from '../../../redux/slices/knowYourInvestor';

// Styles
import styles from './KnowYourInvestor.module.css';

let isLoaded = false; //Flag to prevent multiple API calls on rerender

export default function KnowYourInvestor() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.user);
  const isPersonalityLoading = useAppSelector(
    (state) => state.knowYourInvestor.isLoading
  );
  const personaName = useAppSelector(
    (state) => state.knowYourInvestor.customerPersonality
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openLoggedOutModal, setOpenLoggedOutModal] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assetsData, setAssetsData] = useState<AssetsResultsPersona[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [personaStrapiData, setPersonaStrapiData] = useState({});

  const isLoggedInUser = isUserLogged();

  const formContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery();
  const hidePersonaBg = !personaName && !isFormSubmitted;

  const personaResponseId = sessionStorage.getItem('personaTypeFormResponseId');

  const handleSubmitTypeFormCBCB = async (personalityType: string) => {
    trackEvent('quiz_completed', {
      isLoggedIn: isLoggedInUser,
      personalityType: personalityType,
    });
    router.push('/persona-results');
  };

  const handlePersonalitySetter = async (response_id: string) => {
    sessionStorage.removeItem('personaTypeFormResponseId');
    setIsLoading(true);
    await delay(3000);
    await dispatch(
      SetAndGetPeronality(response_id, () => {
        setIsLoading(false);
      }) as any
    );
  };

  useEffect(() => {
    if (!isLoggedInUser || !personaName) {
      // adding this condition to prevent loading data when user deleted his persona , dataLoading gets true and it never gets false
      setIsDataLoading(false);
      return;
    }

    const loadAllData = async () => {
      setIsDataLoading(true);
      try {
        // Load deals
        const finalAssets = await getAssetsResultsPersona({ limit: 3 });
        setAssetsData(finalAssets?.data || []);

        // Load Strapi data
        const pageData = await fetchAPI(
          '/inner-pages-data',
          {
            filters: { url: '/persona-personality' },
            populate: {
              pageData: {
                on: {
                  'shared.json-object': {
                    populate: '*',
                  },
                },
              },
            },
          },
          {},
          false
        );

        const strapiDataObj =
          pageData?.data?.[0]?.attributes?.pageData?.find(
            (item) => item?.__component === 'shared.json-object'
          )?.objectData || {};

        const finalDataObj = Object.keys(strapiDataObj).length
          ? strapiDataObj
          : personaData;

        setPersonaStrapiData(finalDataObj);
      } catch (e) {
        console.error('Error loading data:', e);
        setPersonaStrapiData(personaData); // fallback for strapi
      } finally {
        setIsDataLoading(false);
      }
    };

    loadAllData();
  }, [isLoggedInUser, personaName]);

  const handleSubmitTypeFormCb = async (response_id: string) => {
    setIsFormSubmitted(true);
    if (!isLoggedInUser) {
      setOpenLoggedOutModal(true);
    } else {
      setIsLoading(true);
      await delay(3000);
      await dispatch(
        SetAndGetPeronality(response_id, handleSubmitTypeFormCBCB) as any
      );
      setIsLoading(false);
    }
  };

  const { openTypeform, showModal, closeTypeform } = usePersonaTypeForm({
    formContainerRef,
    height: isMobile ? Math.min(window.innerHeight, 700) - 30 : 600,
    userID: user?.userData?.userID ? String(user?.userData?.userID) : '',
    handleSubmitCB: handleSubmitTypeFormCb,
  });

  useEffect(() => {
    if (isLoggedInUser && !personaName) {
      dispatch(fetchPeronality() as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logged Out User Flow new form
  useEffect(() => {
    if (
      !isLoading &&
      !isLoggedInUser &&
      !isFormSubmitted &&
      !personaResponseId
    ) {
      openTypeform();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedInUser, personaName, openTypeform]);

  // Logged Out User Flow when form is submitted
  useEffect(() => {
    if (
      !openLoggedOutModal &&
      !isLoggedInUser &&
      !isFormSubmitted &&
      personaResponseId
    ) {
      setOpenLoggedOutModal(true);
    }
  }, [openLoggedOutModal, isLoggedInUser, isFormSubmitted, personaResponseId]);

  // Logged In User Flow when form is already submitted and when form is not submitted
  useEffect(() => {
    const handleOnLoad = () => {
      if (!isLoggedInUser) return;

      if (!isPersonalityLoading && !personaName) {
        if (personaResponseId) {
          handlePersonalitySetter(personaResponseId);
        } else {
          openTypeform();
        }
      }
    };

    if (!isLoaded) {
      handleOnLoad();
    }
    isLoaded = true;

    return () => {
      isLoaded = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTypeFormClose = () => {
    closeTypeform();
    if (router.pathname === '/persona-results') {
      router.back();
    }
  };

  const renderTypeFormModal = () => {
    return (
      <MaterialModalPopup
        isModalDrawer={isMobile}
        showModal={showModal}
        closeIconSize={12}
        handleModalClose={handleTypeFormClose}
        closeButtonClass={styles.MobileCloseBtn}
        drawerExtraClass={styles.TypeFormModal}
        isShowBackDrop={showModal}
      >
        <div className="form" ref={formContainerRef}></div>
      </MaterialModalPopup>
    );
  };

  const handleOnClose = () => {
    router.back();
  };

  const handleRetakeQuiz = () => {
    trackEvent('retake_quiz', {
      personality_type: personaName,
    });
    setIsModalOpen(true);
  };

  const handleYesRetakeQuiz = () => {
    trackEvent('confirm_retake_quiz', {
      personality_type: personaName,
    });
    dispatch(setCustomerPersonality(''));
    openTypeform();
    resetQuiz();
    setIsModalOpen(false);
  };

  const handleNoRetakeQuiz = () => {
    trackEvent('cancel_retake_quiz', {
      personality_type: personaName,
    });
    setIsModalOpen(false);
  };

  const renderRetakeButton = (className = '') => {
    return (
      <div
        className={`${styles.retakeQuiz} ${handleExtraProps(className)}`}
        onClick={handleRetakeQuiz}
      >
        Retake Quiz
      </div>
    );
  };

  const renderAssetData = () => {
    return <AssetData assetsData={assetsData} />;
  };

  const renderHeader = (className = '') => {
    return (
      <div
        className={`items-align-center-row-wise justify-between ${
          styles.header
        } ${handleExtraProps(className)}`}
      >
        <span className={styles.title}>{'Your Investment Persona'}</span>
        <div
          className={`flex_wrapper ${styles.closeButton}`}
          onClick={handleOnClose}
        >
          <CloseLineIcon width="15" height="15" />
        </div>
      </div>
    );
  };

  const renderPersonaCard = () => {
    return (
      <PersonaCard personaStrapiData={personaStrapiData}>
        {renderRetakeButton(`${styles.underline} ${styles.HideMobile}`)}
      </PersonaCard>
    );
  };

  if (isLoggedInUser && (isLoading || isPersonalityLoading || isDataLoading)) {
    return <KYILoader />;
  }

  return (
    <>
      {!hidePersonaBg ? (
        <div className={`items-align-center-row-wise ${styles.container}`}>
          {renderHeader(styles.HideDesktop)}
          <div className="containerNew">
            <div className={styles.MainContainer}>
              {renderHeader(styles.HideMobile)}

              <div className={`flex ${styles.SectionsContainer}`}>
                {renderPersonaCard()}
                {renderAssetData()}
              </div>

              {renderRetakeButton(`${styles.HideDesktop}`)}
            </div>
          </div>
        </div>
      ) : (
        <div className={`items-align-center-row-wise ${styles.container}`} />
      )}
      <LoggedOutState openModal={openLoggedOutModal} />
      {isModalOpen && (
        <GenericModal
          hideIcon
          showModal={isModalOpen}
          isModalDrawer={true}
          handleModalClose={() => setIsModalOpen(false)}
          title="Are you sure?"
          btnText="No"
          btnVariant="Secondary"
          handleBtnClick={handleNoRetakeQuiz}
          btnSecText="Yes"
          BtnSecVariant="Primary"
          handleSecBtnClick={handleYesRetakeQuiz}
          BtnContainerExtraClass={styles.BtnContainerExtraClass}
        />
      )}
      {renderTypeFormModal()}
    </>
  );
}
