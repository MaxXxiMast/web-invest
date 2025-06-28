import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

// Contexts
import { useKycContext } from '../../../../contexts/kycContext';
import { setUpdateFaceMatchAttempt } from '../../../../redux/slices/user';

// APIs
import { handleLivenessStatus, matchImg } from '../../../../api/livenessKyc';
import { handleDocumentUpload } from '../../../../api/rfqKyc';
import {
  fetchDocuments,
  getSignedUrl,
  uploadDocumentToS3,
} from '../../../../api/document';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import {
  DocReqUploadModel,
  LivenessErrorType,
  livelinessModel,
  userDocsType,
  userLocationType,
} from '../../utils/models';
import {
  livenessInfo,
  isUserInIndia,
  base64ToFile,
  urlToBase64,
  getStatusInfo,
  checkUserLocationByIP,
} from '../../utils/livenessUtils';
import { newRelicErrorLog, trackEvent } from '../../../../utils/gtm';
import { isGCOrder } from '../../../../utils/gripConnect';
import { redirectHandler } from '../../../../utils/windowHelper';

import {
  livenessErrorStates,
  livenessInitError,
} from '../../utils/identityUtils';
import { postMessageToNativeOrFallback } from '../../../../utils/appHelpers';

// Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';
import useHyperverge from '../../../../utils/customHooks/useHyperverge';

// Common Components
import Image from '../../../primitives/Image';
import Button from '../../../primitives/Button';
import LocationError from './LocationError';
import ErrorCard from '../../common/ErrorCard';

// Styles
import classes from './KycLiveness.module.css';

const GenericModal = dynamic(() => import('../../common/GenericModal'), {
  ssr: false,
});

