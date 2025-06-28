import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

// Styles
import '@typeform/embed/build/css/widget.css';
import styles from './KnowYourInvestor.module.css';

// Primitives
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import Button from '../../primitives/Button';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import usePersonaTypeForm from '../../../utils/customHooks/usePersonaTypeForm';

// Utils
import { toTitleCase, handleExtraProps } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';

// Redux APIS
import { fetchPeronality } from '../../../redux/slices/knowYourInvestor';

interface KnowYourInvestorBottomBannerProps {
  clickFrom?: string;
  isFetchPersonality?: boolean;
  className?: string;
}

export default function KnowYourInvestor({
  clickFrom,
  isFetchPersonality = true,
  className,
}: KnowYourInvestorBottomBannerProps) {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery();
  const router = useRouter();
  const dispatch = useDispatch();

  const customerPersonality =
    useAppSelector((state) => state?.knowYourInvestor.customerPersonality) ||
    '';
  const userID = useAppSelector((state) => state?.user?.userData?.userID) || '';

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

  const quizTitle = 'Do you know your Investment Personality?';
  const quizCta = 'Take the Quiz';
  const resultTitle = `Your Investment Persona: ${toTitleCase(
    customerPersonality
  )}!`;
  const resultCta = 'View your Personality';
  const bottomCta = 'Know Your Investment Style';

  useEffect(() => {
    // Added only for a case inside FooterBanner as it was fetching already inside the Footer Slide
    if (userID && isFetchPersonality) {
      dispatch(fetchPeronality() as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID]);

  const openResultLink = () => {
    router.push('/persona-results');
  };

  const handleClick = () => {
    const page = window.location?.pathname?.split('/')?.[1] || 'homepage';

    const ctaText =
      clickFrom === 'footer'
        ? bottomCta
        : customerPersonality
        ? resultCta
        : quizCta;

    const section = `${page}${clickFrom ? `_${clickFrom}` : ''}`;

    trackEvent('kyi_banner_clicked', {
      cta_text: ctaText,
      section,
      quiz_taken: Boolean(customerPersonality),
      isLoggedIn: Boolean(userID),
    });

    customerPersonality ? openResultLink() : openTypeform();
  };

  const renderModal = () => {
    return (
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
    );
  };

  const renderBannerContent = () => {
    return (
      <div className={styles.ContainerBanner}>
        <div className={styles.LeftContainerBanner}>
          <p className={styles.TitleBanner}>
            {customerPersonality ? resultTitle : quizTitle}
          </p>
          {renderModal()}
        </div>
        <Button
          id="openForm"
          onClick={handleClick}
          width={isMobile ? '100%' : 200}
        >
          {customerPersonality ? resultCta : quizCta}
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className={styles.Container}>
        <p className={styles.Title}>
          {customerPersonality ? resultTitle : quizTitle}
        </p>

        <Button id="openForm" width="100%" onClick={handleClick}>
          {customerPersonality ? resultCta : quizCta}
        </Button>
        {renderModal()}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <>
        <button
          className={`${styles.footerBtn} ${handleExtraProps(className)}`}
          onClick={handleClick}
        >
          {bottomCta}
        </button>
        {renderModal()}
      </>
    );
  };

  switch (clickFrom) {
    case 'banner':
      return renderBannerContent();
    case 'footer':
      return renderFooter();
    default:
      return renderContent();
  }
}
