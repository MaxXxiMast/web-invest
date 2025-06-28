import { loadHyperverge } from '../ThirdParty/scripts';
import { getLivenessToken } from '../../api/livenessKyc';

const useHyperverge = () => {
  const loadHypervergeSDK = () => {
    return new Promise(async (resolve, reject) => {
      try {
        await loadHyperverge();
        if (HyperSnapSDK && HyperSnapParams?.Region?.India) {
          resolve({ success: true });
        } else {
          reject(new Error('Failed to load hyper-verge-sdk'));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const initSDK = (token: string, transactionID: string) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        HVCamModule?.detectWebcam().then((cameraDetected: any) => {
          if (!cameraDetected) {
            reject('CameraNotFound');
          }
        });
        let res = { token };
        if (!token) res = await getLivenessToken();
        if (res.token) {
          await HyperSnapSDK.init(res.token, HyperSnapParams.Region.India);
          await HyperSnapSDK.startUserSession(transactionID);
          resolve(res.token);
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const runLiveliness = (token: string, disableValidation: boolean) => {
    return new Promise<any>((resolve, reject) => {
      try {
        const hvFaceConfig = new HVFaceConfig();
        const livenessValidations = {
          rejectFaceMask: 'yes',
          allowEyesClosed: 'no',
          allowMultipleFaces: 'no',
          rejectBlur: 'yes',
          checkDull: 'yes',
          rejectNudity: 'yes',
        };
        hvFaceConfig.setLivenessAPIParameters(
          disableValidation ? {} : livenessValidations
        );
        hvFaceConfig.faceTextConfig.setFaceInstructionsTitle(
          'Selfie capture Tips'
        );
        hvFaceConfig.setShowCameraPermissionsScreen(false);
        HVFaceModule.start(hvFaceConfig, (HVError: any, HVResponse: any) => {
          if (HVError) {
            reject(HVError);
          } else {
            const result = HVResponse?.response?.result;
            // Handle dull face (soft check)
            if (result?.qualityChecks?.dull?.value === 'yes') {
              reject({
                errorCode: 'DULL_FACE',
                message: 'Face appears dull.',
              });
              return;
            }
            if (result?.live === 'yes' || disableValidation) {
              resolve(HVResponse);
            } else {
              reject('livenessMatchFailed');
            }
          }
        });
      } catch (error) {
        throw error;
      }
    });
  };

  const getExifData = () => {
    return new Promise((resolve, reject) => {
      HyperSnapSDK.extractExifData((hvExifData: any) => {
        if (hvExifData) {
          resolve(hvExifData);
        } else {
          reject(new Error('Failed to get Exif data'));
        }
      });
    });
  };

  const removeHyperverge = () => {
    const scriptElement = document.getElementById('hypervergeScript');
    if (scriptElement) {
      scriptElement.parentNode.removeChild(scriptElement);
    }
  };
  return {
    initSDK,
    loadHypervergeSDK,
    runLiveliness,
    getExifData,
    removeHyperverge,
  };
};

export default useHyperverge;