const KycLiveness = () => {
  const { kycValues, completedKycSteps, updateCompletedKycSteps } =
    useKycContext();
  const [currentStatus, setCurrentStatus] = useState(
    getStatusInfo('PROCESSING')
  );
  const [isLoading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const hasTrackedRef = useRef(false);
  const hasCapturedRef = useRef(false);


  const [livenessError, setLivenessError] = useState<LivenessErrorType | ''>(
    ''
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const gcConfigDetails = useAppSelector((state) => state.gcConfig);

  // GC callback url
  const gcCallbackUrl = gcConfigDetails?.gcData?.gcCallbackUrl || '';

  // Check if if enabled to go to callback url
  const isRedirectToGCEnabled =
    gcConfigDetails?.configData?.themeConfig?.redirectToPartner
      ?.completeKycWhenBackInIndia || false;

  const { userData, faceMatchRetryAttempt } = useSelector(
    (state: any) => state?.user
  ) as any;
  const [token, setToken] = useState('');
  const [userDocs, setUserDocs] = useState<userDocsType>({
    aadhar: null,
    pan: null,
    aadhar_photo: null,
  });
  let userLocation: userLocationType = {
    lat: null,
    long: null,
  };
  let livenessRes = {
    liveRes: null,
    faceMatchRes: null,
  };

  // Allow retry Count
  const allowRetryAttempt = 2;

  // skip checks & under verification if retry exceeds
  const getSkipCheckStatus = () =>
    Boolean(faceMatchRetryAttempt >= allowRetryAttempt);

  const {
    loadHypervergeSDK,
    removeHyperverge,
    initSDK,
    runLiveliness,
    getExifData,
  } = useHyperverge();

  const handleCloseIconClass = (type = 'add') => {
    const CLOSEICON = document.getElementById('CLOSE_ICON');
    if (CLOSEICON) {
      if (type === 'add') {
        CLOSEICON.classList.add('disable');
      } else {
        CLOSEICON.classList.remove('disable');
      }
    }
  };

  const fetchAndConvert = async (docType: string, userDocs: any) => {
    const document = userDocs?.find((doc: any) => doc?.docSubType === docType);
    if (!document) return null;
    try {
      const link = await getSignedUrl(document);
      return link?.url ? urlToBase64(link.url) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const loadUserDocs = async () => {
    try {
      let docList = userData?.documents || [];

      //check if aadhaar_xml available
      const doc = userData.documents?.find((d: any) =>
        ['aadhaar_xml'].includes(d?.docSubType)
      );
      //if not fetch latest Docs
      if (!doc) {
        const response = await fetchDocuments('user', userData.userID);
        docList = response?.list || [];
      }

      // Check POA Status
      const moduleType = (kycValues as any)?.address?.moduleType;
      const addr = completedKycSteps?.find((ele) => ele.name === 'address');

      const poaStatus = Boolean(
        //if moduleType is not 'kra' and poaStatus verified then use Aadhar
        moduleType !== 'kra' && addr?.status === 1
      );

      const [userPan, userAadhar, userAadharPhoto] = await Promise.all([
        fetchAndConvert('pan', docList),
        poaStatus ? fetchAndConvert('aadhaar_xml', docList) : null,
        poaStatus ? fetchAndConvert('aadhaar_photo', docList) : null,
      ]);

      setUserDocs({
        ...userDocs,
        aadhar: userAadhar,
        pan: userPan,
        aadhar_photo: userAadharPhoto,
      });
      return {
        pan: userPan,
        aadhar: userAadhar,
        aadhar_photo: userAadharPhoto,
      };
    } catch (error) {
      setLivenessError('docFetchError');
      trackEvent('kyc_error', {
        module: 'liveness',
        error_heading: livenessInitError.docFetchError.title,
        error_type: 'docFetchError',
        error_payload: error,
      });
      throw error;
    }
  };
  const loadSDK = async () => {
    try {
      await loadHypervergeSDK();
    } catch (error) {
      setLivenessError('initError');
      trackEvent('kyc_error', {
        module: 'liveness',
        error_heading: livenessInitError.initError.title,
        error_type: 'initError',
        error_payload: error,
      });
      throw error;
    }
  };

const loadDataAndSDK = async () => {
  try {
    if (hasCapturedRef.current) return;
    hasCapturedRef.current = true;      

    const startTime = performance.now();
    await loadSDK();
    setLoading(false);
    const endTime = performance.now();
    const elapsedTime = (endTime - startTime) / 1000;

    trackEvent('capture_selfie_button_loaded', {
      User_id: userData?.userID,
      load_time: `${elapsedTime.toFixed(4)} s`,
    });
  } catch (error) {
    console.log('Error:', error);
  }
};

  useEffect(() => {
    postMessageToNativeOrFallback('kycEvent', {
      kycStep: 'liveness',
    });
  }, []);

  useEffect(() => {
  if (!hasTrackedRef.current) {
    hasTrackedRef.current = true;
    trackEvent('kyc_checkpoint ', {
      module: 'liveness',
    });
    loadDataAndSDK();
  }
  return () => {
    handleCloseIconClass(null);
    removeHyperverge();
  };
}, []);

  const isLocationPermissionAllowed = (resolve, reject) => {
    if (navigator) {
      if ('permissions' in navigator) {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then(function (result) {
            if (result.state === 'denied') {
              checkUserLocationByIP()
                .then((res: any) => {
                  userLocation = { ...res, type: 'ip' };
                  resolve({ isUserInIndia: true });
                })
                .catch((error) => {
                  if (['outOfIndia'].includes(error?.msg)) {
                    // user is out of India
                    userLocation = { ...error?.res, type: 'ip' };
                    newRelicErrorLog('Out of india user');
                    reject('outOfIndia');
                  } else {
                    newRelicErrorLog('locationDenied');
                    reject('locationDenied');
                  }
                });
            }
          })
          .catch((err) => {
            newRelicErrorLog('locationPermissionError');
            reject('locationPermissionError');
          });
        // if error while getting location permission
      } else {
        newRelicErrorLog('Permissions not found');
      }
    } else {
      newRelicErrorLog('Navigator not found');
    }
  };

  const getUserLocation = async () => {
    return new Promise((resolve, reject) => {
      isLocationPermissionAllowed(resolve, reject);

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            userLocation = {
              lat: position.coords?.latitude,
              long: position.coords?.longitude,
              type: 'geoLocation',
            };
            if (
              isUserInIndia(
                position.coords?.latitude,
                position.coords?.longitude
              )
            ) {
              resolve({ isUserInIndia: true });
            } else {
              newRelicErrorLog('Out of india user in geolocation');
              reject('outOfIndia');
            }
          },
          (err) => {
            checkUserLocationByIP()
              .then((res: any) => {
                userLocation = { ...res, type: 'ip' };
                resolve({ isUserInIndia: true });
              })
              .catch((error) => {
                if (['outOfIndia'].includes(error?.msg)) {
                  // user is out of India
                  userLocation = { ...error?.res, type: 'ip' };
                  newRelicErrorLog(
                    'Out of india user in geolocation error',
                    error
                  );
                  reject('outOfIndia');
                } else if (err?.code === 1) {
                  //User Denied Permissions
                  newRelicErrorLog('locationDenied in geolocation');
                  reject('locationDenied');
                } else {
                  newRelicErrorLog('locationDataError');
                  reject('locationDataError'); //if unable to get location co-ordinates
                }
              });
          }
        );
      } else {
        reject('locationBrowserError');
        // if location denied to browser
        newRelicErrorLog('Geolocation not found');
      }
    });
  };

  const handleHVError = async (HVError: any) => {
    // if cancelled by user
    if (HVError?.errorCode === '013') return;

    const exifData = token ? await getExifData() : null;
    const selfieData = {
      HVError,
      userLocation,
      exifData,
      HVResponse: livenessRes,
      faceMatchRetryAttempt,
    };
    trackEvent('kyc_error', {
      module: 'liveness',
      error_heading: HVError?.message || HVError?.errorMsg || HVError,
      error_payload: selfieData,
    });

    //if token expired reset token
    if (HVError?.errorCode === '401') setToken('');

    if (HVError?.errorCode === 442 || HVError?.statusCode === 442) {
      setCurrentStatus({
        ...getStatusInfo('NUDITY_ERR'),
      });
      setShowModal(true);
      return;
    }

    if (HVError?.errorCode === 441 || HVError?.statusCode === 441) {
      setCurrentStatus({
        ...getStatusInfo('NUDITY_ERR'),
        title: 'Potential Nudity Detected',
        subtitle:
          'Verification Failed: Potential nudity detected in the image. Please ensure appropriate content and try again.',
      });
      setShowModal(true);
      return;
    }

    // Handle blurred face (statusCode 438)
    if (HVError?.errorCode === 438 || HVError?.statusCode === 438) {
      setCurrentStatus({
        ...getStatusInfo('DEFAULT_ERR'),
        title: 'Face is Blurred',
        subtitle: 'Please ensure your face is clearly visible and try again.',
      });
      setShowModal(true);
      return;
    }

    // Handle dull face (soft check)
    if (HVError?.errorCode === 'DULL_FACE') {
      setCurrentStatus({
        ...getStatusInfo('DEFAULT_ERR'),
        title: 'Face appears dull',
        subtitle: 'Please ensure good lighting and try again.',
      });
      setShowModal(true);
      return;
    }

    //If error is for image not matching with doc provided
    if (HVError?.message === 'selfieMismatch') {
      setCurrentStatus(getStatusInfo('SELFIE_MISMATCH'));
      setShowModal(true);
      return;
    }

    //failed to detect liveness for the person
    if (['livenessMatchFailed'].includes(HVError)) {
      let defaultError = getStatusInfo('DEFAULT_ERR');
      defaultError = {
        ...defaultError,
        title: 'Unable to verify liveness with selfie',
      };
      setCurrentStatus(defaultError);
      setShowModal(true);
      return;
    }

    // if No camera detected
    if (['CameraNotFound'].includes(HVError) || HVError?.errorCode === '015') {
      setCurrentStatus(getStatusInfo('NO_CAMERA'));
      setShowModal(true);
      return;
    }

    //if camera permission Not Allowed
    if (
      HVError?.errorCode &&
      ['070', '090', '010'].includes(HVError?.errorCode)
    ) {
      setCurrentStatus(getStatusInfo('CAMERA_DENIED'));
      setShowModal(true);
      return;
    }

    // If error is from location status out of India
    if (['outOfIndia'].includes(HVError)) {
      setLivenessError('outOfIndia');
      return;
    }

    // If error is from User denied location permission
    if (['locationDenied'].includes(HVError)) {
      setLivenessError('locationDenied');
      return;
    }

    // If error is from unable to get location data
    if (
      [
        'locationPermissionError',
        'locationDataError',
        'locationBrowserError',
      ].includes(HVError)
    ) {
      setLivenessError('locationDataError');
      return;
    }

    // Update error status if hyperverge error message
    let defaultError = getStatusInfo('DEFAULT_ERR');
    const title = HVError?.msg || HVError?.errorMsg || HVError?.message;
    if (
      title &&
      !['obj', 'undefined', 'null'].some((substring) =>
        title.includes(substring)
      )
    )
      defaultError = {
        ...defaultError,
        title,
      };
    setCurrentStatus(defaultError);
    setShowModal(true);
  };

  const uploadUserImage = async (userImg: File) => {
    try {
      const data: DocReqUploadModel = {
        contentLength: userImg.size,
        docSubType: 'liveness',
        docType: 'kyc',
        filename: userImg.name,
      };
      const response = await handleDocumentUpload(data);

      if (response) {
        const uploadS3 = await uploadDocumentToS3(
          response.url,
          response.fields,
          userImg
        );

        if (uploadS3.status === 204) {
          return response;
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const livenessSuccess = async (imgBase64: string, result: any) => {
    const selfieImgName = `selfie_${new Date().getTime()}.jpg`;
    try {
      const userImg = base64ToFile(imgBase64, selfieImgName);
      const res = await uploadUserImage(userImg);
      if (res) {
        const payload: livelinessModel = {
          filename: res.filename ?? selfieImgName,
          filepath: res.filepath,
          matchScore: result?.['match-score'] ?? 0,
          match: result?.['match'] ?? 'no',
          conf: result?.['conf'] ?? 0,
        };
        const updateStatus = await handleLivenessStatus(payload);
        if (updateStatus) {
          const exifData = await getExifData();
          const selfieData = {
            userLocation,
            exifData,
            HVResponse: livenessRes,
            selfie: res.filepath,
            faceMatchRetryAttempt,
            manual_verification: result?.['match'] !== 'yes',
          };
          trackEvent('liveness_done', selfieData);
          dispatch(setUpdateFaceMatchAttempt(1));
          if (result?.['match'] === 'yes') {
            setCurrentStatus(getStatusInfo('SUCCESS'));
          } else {
            setShowModal(false);
          }
          setTimeout(() => {
            updateCompletedKycSteps({ name: 'liveness', status: 1 });
          }, 1500);
        }
      } else {
        throw new Error('Error uploading user image');
      }
    } catch (error) {
      throw error;
    }
  };

  const livelinessCallback = async (
    HVResponse: any,
    token: string,
    docType: 'userAadhar' | 'userPan' | 'userAadharPhoto' = 'userAadhar'
  ) => {
    setCurrentStatus(getStatusInfo('PROCESSING'));
    setShowModal(true);

    const { imgBase64 } = HVResponse;

    if (getSkipCheckStatus()) {
      livenessSuccess(imgBase64, {}); //retry attempt exceeded, sent to manual verification
      return;
    }

    const docs =
      userDocs?.aadhar || userDocs?.pan || userDocs?.aadhar_photo
        ? userDocs
        : await loadUserDocs();

    if (docType === 'userAadhar' && !docs?.aadhar) {
      if (!docs?.pan && !docs?.aadhar_photo) {
        // If no AadharXML / PAN / AadharPhoto document available, sent to manual verification
        livenessSuccess(imgBase64, {});
        return;
      }
      if (!docs?.pan) {
        // If AadharXML / PAN not available, try checking with AadharPhoto
        return livelinessCallback(HVResponse, token, 'userAadharPhoto');
      }
      // If Aadhar not available, try checking with PAN
      return livelinessCallback(HVResponse, token, 'userPan');
    }

    const docTypes = {
      userAadhar: docs?.aadhar,
      userPan: docs?.pan,
      userAadharPhoto: docs?.aadhar_photo,
    };
    const userDoc = docTypes[docType];
    const res = await matchImg(imgBase64, userDoc, token, userData?.userID);
    const faceMatchData = await res.json();

    if (!res.ok) {
      throw new Error(faceMatchData.error || 'Image matching failed');
    }

    const { data } = faceMatchData;
    livenessRes = { ...livenessRes, faceMatchRes: data?.result };

    if (data?.status === 'success' && data?.result?.match === 'yes') {
      livenessSuccess(imgBase64, data?.result);
    } else if (docType === 'userAadhar' && docs?.pan) {
      //if match failed with AadhaeXML check with PAN
      return livelinessCallback(HVResponse, token, 'userPan');
    } else if (docType === 'userPan' && docs?.aadhar_photo) {
      //if match failed with PAN check with AadharPhoto
      return livelinessCallback(HVResponse, token, 'userAadharPhoto');
    } else {
      throw new Error('selfieMismatch');
    }
  };

  const captureSelfie = async () => {
    handleCloseIconClass();
    setLoading(true);
    let isCameraEnable = true;
    try {
      await getUserLocation();
      const getToken = await initSDK(token, userData?.userID);
      setToken(getToken);
      const HVResponse = await runLiveliness(getToken, getSkipCheckStatus());

      if (HVResponse?.response?.result?.live == 'no') {
        dispatch(setUpdateFaceMatchAttempt(faceMatchRetryAttempt + 1));
        await handleHVError('livenessMatchFailed');
        return;
      }
      if (HVResponse) {
        livenessRes = { ...livenessRes, liveRes: HVResponse?.response?.result };
        dispatch(setUpdateFaceMatchAttempt(faceMatchRetryAttempt + 1));
        await livelinessCallback(HVResponse, getToken);
      }
    } catch (error) {
      // update count for valid selfie checklist

      if (['070', '090', '010'].includes(error?.errorCode))
        isCameraEnable = false;

      if (
        [441, 422, 423, 433, 439].includes(error.errorCode) ||
        ['livenessMatchFailed'].includes(error)
      )
        dispatch(setUpdateFaceMatchAttempt(faceMatchRetryAttempt + 1));
      await handleHVError(error);
    } finally {
      trackEvent('selfie_initiated', {
        camera_premission: isCameraEnable,
      });
      setLoading(false);

      handleCloseIconClass(null);
    }
  };

  const getErrorData = () => {
    switch (livenessError) {
      case 'locationDenied':
      case 'outOfIndia':
        return {
          heading: livenessErrorStates?.[livenessError]?.subtitle,
          cta_text: livenessErrorStates?.[livenessError]?.continueLater,
        };
      default:
        return null;
    }
  };

  const handleLivenessErrorCB = () => {
    const errData = getErrorData();
    if (errData) {
      trackEvent('error_cta_clicked', {
        module: 'liveness',
        error_heading: errData?.heading,
        error_type: livenessError,
        payload: { userLocation },
        cta_text: errData?.cta_text,
      });
    }
    switch (livenessError) {
      case 'outOfIndia': {
        // Platform Redirection
        let redirectedURL = '/discover';

        // If redirect URL is present  AND redirectToPartner config is set to true for the CTA then user should be redirected to the given GC redirect URL.
        // Else user should be redirected to asset list page.
        if (isGCOrder()) {
          if (isRedirectToGCEnabled && gcCallbackUrl) {
            // msg=kyc&status=true/false
            redirectHandler({
              pageUrl: `${gcCallbackUrl}?msg=kyc&status=false`,
              pageName: 'KYCComplete',
            });
            return;
          } else {
            redirectedURL = '/assets';
          }
        }

        router.push(redirectedURL);
        break;
      }
      default:
        window.location.reload();
        break;
    }
  };

  const handleModalCB = () => {
    trackEvent('error_cta_clicked', {
      module: 'liveness',
      error_heading: currentStatus?.title,
      error_type: currentStatus.status,
      payload: { livenessRes },
      cta_text: currentStatus.btnText,
    });
    if (currentStatus?.isReloadButton) {
      window.location.reload();
    } else {
      setShowModal(false);
      captureSelfie();
    }
  };

  if (livenessError)
    return (
      <>
        {['docFetchError', 'initError'].includes(livenessError) ? (
          <ErrorCard
            showBtn
            icon={'icons/DangerTriangle.svg'}
            type={'underVerification'}
            data={
              livenessError === 'docFetchError'
                ? livenessInitError.docFetchError
                : livenessInitError.initError
            }
            buttonText={livenessInitError.btnText}
            buttonVariant="Primary"
            onClickButton={handleLivenessErrorCB}
            showBottomInfo={false}
            trackPayloadDetails={{
              module: 'liveness',
              error_type: currentStatus.status,
              error_payload: { livenessRes },
            }}
          />
        ) : (
          <LocationError
            type={livenessError}
            handleCallBack={handleLivenessErrorCB}
          />
        )}
      </>
    );

  return (
    <div className={classes.KycLivenessContainer}>
      <div className={classes.LivenessLabel}>{livenessInfo.title}</div>
      <div className={`${classes.LivenessInfo} ${classes.tooltipInfo}`}>
        {livenessInfo.subTitle}
      </div>

      <div className={classes.LivenessImageContainer}>
        {
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${GRIP_INVEST_BUCKET_URL}icons/Final_Selfie.gif`}
            alt="Selfie"
          />
        }
      </div>
      <div className={`${classes.LivenessInfo} ${classes.tooltipInfo}`}>
        <span className={`icon-info ${classes.InfoIcon}`} />
        {livenessInfo.tooltipInfo}
      </div>
      <Button
        width={'100%'}
        className={classes.LivenessSubmitButton}
        disabled={isLoading}
        onClick={captureSelfie}
        isLoading={isLoading}
      >
        <>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/camera.svg`}
            alt="camera"
            layout="fixed"
            height={24}
            width={24}
          />
          Capture Selfie
        </>
      </Button>
      <GenericModal
        showModal={showModal}
        lottieType={currentStatus.lottieType}
        title={currentStatus.title}
        subtitle={currentStatus.subtitle}
        icon={currentStatus.icon}
        iconHeight={currentStatus.iconHeight ?? null}
        iconWidth={currentStatus.iconWidth ?? null}
        btnText={currentStatus.btnText}
        handleBtnClick={handleModalCB}
        styledLink={
          currentStatus?.styledLink
            ? {
                title: currentStatus.styledLink.title,
                onClick: () =>
                  window.open(currentStatus.styledLink.link, '_blank'),
              }
            : null
        }
      />
    </div>
  );
};

export default KycLiveness;
