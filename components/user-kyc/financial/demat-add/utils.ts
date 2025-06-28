import { fetchAPI } from '../../../../api/strapi';

export const InvestmentDescription =
  'Your Demat Account is required to settle investments in SDIs, Bonds & Baskets';

export const GmailNote = 'We do not fetch any other data from your Gmail';

export const isGmail = (emailID) => {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(emailID);
};

export const handleGcRedirect = async () => {
  return fetchAPI(
    '/v3/redirect/generate?page=user-kyc&query=fetchViaGmailClicked',
    {},
    {},
    true,
    true,
    true
  );
};
