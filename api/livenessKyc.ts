import { livelinessModel } from '../components/user-kyc/utils/models';
import { fetchAPI } from './strapi';

export const getLivenessToken = () => {
  return fetchAPI(
    `/v3/kyc/liveliness/token`,
    {},
    {},
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const handleLivenessStatus = (data: livelinessModel) => {
  return fetchAPI(
    `/v3/kyc/liveliness/store`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const matchImg = (
  userImg: string,
  panImg: string,
  Authorization: string,
  userID: string
) => {
  let headersList = {
    Accept: '*/*',
    'Content-Type': 'application/json',
  };
  let bodyContent = JSON.stringify({
    selfie: userImg,
    id: panImg,
    actualEndpoint: 'https://ind-faceid.hyperverge.co/v1/photo/verifyPair',
    headers: { Authorization, transactionID: userID },
  });
  return fetch('https://hypersnapweb.hyperverge.co/api/proxy/faceMatch', {
    method: 'POST',
    body: bodyContent,
    headers: headersList,
  });
};
