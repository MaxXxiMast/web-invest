import { fetchAPI } from './strapi';

export const getSignedUrl = (document: any) => {
  return fetchAPI(
    `/v1/documents/${document.module}/${document.docID}`,
    {},
    {},
    true
  );
};

export const fetchAssetDetailsContent = (id: number | string) => {
  return fetchAPI(`/v3/assets/${id}/details`, {}, {}, true);
};
