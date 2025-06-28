// NODE MODULES
import React, { useState } from 'react';
import Cookie from 'js-cookie';
import { useRouter } from 'next/router';

// COMPONENTS
import Image from '../primitives/Image';
import Button, { ButtonType } from '../primitives/Button';

//Hooks
import { useAppSelector } from '../../redux/slices/hooks';

// UTILS
import { fireReferralEvent, trackEvent } from '../../utils/gtm';
import {
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
  isMobileOrEmail,
  isValidEmail,
  isValidMobile,
} from '../../utils/string';
import { isUserLogged } from '../../utils/user';
import { referralConstants, shareIcons } from './constant';
import {
  Icons,
  socialMediaDeskTop,
  socialMediaMobile,
} from '../../utils/social';
import { copy } from '../../utils/customHooks/useCopyToClipBoard';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { isGCOrder } from '../../utils/gripConnect';
import { isRenderedInWebview } from '../../utils/appHelpers';

// API's
import {
  callErrorToast,
  callSuccessToast,
  getGripURL,
  processError,
} from '../../api/strapi';
import { sendReferralInvite } from '../../api/referral';
import { sendOtpApi } from '../../api/login';

// STYLES
import styles from '../../styles/Referral/ReferNowBannerCard.module.css';

const ReferNowBannerCard = ({ data }: any) => {
  const { user = {} } = data;
  const isMobile = useMediaQuery();
  const [isLoggedIn, setLoggedInStatus] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = React.useState(false);
  const [showMobileInvitePopup, setShowMobileInvitePopup] =
    React.useState(false);
  const router = useRouter();
  const [leadId, setleadId] = useState('');
  //senitize change
  const sanitizeInput = (value: string) => value.replace(/\+/g, ''); // Removes '+'

  const isGC = isGCOrder();
  const { gcReferralInviteText = '', gcReferralUrl = '' } =
    useAppSelector(
      (state) => state.gcConfig?.configData?.themeConfig?.pages?.referral
    ) || {};

  React.useEffect(() => {
    setLoggedInStatus(isUserLogged());
    document.addEventListener('click', handleClickOutside, false);
    return () => {
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, []);

  React.useEffect(() => {
    setLoggedInStatus(isUserLogged());
  }, [data.user]);

  const handleCopyToClipboard = () => {
    const referralCode = data?.user?.userData?.referralCode;
    const message =
      isGC && gcReferralUrl
        ? gcReferralUrl?.replace('<referral_code>', referralCode)
        : `${getGripURL()}/?referralCode=${referralCode}&utm_medium=referralLink&utm_source=Copy`;
    copy(message);
    trackEvent('button_clicked', {
      page_name: `referral`,
      cta_text: 'copy_referral_link',
      buttonID: 'copy_referral_link',
    });
    fireReferralEvent('copyReferralLinkFromDashboard');
  };

  const handleEmailInvite = async (leadId: string) => {
    const dataToSend = {
      leadID: leadId,
      type: 'email',
    };
    trackEvent('invite_via_email', {
      invited_email_address: leadId,
      referrer_user_id: user?.userData?.userID,
    });
    sendReferralInvite(dataToSend)
      .then(() => {
        callSuccessToast('Referral Invite Sent');
      })
      .catch((err) => {
        processError(err);
      });
    fireReferralEvent('sendInviteLinkDashboard');
  };

  const handleSendButton = async () => {
    const type = isMobileOrEmail(leadId);
    if (!leadId.length || type == null) {
      callErrorToast('Enter a valid value');
      return null;
    }
    if (type === 'email' && !isValidEmail(leadId)) {
      callErrorToast('Enter a valid Email Id.');
      return null;
    }
    if (type === 'mobile' && !isValidMobile(leadId)) {
      callErrorToast('Enter a valid Mobile No.');
      return null;
    }
    if (!isLoggedIn) {
      sendOtp();
      return null;
    }
    if (type === 'email') {
      await handleEmailInvite(leadId);
    } else {
      callErrorToast('Enter a valid Email Id.');
      return null;
    }
  };
  const redirectToSignUp = () => {
    router.push('/login?signup=true');
  };
  const sendOtp = () => {
    const loginData: any = {
      loginID: leadId,
      mobileCode: '91',
    };
    if (leadId.length < 5 || leadId.length > 100) {
      callErrorToast('Enter a valid email address');
      return;
    }
    sendOtpApi(loginData).then(successfulOtp);
  };
  const successfulOtp = () => {
    Cookie.set('loginID', leadId);
    router.push('/login#verify-otp');
  };

  const getButtonID = (type: Icons) => {
    switch (type) {
      case 'Facebook':
        return 'share_other_facebook';
      case 'Mail':
        return 'share_other_mail';
      case 'Twitter':
        return 'share_other_twitter';
      case 'Whatsapp':
        return 'share_whatsapp';
      default:
        return null;
    }
  };

  const handleEventTrigger = (type: Icons, pageSection: string) => {
    const finalCTAID = getButtonID(type);
    trackEvent('button_clicked', {
      page_name: `referral`,
      cta_text: finalCTAID,
      buttonID: finalCTAID,
      page_section: pageSection,
    });
    fireReferralEvent(referralConstants.gaMappingHome[type]);
  };

  const handleSocialMediaClick = (type: Icons, pageSection: string) => {
    const { userData } = user;
    const shareInfo = shareIcons(
      userData?.referralCode,
      type,
      gcReferralInviteText,
      gcReferralUrl
    );

    handleEventTrigger(type, pageSection);

    if (isGCOrder() && isRenderedInWebview() && type === 'Whatsapp') {
      window.open(shareInfo.iosDeviceWhatsapp, '_blank', 'noopener');
      return;
    }

    // IF IOS MOBILE and Chrome Browser
    if (isMobile && navigator.userAgent.includes('CriOS')) {
      window.open(shareInfo.iosChrome, '_blank', 'noopener');
      return;
    }

    const shareText = isMobile ? shareInfo.mobileText : shareInfo.text;
    window.open(shareText, '_blank', 'noopener');
  };

  const handleClickOutside = (event: any) => {
    const ele = document.getElementById('ShareInviteModal');
    const ele2 = document.getElementById('ShareInvite');
    if (
      ele &&
      !ele?.contains(event.target) &&
      ele2 &&
      !ele2?.contains(event.target)
    ) {
      setShowInvitePopup(false);
    }
  };

  const handleMobileOverlayClick = (event: any) => {
    const ele = document.getElementById('mobileDrawer');
    if (ele && !ele?.contains(event.target)) {
      setShowMobileInvitePopup(false);
    }
  };

  const renderReferralInput = () =>
    !isGC ? (
      <div className={styles.ReferralCodeLeftInner}>
        <input
          type="text"
          name="referralCode"
          id="referralCodeBox"
          placeholder="Invite Link"
          autoComplete="off"
          value={`${getGripURL()}/?referralCode=${
            data?.user?.userData?.referralCode
          }&utm_medium=referralLink&utm_source=Copy `}
        />
        <span onClick={handleCopyToClipboard}>
          <span className="icon-copy" />
        </span>
      </div>
    ) : null;

  const handleOtherButtonClick = () => {
    trackEvent('button_clicked', {
      page_name: `referral`,
      cta_text: 'share_other_mobile',
      buttonID: 'share_other_mobile',
    });
    handleSocialMediaClick('Mail', 'share_invite_mobile');
  };

  const renderIcon = (media: any) => {
    return media?.src ? (
      <Image
        src={media.src} 
        alt={media.label}
        width={20}
        height={20}
        layout={"intrinsic"}
      />
    ) : (
      <span className={media?.icon} />
    );
  };

  return (
    <div id="ReferralBonusCard">
      <div className={styles.ReferNowBannerCard}>
        <div className={styles.ReferNowBannerCardInner}>
          <div className={styles.BannerIcon}>
            <span className={styles.referUnit}>
              <span className="icon-refer-rupees" />
            </span>
          </div>
          <h3 className="Heading2">Refer Now</h3>
          <p className="TextStyle3">
            Get rewards every time your friend invests for the next 6 months!
          </p>
          <div className={styles.EmailBox}>
            {isLoggedIn ? null : (
              <div className={styles.LoginText}>
                Login to refer your friends
              </div>
            )}

            {!isMobile ? (
              <div className={styles.EmailContainer}>
                <input
                  type="email"
                  name="emailAdress"
                  autoComplete="off"
                  placeholder={`${
                    isLoggedIn
                      ? "Enter Your Friend's Email ID"
                      : 'Enter Your Email / Phone'
                  }`}
                  value={leadId} // Controlled input
                  onChange={(e) => setleadId(sanitizeInput(e.target.value))}
                />

                <button type="submit" onClick={handleSendButton}>
                  {isLoggedIn ? 'Invite' : 'Login'}
                </button>
              </div>
            ) : !isLoggedIn ? (
              <div className={styles.EmailContainer}>
                <input
                  type="email"
                  name="emailAdress"
                  placeholder="Enter Your Email / Phone"
                  onChange={(e) => setleadId(e.target.value.replace(/\+/g, ''))}
                />
                <button type="submit" onClick={handleSendButton}>
                  {isLoggedIn ? 'Invite' : 'Login'}
                </button>
              </div>
            ) : null}
          </div>
          {isLoggedIn ? (
            <>
              <div className={styles.ReferralCode}>
                <label htmlFor="referralCodeBox" className="TextStyle1">
                  Share your referral code
                </label>
                <div className={styles.ReferralCodeContainer}>
                  <div className={styles.ReferralCodeLeft}>
                    <div className={styles.ReferralCodeLeftInner}>
                      <input
                        type="text"
                        id="referralCodeBox"
                        name="referralCode"
                        value={data?.user?.userData?.referralCode || ''}
                        disabled
                        autoComplete="off"
                      />
                      <span className={styles.IconButton}>
                        <span
                          className="icon-copy"
                          onClick={handleCopyToClipboard}
                        />
                      </span>
                    </div>
                  </div>

                  <div className={styles.ReferralCodeRight}>
                    <Button
                      id="ShareInvite"
                      className={styles.ShareInvite}
                      onClick={() => {
                        trackEvent('button_clicked', {
                          page_name: `referral`,
                          cta_text: 'share_invite',
                          buttonID: 'share_invite',
                        });
                        setShowInvitePopup(!showInvitePopup);
                      }}
                    >
                      Share Invite
                    </Button>
                    {showInvitePopup && (
                      <div
                        id="ShareInviteModal"
                        className={`${styles.ShareInviteModal} ${
                          showInvitePopup ? 'visible' : 'hidden'
                        }`}
                      >
                        <div className={styles.ShareInviteModalInner}>
                          {renderReferralInput()}
                          <div className={styles.LinkShareList}>
                            <ul>
                              {Object.values(socialMediaDeskTop).map(
                                (media: any, index: number) => (
                                  <li
                                    key={media?.id}
                                    onClick={() =>
                                      handleSocialMediaClick(
                                        media.label,
                                        'share_invite_desktop'
                                      )
                                    }
                                  >
                                    <div
                                      className={`${styles.ShareLinkItem} text-center`}
                                    >
                                      <div className={styles.ShareLinkIcon}>
                                        {renderIcon(media)}
                                      </div>
                                      <p className="TextStyle2 text-center">
                                        {media.label}
                                      </p>
                                    </div>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.MobileShareOptions}>
                <Button
                  className={styles.WhatsAppBtn}
                  onClick={() =>
                    handleSocialMediaClick('Whatsapp', 'share_mobile_whatsapp')
                  }
                  width={'100%'}
                >
                  <>
                    <Image
                      src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/WhatsappWhite.svg`}
                      alt="Whatsapp"
                      layout={"intrinsic"}
                      width={20}
                      height={20}
                    />{' '}
                    WhatsApp
                  </>
                </Button>
                <Button
                  width={'100%'}
                  className={styles.OtherShareBtn}
                  variant={ButtonType.Secondary}
                  onClick={handleOtherButtonClick}
                >
                  <span className={styles.IconButton}>
                    <span className="icon-mail-2" /> Mail
                  </span>
                </Button>
              </div>
            </>
          ) : (
            <div className={`${styles.redirectionText}`}>
              Don&apos;t have an account?{' '}
              <span onClick={redirectToSignUp}>
                <u>SignUp Now</u>
              </span>
            </div>
          )}
        </div>
      </div>
      {showMobileInvitePopup && (
        <div
          className={`${styles.ShareInviteModalMobile} ${
            showMobileInvitePopup ? 'visible' : 'hidden'
          }`}
          onClick={(e) => handleMobileOverlayClick(e)}
        >
          <div className={styles.ShareInviteModalMobileInner} id="mobileDrawer">
            <div
              className={styles.MobileCloseSlot}
              onClick={() => setShowMobileInvitePopup(false)}
            ></div>
            <div
              className={styles.MobileCloseBtn}
              onClick={() => setShowMobileInvitePopup(false)}
            >
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/CloseIcon.svg`}
                alt="CloseIcon"
                layout={'intrinsic'}
                height={12}
                width={12}
              />
            </div>
            <h3 className="Heading4">Share Invite</h3>
            <div className={styles.ReferralCodeLeftInner}>
              <input
                type="text"
                name="referralCode"
                id="referralCodeBox"
                placeholder="Invite Link"
                value={`${getGripURL()}/?referralCode=${
                  data?.user?.userData?.referralCode
                }&utm_medium=referralLink&utm_source=Copy `}
                disabled
                autoComplete="off"
              />
              <span onClick={handleCopyToClipboard}>
                <Image
                  src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/CopyIcon.svg`}
                  alt="CopyIcon"
                  layout={'intrinsic'}
                  height={24}
                  width={24}
                />
              </span>
            </div>
            <div className={styles.LinkShareList}>
              <ul>
                {Object.values(socialMediaMobile).map((media: any) => {
                  return (
                    <li
                      key={media?.id}
                      onClick={() => {
                        handleSocialMediaClick(
                          media.label,
                          'share_invite_mobile'
                        );
                      }}
                    >
                      <div className={`${styles.ShareLinkItem} text-center`}>
                        <div className={styles.ShareLinkIcon}>
                          {renderIcon(media)}
                        </div>
                        <p className="TextStyle2 text-center">{media.label}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferNowBannerCard;
