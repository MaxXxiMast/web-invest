type statusType = {
  status: 'success' | 'failure' | 'processing';
  title: string;
  subtitle?: string;
  icon?: string;
  iconHeight?: number;
  iconWidth?: number;
  btnText?: string;
  lottieType?: string;
  styledLink?: {
    title: string;
    link: string;
  };
  isReloadButton?: boolean;
};

export const livenessInfo = {
  title: 'Capture Selfie',
  description:
    'Position your face in the middle of the frame and follow the instructions. Photo should not be blurry and must be evenly lit',
  tooltipInfo:
    'In case the page doesn’t load after giving permissions, try refreshing.',
  subTitle: 'Selfie is mandated by SEBI to enable Bonds, SDIs & Baskets',
};
export const livenessStatus: statusType[] = [
  {
    status: 'failure',
    title: 'There was a problem with verification',
    btnText: 'Re-Capture Selfie',
    icon: 'DangerTriangle.svg',
    lottieType: 'warning',
  },
  {
    status: 'success',
    title: 'Selfie Verified',
    subtitle: 'Redirecting you to the next step...',
    icon: 'check-circle.svg',
    lottieType: 'completed',
  },
  {
    status: 'processing',
    title: 'Verifying Your Selfie',
    subtitle: 'It’ll take up to 10 seconds',
    icon: 'scan.svg',
    lottieType: 'verifying',
  },
  {
    status: 'failure',
    title:
      'Your Selfie didn’t match the picture in documents submitted prior to this step',
    btnText: 'Re-Capture Selfie',
    icon: 'selfieMismatch3.svg',
    iconHeight: 120,
    iconWidth: 180,
  },
  {
    status: 'failure',
    title: 'We couldn’t find a camera connected to your device',
    btnText: 'Re-Capture Selfie',
    icon: 'noCamera.svg',
    styledLink: {
      title: 'Show me how to fix this',
      link: 'https://www.gripinvest.in/blog/how-do-i-enable-my-camera-during-kyc-liveness-verification',
    },
    isReloadButton: true,
  },
  {
    status: 'failure',
    title: 'We couldn’t access your device’s camera',
    subtitle:
      'You denied camera access. We need this for SEBI to process your application',
    btnText: 'I’ve Granted Camera Access',
    icon: 'cameraAccessDenied.svg',
    styledLink: {
      title: 'Show me how to fix this',
      link: 'https://www.gripinvest.in/blog/how-do-i-enable-my-camera-during-kyc-liveness-verification',
    },
    isReloadButton: true,
  },
  {
    status: 'failure',
    title: 'Partial Exposure Detected',
    subtitle:
      'Partial exposure detected in the image. Please ensure appropriate content and try again.',
    btnText: 'Re-Take Selfie',
    icon: 'eyeNudityIcon.svg',
    iconHeight: 72,
    iconWidth: 72,
  },
];

export const getStatusInfo = (
  statusType:
    | 'DEFAULT_ERR'
    | 'SUCCESS'
    | 'PROCESSING'
    | 'SELFIE_MISMATCH'
    | 'NO_CAMERA'
    | 'CAMERA_DENIED'
    | 'NUDITY_ERR'
) => {
  const status = {
    DEFAULT_ERR: 0,
    SUCCESS: 1,
    PROCESSING: 2,
    SELFIE_MISMATCH: 3,
    NO_CAMERA: 4,
    CAMERA_DENIED: 5,
    NUDITY_ERR: 6,
  };
  return livenessStatus[status[statusType]];
};

export const isUserInIndia = (latitude: number, longitude: number) => {
  // Define a bounding box for India
  const indiaBoundingBox = {
    north: 35.5, // Northernmost point
    south: 6.5, // Southernmost point
    west: 68.7, // Westernmost point
    east: 97.4, // Easternmost point
  };

  // Check if the user's coordinates are within the bounding box
  if (
    latitude >= indiaBoundingBox.south &&
    latitude <= indiaBoundingBox.north &&
    longitude >= indiaBoundingBox.west &&
    longitude <= indiaBoundingBox.east
  ) {
    return true; // User is in India
  }
  return false; // User is not in India
};

export const checkUserLocationByIP = () => {
  return new Promise(async (resolve, reject) => {
    await fetch('/api/ipApi')
      .then((res) => res.json())
      .then((res) => {
        if (
          res?.country_code === 'IN' ||
          res?.country_name?.toLowerCase() === 'india'
        ) {
          resolve(res);
        } else {
          reject({ msg: 'outOfIndia', res });
        }
      })
      .catch((error) => {
        reject(error); // Reject on fetch error
      });
  });
};

const getContentTypeFromExtension = (url: string) => {
  const extension = getExtension(url);
  switch (extension.toLowerCase()) {
    case 'pdf':
      return 'application/pdf';
    case 'xml':
      return 'text/xml';
    case 'jpg':
    case 'jpeg':
    case 'jfif':
    case 'pjpeg':
    case 'pjp':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    // Add more cases for other supported file extensions
    default:
      return null; // Unsupported file extension
  }
};

function getExtension(url: string) {
  //get file extension from url
  const parts = url.split('.');
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1];
    // Remove query parameters and any additional text after the extension
    return lastPart.split('?')[0];
  }
  return '';
}

export const urlToBase64 = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
    }
    const contentType = getContentTypeFromExtension(url);
    if (!contentType) {
      throw new Error(`Unsupported file extension: ${getExtension(url)}`);
    }

    // Check if the content type indicates XML
    if (contentType === 'text/xml') {
      const xmlText = await res.text();

      // Parse the XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Extract the base64 image data from the <Pht> element
      const imageElement = xmlDoc.getElementsByTagName('Pht')[0];
      const base64Data = imageElement?.textContent || '';

      if (!base64Data) {
        throw new Error('No image data XML.');
      }

      // Construct the Data URL with the appropriate prefix
      const dataUrl = `data:image/jpeg;base64,${base64Data}`;
      return dataUrl;
    } else {
      // If not XML, handle it as a normal file download
      const blob = await res.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const readData = `${reader.result}`.split('base64,')[1];
          const dataUrl = `data:${contentType};base64,${readData}`;
          resolve(dataUrl);
        };
        reader.onerror = reject;

        // Start reading the blob
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    throw error;
  }
};

export const base64ToFile = (base64Data: string, fileName = 'selfie.jpg') => {
  const mimeType = base64Data.split(':')[1].split(';')[0];
  const decodedData = Uint8Array.from(atob(base64Data.split(',')[1]), (c) =>
    c.charCodeAt(0)
  );
  const blob = new Blob([decodedData], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};
