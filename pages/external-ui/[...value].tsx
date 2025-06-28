import type { NextPage } from 'next';
import GCExternalUI from '../../components/gci/GCExternalUI';
import { newRelicErrLogs } from '../../utils/gtm';

const ExternalUIPage: NextPage = ({ urlToken }: any) => {
  return <GCExternalUI urlToken={urlToken} />;
};

export async function getServerSideProps(context: any) {
  // Query Value is the value of the query parameter
  const urlParam = context?.params?.value?.[0];

  if (
    !urlParam ||
    urlParam === 'undefined' ||
    typeof urlParam === 'undefined'
  ) {
    newRelicErrLogs('Login_error_GC_404_page', 'error', {
      errorMessage: '404 redirection',
    });
    return {
      notFound: true,
    };
  }

  return {
    props: {
      urlToken: urlParam?.toString(),
    },
  };
}

export default ExternalUIPage;
