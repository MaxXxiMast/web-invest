export function splitStringIntoEqualParts(str = '') {
  var parts = [];
  for (var i = 0; i < str.length; i += 4) {
    parts.push(str?.slice(i, i + 4));
  }
  return parts;
}

export const errors = {
  attemptLimitExceeded: {
    heading: 'Attempt Limit Exceeded',
    msg: 'We are not able to verify your details from UIDAI as you have reached the maximum attempt limit. We recommend you proceed with DigiLocker to complete this step.',
  },
  unableToGenerateOTP: {
    heading: 'Unable To Generate OTP',
    msg: 'There are currently some challenges with accessing data from UIDAI. Meanwhile please continue via DigiLocker.',
  },
  unexpected: {
    heading: 'OTP Verification Failed',
    msg: 'There are currently some challenges with accessing data from UIDAI. Meanwhile please continue via DigiLocker.',
  },
};
