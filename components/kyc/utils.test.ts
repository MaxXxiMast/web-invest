import {
  isUserEligibleForCkycDownload,
  isUserCkycDownloadCompleted,
  getProfilePhotoURL,
} from './utils';

describe('isUserEligibleForCkycDownload', () => {
  it('should return false when userData is null', () => {
    expect(isUserEligibleForCkycDownload(null)).toBe(false);
  });

  it('should return false when ckycDisabled is true', () => {
    const userData = { ckycDisabled: true };
    //@ts-ignore
    expect(isUserEligibleForCkycDownload(userData)).toBe(false);
  });

  it('should return true when ckycType is CKYC_DOWNLOAD and ckycDisabled is false', () => {
    const userData = { ckycType: 'download', ckycDisabled: false };
    //@ts-ignore
    expect(isUserEligibleForCkycDownload(userData)).toBe(true);
  });
});

describe('isUserCkycDownloadCompleted', () => {
  it('should return false when userData is null', () => {
    expect(isUserCkycDownloadCompleted(null)).toBe(false);
  });

  it('should return false when user is not eligible for CKYC download', () => {
    const userData = { ckycType: 'search', ckycDisabled: false };
    //@ts-ignore
    expect(isUserCkycDownloadCompleted(userData)).toBe(false);
  });

  it('should return true when CKYC download is completed', () => {
    const userData = {
      ckycType: 'download',
      ckycDisabled: false,
      userCKyc: { ckycStatus: 'SUCCESS' },
    };
    //@ts-ignore
    expect(isUserCkycDownloadCompleted(userData)).toBe(true);
  });
});

describe('getProfilePhotoURL', () => {
  it('should return photo URL when photo is a string', () => {
    const userData = { photo: 'http://example.com/photo.jpg' };
    expect(getProfilePhotoURL(userData)).toBe('http://example.com/photo.jpg');
  });

  it('should return signed URL when photo is an object', () => {
    const userData = {
      photo: { signedUrl: 'http://example.com/signed-photo.jpg' },
    };
    expect(getProfilePhotoURL(userData)).toBe(
      'http://example.com/signed-photo.jpg'
    );
  });

  it('should return an empty string when photo is not provided', () => {
    const userData = {};
    expect(getProfilePhotoURL(userData)).toBe('');
  });
});
