import { fetchAPI } from '../../api/strapi';

export const fetchAIResponse = async (
  query: string,
  assetID: number,
  signal: AbortSignal
) => {
  try {
    const response = await fetchAPI(
      `/v3/ai-assist/${assetID}`,
      { question: query },
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      },
      true
    );
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Fetch request aborted');
    } else {
      console.error('Error fetching AI response:', error);
    }
    return null;
  }
};
