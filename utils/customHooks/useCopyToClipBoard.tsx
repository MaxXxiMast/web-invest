import { callErrorToast, callSuccessToast } from '../../api/strapi';

type CopyFn = (
  text: string,
  messageSuccess?: string,
  messageError?: string
) => void; // Return success

export const copy: CopyFn = (
  text,
  messageSuccess = 'Link Copied to Clipboard',
  messageError = 'Error Copying to Clipboard'
) => {
  if (!navigator?.clipboard) {
    callErrorToast('Clipboard not supported');
  }

  // Try to save to clipboard then save it in the state if worked
  try {
    navigator.clipboard.writeText(text);
    callSuccessToast(messageSuccess);
  } catch (error) {
    console.warn('Copy failed', error);
    callErrorToast(messageError);
  }
};
