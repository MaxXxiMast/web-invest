// Node Modules
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

// Redux Slices
import { setKYCProcessing } from '../../redux/slices/rfq';

// Components
import Image from '../../components/primitives/Image';
import AnimatedArrow from '../../components/primitives/AnimatedArrow';

// Utils / Helpers
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { DigilockerResponseModel } from '../../components/user-kyc/utils/models';
import { trackEvent } from '../../utils/gtm';
import { GripLogo } from '../../utils/constants';

// APIs
import { callErrorToast } from '../../api/strapi';
import { fetchAadhaarDetailsFromDg } from '../../api/rfqKyc';

// Styles
import styles from './KYCProcessing.module.css';

export default function KYCProcessing() {
  const id = new URLSearchParams(window?.location?.search).get('id');

  // GET UserID
  const { userID = '' } = useSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );

  const router = useRouter();
  const dispatch = useDispatch();

  const routeToKYC = () => {
    setTimeout(() => {
      trackEvent('kyc_redirect', { page: '/kyc-processing', userID: userID });
      router.push('/user-kyc');
    }, 100);
  };

  const safeParseErrorMessage = (errorMessage: string): string => {
    try {
      const parsed = JSON.parse(errorMessage);
      return parsed?.message || errorMessage;
    } catch {
      return errorMessage;
    }
  };

  useEffect(() => {
    // Call Digilocker Aadhar Fetch API

    fetchAadhaarDetailsFromDg(id)
      .then((response: DigilockerResponseModel) => {
        trackEvent('digilocker_fetched', {
          poa_name: response.userName,
          details_payload: {
            ...response,
          },
          kra_eligible: 'false',
          aadhaar_fetched: 'true',
          manual_verification: response.status === 2,
        });
        dispatch(
          setKYCProcessing({
            isError: false,
            data: response,
          })
        );
        routeToKYC();
      })
      .catch((err) => {
        trackEvent('kyc_error', {
          module: 'digilocker',
          error_heading: err?.heading,
          error_type: err?.type,
          error_payload: err,
        });
        dispatch(
          setKYCProcessing({
            isError: true,
            data: { ...err, errValidity: new Date().getTime() + 20 * 1000 },
          })
        );
        callErrorToast(
          safeParseErrorMessage(err?.message) || 'Something went wrong'
        );
        routeToKYC();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`containerNew ${styles.Container}`}>
      <div className={styles.LoadingContainer}>
        <div className={styles.KRAIconContainer}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/digilocker.svg`}
            alt="KRA Logo"
            width={91}
            height={53}
            layout="fixed"
          />
          <AnimatedArrow />
          <Image
            src={GripLogo}
            alt="Grip"
            width={83}
            height={30}
            layout="fixed"
          />
        </div>
        <div className={styles.Heading}>
          Fetching Aadhaar details from DigiLocker
        </div>
        <div className={styles.SubHeading}>It will take just 20 seconds!</div>
      </div>
    </div>
  );
}
