import { socialMediaDeskTop, socialMediaMobile } from './social';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from './string';

describe('socialMediaDeskTop', () => {
  it('should contain correct Whatsapp entry', () => {
    expect(socialMediaDeskTop.Whatsapp).toEqual({
      id: 501,
      src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/Whatsapp.svg`,
      label: 'Whatsapp',
    });
  });

  it('should contain correct Facebook entry', () => {
    expect(socialMediaDeskTop.Facebook).toEqual({
      id: 502,
      src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/Facebook.svg`,
      label: 'Facebook',
    });
  });

  it('should contain correct Twitter entry', () => {
    expect(socialMediaDeskTop.Twitter).toEqual({
      id: 503,
      icon: 'icon-twitter-x',
      label: 'Twitter',
    });
  });

  it('should not include Mail entry', () => {
    expect(socialMediaDeskTop.Mail).toBeUndefined();
  });
});

describe('socialMediaMobile', () => {
  it('should contain correct Mail entry', () => {
    expect(socialMediaMobile.Mail).toEqual({
      id: 401,
      src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/EmailIcon.svg`,
      label: 'Mail',
    });
  });

  it('should contain correct Facebook entry', () => {
    expect(socialMediaMobile.Facebook).toEqual({
      id: 402,
      src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/Facebook.svg`,
      label: 'Facebook',
    });
  });

  it('should contain correct Twitter entry', () => {
    expect(socialMediaMobile.Twitter).toEqual({
      id: 403,
      icon: 'icon-twitter-x',
      label: 'Twitter',
    });
  });

  it('should not include Whatsapp entry', () => {
    expect(socialMediaMobile.Whatsapp).toBeUndefined();
  });
});
