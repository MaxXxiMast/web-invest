import { getStrapiMedia, getStrapiMediaS3Url } from './media';
import { getStrapiURL } from '../api/strapi';

jest.mock('../api/strapi', () => ({
  getStrapiURL: jest.fn((path: string) => `https://cms.example.com${path}`),
}));

describe('getStrapiMedia', () => {
  test('returns full URL using getStrapiURL when name starts with "/"', () => {
    const media = {
      data: {
        attributes: {
          name: '/uploads/sample.jpg',
        },
      },
    };
    const result = getStrapiMedia(media);
    expect(getStrapiURL).toHaveBeenCalledWith('/uploads/sample.jpg');
    expect(result).toBe('https://cms.example.com/uploads/sample.jpg');
  });

  test('returns name directly when it is a full URL', () => {
    const media = {
      data: {
        attributes: {
          name: 'https://external.cdn.com/image.jpg',
        },
      },
    };
    const result = getStrapiMedia(media);
    expect(result).toBe('https://external.cdn.com/image.jpg');
  });
});

describe('getStrapiMediaS3Url', () => {
  test('returns full URL if it starts with "http"', () => {
    const media = {
      data: {
        attributes: {
          url: 'https://s3.amazonaws.com/bucket/image.jpg',
        },
      },
    };
    const result = getStrapiMediaS3Url(media);
    expect(result).toBe('https://s3.amazonaws.com/bucket/image.jpg');
  });

  test('returns empty string if url does not start with "http"', () => {
    const media = {
      data: {
        attributes: {
          url: '/uploads/image.jpg',
        },
      },
    };
    const result = getStrapiMediaS3Url(media);
    expect(result).toBe('');
  });

  test('returns null if media is null', () => {
    const result = getStrapiMediaS3Url(null);
    expect(result).toBeNull();
  });

  test('returns null if media.data is undefined', () => {
    const result = getStrapiMediaS3Url({});
    expect(result).toBeNull();
  });

  test('returns null if media.data.attributes is undefined', () => {
    const result = getStrapiMediaS3Url({ data: {} });
    expect(result).toBeNull();
  });
});
