import CryptoJS from 'crypto-js';

/**
 * Generates a hash for the given response object and salt.
 * @param {object} response - The response object.
 * @param {string} salt - The secret salt.
 * @returns {string} - The generated hash.
 */

function generateHashWithSalt(
  response: Record<string, any>,
  salt: string
): string {
  // Sort the object keys
  const sortedKeys = Object.keys(response).sort();
  const sortedObject = sortedKeys.reduce((obj, key) => {
    obj[key] = response[key];
    return obj;
  }, {} as Record<string, any>);

  // Stringify the sorted object
  const stringified = JSON.stringify(sortedObject);

  // Generate the HMAC hash
  return CryptoJS.HmacSHA256(stringified, salt).toString(CryptoJS.enc.Hex);
}

// Static context handler
let globalAuthSecret = '';

export const setGlobalAuthSecret = (secret: string) => {
  if (secret) {
    globalAuthSecret = secret;
  }
};

export default async function validateResponse(response: any) {
  const responseToken = response.headers.get('x-response-token');
  const text = await response.text();
  if (!text) return;

  const data = JSON.parse(text);

  const salt = globalAuthSecret;

  if (data && salt && responseToken) {
    const clientHash = generateHashWithSalt(data, salt);

    // Validate the token
    if (clientHash === responseToken) {
      return data;
    } else {
      throw new Error('Invalid response data!');
    }
  } else {
    if (!salt) {
      throw new Error('Invalid verification key');
    }
    if (!responseToken) {
      throw new Error('Invalid response token provided');
    }
    throw new Error('Invalid response data!');
  }
}
