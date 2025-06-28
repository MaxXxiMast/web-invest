// NODE MODULES
import { useRouter } from 'next/router';

// Components
import LottieModal from '../GenericModal/LottieModal';
import FDCompletedUI from '../FDCompleted/FDCompletedUI';

// Redux toolkit
import { useAppSelector } from '../../../../redux/slices/hooks';

// Utils
import { NomineeStatus } from '../../utils/NomineeUtils';
import { generateAssetURL } from '../../../../utils/asset';
import { isAnyStepUnderVerification } from '../../utils/helper';
import { isGCOrder } from '../../../../utils/gripConnect';
import { redirectHandler } from '../../../../utils/windowHelper';

// Contexts
import { useKycContext } from '../../../../contexts/kycContext';

// styles
import classes from './KYCComplete.module.css';

export default function KYCComplete() {
  const router = useRouter();

  const assetDetails = useAppSelector((state) => state?.access?.selectedAsset);

  // GC User redirected to url
  const gcURL = useAppSelector((state) => state.gcConfig.gcData?.redirectURL);
  const gcConfigDetails = useAppSelector((state) => state.gcConfig);

  // GC callback url
  const gcCallbackUrl = gcConfigDetails?.gcData?.gcCallbackUrl || '';

  // Check if if enabled to go to callback url
  const isRedirectToGCEnabled =
    gcConfigDetails?.configData?.themeConfig?.redirectToPartner
      ?.exploreInvestmentOpportunities || false;

  const { completedKycSteps } = useKycContext();

  // User should be redirected to asset details page if came from the asset details page
  // else the user should be redirected to the discover page.
  const handleClick = (isKYCComplete = false) => {
    let redirectURL = '/assets';
    if (assetDetails?.assetID) {
      redirectURL = generateAssetURL(assetDetails);
    } else if (isGCOrder()) {
      // msg=kyc&status=true/false
      // When Callback url is present and redirect url is enabled
      if (isRedirectToGCEnabled && gcCallbackUrl) {
        redirectHandler({
          pageUrl: `${gcCallbackUrl}?msg=kyc&status=${isKYCComplete}`,
          pageName: 'KYCComplete',
        });
        return;
      }

      // For GC Redirect the user from kyc to the original page
      const urlObjt = new URL(gcURL);

      // Should go to original when not in user-kyc
      if (!urlObjt?.pathname.includes('user-kyc')) {
        redirectURL =
          (urlObjt?.pathname || '') +
          (urlObjt?.search || '') +
          (urlObjt?.hash || '');
      }
    }

    router.push(redirectURL);
  };

  const renderKYCStatus = () => {
    const isOBPPNotReady = isAnyStepUnderVerification(completedKycSteps);
    const content: any = isOBPPNotReady
      ? NomineeStatus.addressBankUnderVF
      : NomineeStatus.success;

    return (
      <FDCompletedUI
        content={{
          heading: content.title,
          subHeading: content.subtitle,
        }}
        buttons={[
          {
            label: content?.btnText || 'Explore Assets',
            onClick: () => handleClick(content?.status === 'success'),
          },
        ]}
      />
    );
  };

  return (
    <div className={`flex-column ${classes.Wrapper}`}>
      {LottieModal({ lottieType: 'completed' })}
      {renderKYCStatus()}
    </div>
  );
}
