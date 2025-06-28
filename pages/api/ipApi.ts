import { NextApiRequest, NextApiResponse } from 'next';
import { getSecret } from '../../api/secrets';

interface CustomNextApiRequest extends NextApiRequest {
  file?: any;
}

export default async function handler(
  req: CustomNextApiRequest,
  res: NextApiResponse
) {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ipApiKey = await getSecret('ipapi.secret_key');
  const thirdPartyLocationServiceURL = `https://ipapi.co/${clientIp}/json/?key=${ipApiKey?.value}`;
  let apiResponse = {};
  try {
    const apiData = await fetch(thirdPartyLocationServiceURL);
    apiResponse = await apiData.json();
  } catch (error) {
    console.error('Error fetching location details: ', error);
  }
  res.status(200).send({
    ...apiResponse,
    'x-forwarded-for': req.headers['x-forwarded-for'],
    remoteIpAddr: req.socket.remoteAddress,
  });
}
