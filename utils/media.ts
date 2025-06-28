import { getStrapiURL } from '../api/strapi';

export function getStrapiMedia(media: any) {
  const { name } = media.data.attributes;
  const imageUrl = name.startsWith('/') ? getStrapiURL(name) : name;
  return imageUrl;
}

export function getStrapiMediaS3Url(media: any) {
  if (!media || !media?.data || !media?.data?.attributes) {
    return null;
  }
  const { url } = media?.data?.attributes;
  return url?.startsWith('http') ? url : '';
}
