import type { GCAuthResponse } from '../redux/types/gc';
import { fetchAPI } from './strapi';

export const getRedirectData = (id: string) => {
  return fetchAPI(`/v3/redirect/${id}`, {}, {}, true);
};

export const getRedirectDataUsingJWT = (
  accessToken: string
): Promise<{
  redirectUrl: string;
}> => {
  return fetchAPI(
    `/v3/redirect`,
    {},
    {},
    true,
    true,
    false,
    {
      Authorization: `Bearer ${accessToken}`,
    },
    false
  );
};

export const getGCAuthentation = async (
  id: string
): Promise<GCAuthResponse> => {
  const data: any = await fetchAPI(
    `/v3/users/gci-auth`,
    {},
    {
      method: 'post',
      body: JSON.stringify({
        token: id,
      }),
    },
    true,
    true,
    false,
    {},
    false
  );

  return data?.msg || {};
};
