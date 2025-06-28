import { newRelicErrLogs } from './gtm';

type RedirectFnProps = {
  pageUrl: string;
  pageName?: string;
};

/**
 * Handles redirection to a specified URL and logs the action.
 * @param {RedirectFnProps} props - The properties for the redirection.
 * @param {string} props.pageUrl - The URL to redirect to.
 * @param {string} [props.pageName=''] - The name of the page being redirected to (optional).
 */
export const redirectHandler = ({
  pageUrl,
  pageName = '',
}: RedirectFnProps) => {
  try {
    // Log the redirection attempt
    newRelicErrLogs('window_href_redirection', 'info', {
      pageUrl: pageUrl,
      redirectionPage: pageName,
    });

    // Perform the redirection
    window.location.href = pageUrl;
  } catch (error) {
    // Log any errors that occur during redirection
    newRelicErrLogs('window_href_redirection_error', 'error', {
      pageUrl: pageUrl,
      redirectionPage: pageName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Optionally, rethrow the error or handle it as needed
    throw new Error(
      `Redirection failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};
