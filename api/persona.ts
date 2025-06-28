import { fetchAPI } from './strapi';

type GetKnowYourInvestorPersonalityResponse = {
  data: {
    investorsPersonality: string;
  };
};

type GetAssetsResultsPersonaResponse = {
  length: number;
  data: AssetsResultsPersona[];
};

export type AssetsResultsPersona = Partial<{
  tenure: string;
  irr: number;
  logo: string;
  partnerName: string;
  category: string;
  name: string;
  assetID: number;
  productCategory: string;
  financeProductType: string;
  rating: string;
  minInvest: number;
  tenureType: string;
  securityCover: string;
  ratedBy: string;
  isRfq: boolean;
}>;

export const getKnowYourInvestorPersonality =
  async (): Promise<GetKnowYourInvestorPersonalityResponse> => {
    return fetchAPI('/v3/users/know-your-investor', {}, {}, true, false);
  };

export const getAssetsResultsPersona = async ({
  limit = 3,
}): Promise<GetAssetsResultsPersonaResponse> => {
  return fetchAPI(
    `/v3/users/persona-result-deals?limit=${limit}&skip=0`,
    {},
    {},
    true,
    false,
    false,
    {},
    true,
    false
  );
};

export function postResponseIdTypeForm({ responseID }) {
  return fetchAPI(
    `/v3/users/know-your-investor`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({ responseID }),
    },
    true
  );
}

export const resetQuiz = async () => {
  return fetchAPI(
    `/v3/users/reset-quiz`,
    {},
    {
      method: 'DELETE',
    },
    true
  );
};
