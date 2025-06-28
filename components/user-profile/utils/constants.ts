import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

export const profileKYCMessages = {
  isUnderVerification: (docType: string) => ({
    title: `${docType} is under verification`,
    subTitle: 'We will get back to you soon!',
    icon: `${GRIP_INVEST_BUCKET_URL}icons/under-verification-lg.svg`,
  }),
};
