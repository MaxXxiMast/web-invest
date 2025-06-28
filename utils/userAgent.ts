const getBrowserName = () => {
  const userAgent = navigator?.userAgent || '';
  let browser: string;
  if (userAgent.includes('GSA')) {
    browser = 'GSA';
  } else if (userAgent.includes('Opera') || userAgent.includes('Opr')) {
    browser = 'Opera';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else {
    browser = 'Unknown';
  }
  return browser;
};

const getDeviceType = () => {
  const userAgent = navigator?.userAgent || '';
  let deviceType: string;
  if (
    /Windows Phone/i.test(userAgent) ||
    /Android/i.test(userAgent) ||
    /iPhone|iPad|iPod/i.test(userAgent)
  ) {
    deviceType = 'Phone';
  } else if (/Windows NT/i.test(userAgent) || /Macintosh/i.test(userAgent)) {
    deviceType = 'Laptop';
  } else {
    deviceType = 'Unknown';
  }
  return deviceType;
};

type Ostype = 'Android' | 'iOS' | 'Windows' | 'Mac' | 'Linux' | 'Unknown';

export const getOS = (): Ostype => {
  const userAgent = navigator?.userAgent || '';
  let os: Ostype;
  if (/Android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = 'iOS';
  } else if (/Windows/.test(userAgent)) {
    os = 'Windows';
  } else if (/Macintosh/.test(userAgent)) {
    os = 'Mac';
  } else if (/Linux/.test(userAgent)) {
    os = 'Linux';
  } else {
    os = 'Unknown';
  }
  return os;
};

const getDeviceOrientation = () => {
  let deviceOrientation: string = 'Unknown';
  if (window !== undefined && window?.matchMedia) {
    if (window?.matchMedia('(orientation: portrait)').matches) {
      deviceOrientation = 'Portrait';
    } else if (window?.matchMedia('(orientation: landscape)').matches) {
      deviceOrientation = 'Landscape';
    }
  }

  return deviceOrientation;
};

const getNetwotkType = () => {
  const networkType =
    (navigator as Navigator & { connection?: { effectiveType?: string } })
      ?.connection?.effectiveType || 'Unknown';
  return networkType;
};

export const trackAgentParams = () => {
  return {
    browser: getBrowserName(),
    os: getOS(),
    deviceType: getDeviceType(),
    device_orientation: getDeviceOrientation(),
    'network Type': getNetwotkType(),
  };
};
