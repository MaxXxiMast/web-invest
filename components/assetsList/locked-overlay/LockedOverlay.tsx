import { useContext, useEffect, useState } from 'react';

//Components
import DealLock from '../../../components/assets/static/assetList/DealLock.svg';
import Image from '../../primitives/Image';
import InvestorConsentKYC from '../InvestorConsentKyc';
import NoAccessBanner from '../InvestorNoAccessBanner';
import ResidentKYC from '../ResidentKyc';
import TermAndConditionsConsent from '../TermAndConditionsConsent';

//Redux
import {
  getKYCDetailsList,
  getSpvDetailsList,
} from '../../../redux/slices/spvDetails';
import { AssetsContext } from '../../../pages/assets';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { updateUserKYCConsent } from '../../../redux/slices/user';

//Utils
import {
  assetListConsentForAif,
  showContactBanner,
  showNoInvestmentBanner,
  showBanner,
  showContactBannerMessage,
  showNoInvestBannerMessage,
  checkValidResidentialStatus,
  getResidentialStatusMapping,
} from './utils';

import {} from '../../../utils/user';

import useHash from '../../../utils/customHooks/useHash';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { getActiveStateByHash } from '../../../utils/assetList';

//Styles
import styles from './LockedOverlay.module.css';

const LockedOverlay = ({
  className = '',
  handleKycCheck = (val = false) => {},
}) => {
  const {
    onSubmitKYCConsent = () => {},
    getAssets = () => {},
    showAIFConsent = () => {},
    setShowAifConsent = () => {},
  } = useContext(AssetsContext);

  const { kycTypes = {}, spvList: spvDetailsList = [] } = useAppSelector(
    (state) => state.spvDetails
  );
  const { kycConsent: userKYCConsent, userData } = useAppSelector(
    (state) => state.user
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getSpvDetailsList());
    dispatch(getKYCDetailsList());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSpvDetailsId = () => {
    const dealsToShow = getAssets();
    return dealsToShow?.map((deal: any) => Number(deal.spvType));
  };

  const { hash } = useHash();
  const { offerType: tab } = getActiveStateByHash(hash);

  const [showKYCDetails, setShowKycDetails] = useState(true);
  const [showResident, setShowResident] = useState(false);
  const handleKYCRendering = (kycTypes: any, showBanners: showBanner) => {
    const { showConnectBannerUser, showNoInvestBannerUser } = showBanners;

    const filteredKYCIDs = userKYCConsent?.map(
      (consent: any) => consent.kycType
    );

    const showUserKYCs = kycTypes?.filter(
      (kyc: any) =>
        Boolean(kyc?.content) &&
        !filteredKYCIDs.includes(kyc.id) &&
        assetListConsentForAif.includes(kyc.type)
    );

    if (
      showUserKYCs.length &&
      !(showConnectBannerUser || showNoInvestBannerUser)
    ) {
      const kycRenderContent = showUserKYCs?.[0];

      if (kycRenderContent) {
        handleKycCheck(true);
        const content = JSON.parse(kycRenderContent?.content);
        if (kycRenderContent.type === 'commercial_tnc') {
          return (
            <TermAndConditionsConsent
              heading={content?.heading}
              values={content?.values}
              onSubmit={() => {
                const data = {
                  kycType: kycRenderContent.id,
                  content: '1',
                };
                onSubmitKYCConsent(data, kycRenderContent.type);
              }}
              subHeading={content?.subHeading}
              showMobileDialog={showAIFConsent}
              onCloseDrawer={() => {
                setShowAifConsent(false);
              }}
              type={content?.type}
            />
          );
        } else if (kycRenderContent.type === 'accredited_investor_consent') {
          return (
            <InvestorConsentKYC
              heading={content?.heading}
              subHeading={content?.subHeading}
              type={content?.type}
              values={content.values}
              id={kycRenderContent.id}
              onSubmit={(data) =>
                onSubmitKYCConsent(data, kycRenderContent.type)
              }
            />
          );
        } else if (kycRenderContent.type === 'client_identification') {
          const showResidentKyc = !checkValidResidentialStatus(userData);
          if (!showResidentKyc) {
            dispatch(
              updateUserKYCConsent({
                kycType: 7,
                content: getResidentialStatusMapping(
                  userData?.residentialStatus
                ),
              })
            );
            return null;
          }

          return (
            <ResidentKYC
              heading={content?.heading}
              subHeading={`${content?.subHeading}`}
              type={content?.type}
              values={content.values}
              id={kycRenderContent.id}
              onSubmit={(data) => {
                onSubmitKYCConsent(data, kycRenderContent.type);
                setShowResident(false);
              }}
              showResident={setShowResident}
            />
          );
        }
      }
    } else {
      setShowKycDetails(false);
    }
  };

  const renderBanners = (
    showNoInvestBannerUser: boolean,
    showContactBannerUser: boolean
  ) => {
    if (showNoInvestBannerUser) {
      handleKycCheck(true);
      return (
        <NoAccessBanner
          message={showNoInvestBannerMessage('foreign', 'none')}
          header={'Sorry, You can’t invest in these assets'}
          url={`${GRIP_INVEST_BUCKET_URL}ifa/no-investors.svg`}
        />
      );
    } else if (showContactBannerUser) {
      handleKycCheck(true);
      return (
        <NoAccessBanner
          message={showContactBannerMessage('foreign')}
          header={'We can connect!'}
          url={`${GRIP_INVEST_BUCKET_URL}ifa/no-investors.svg`}
        />
      );
    } else {
      return null;
    }
  };

  let spvKycs: any[] = [];
  const spvDetailIDs = getSpvDetailsId();

  spvDetailsList?.forEach((spvDetail: any) => {
    if (spvDetailIDs.includes(spvDetail?.id)) {
      spvKycs = [...spvKycs, ...spvDetail?.spvKycs];
    }
  });

  const kycType = spvKycs
    ?.map((kyc: any) => {
      const kycTypeDetails = kycTypes?.find(
        (kycType: any) => kycType.id === kyc.kycType
      );
      return {
        displayOrder: kyc?.displayOrder,
        kycType: kyc?.kycType,
        content: kycTypeDetails?.content,
        type: kycTypeDetails?.type,
        id: kycTypeDetails?.id,
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const kycTypeIDs = kycType?.map((kycType: any) => kycType.id);
  const showNoInvestBannerUser = userKYCConsent.some(
    (consent: any) =>
      kycTypeIDs?.includes(consent.kycType) &&
      showNoInvestmentBanner(consent.content)
  );
  const showConnectBannerUser = userKYCConsent.some(
    (consent: any) =>
      kycTypeIDs?.includes(consent.kycType) &&
      showContactBanner(consent.content)
  );

  const showBanners = {
    showNoInvestBannerUser,
    showConnectBannerUser,
  };

  if (tab.title !== 'Past Offers') {
    if (showKYCDetails) {
      return (
        <div className={`${styles.LockedOverlay} ${className}`}>
          <div
            className={styles.LockedOverlayLeft}
            style={{
              width: showResident ? 'calc(50% - 15px)' : 'calc(30% - 15px)',
            }}
          >
            <div className={styles.ImageContainer}>
              <Image src={DealLock} alt="DealLock" />
            </div>
          </div>
          <div
            className={styles.LockedOverlayRight}
            style={{
              width: showResident ? 'calc(50% - 15px)' : 'calc(70% - 15px)',
            }}
          >
            <div className={styles.ContentContainer}>
              {handleKYCRendering(kycType, showBanners)}
            </div>
          </div>
        </div>
      );
    } else if (showNoInvestBannerUser || showConnectBannerUser) {
      return (
        <div className={`${styles.LockedOverlay} ${className}`}>
          {renderBanners(showNoInvestBannerUser, showConnectBannerUser)}
        </div>
      );
    } else {
      return null;
    }
  }
  return null;
};

export default LockedOverlay;
