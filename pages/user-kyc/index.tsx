// NODE_MODULES
import React, { useEffect } from 'react';

// Component
import Layout from '../../components/user-kyc/layout/layout';
import LoadingComponent from '../../components/user-kyc/layout/skeleton';

// Hooks
import { usePageLoading } from '../../utils/customHooks/usePageLoading';

// API
import { fetchAPI } from '../../api/strapi';

// Context
import { KycContextProvider } from '../../contexts/kycContext';

const UserKyc = () => {
  const [aadhaarXMLFlowCheck, setAadhaarXMLFlowCheck] = React.useState(false);
  const [ifscConfig, setIfscConfig] = React.useState({});
  const { isPageLoading } = usePageLoading();

  useEffect(() => {
    getServerData().then((data) => {
      if (data) {
        setAadhaarXMLFlowCheck(data.aadhaarXMLFlowCheck);
        setIfscConfig(data.ifscConfig);
      }
    });
  }, []);

  if (isPageLoading) {
    return <LoadingComponent />;
  }

  return (
    <KycContextProvider
      aadhaarXMLFlowCheck={aadhaarXMLFlowCheck}
      ifscConfig={ifscConfig}
    >
      <Layout />
    </KycContextProvider>
  );
};

async function getServerData() {
  try {
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/user-kyc',
        },
        populate: {
          pageData: {
            populate: '*',
          },
        },
      },
      {},
      false
    );

    return {
      aadhaarXMLFlowCheck:
        pageData?.data?.[0]?.attributes?.pageData?.find(
          (d: any) => d?.keyValue === 'config'
        )?.objectData?.aadhaarXMLFlow ?? false,
      ifscConfig:
        pageData?.data?.[0]?.attributes?.pageData?.find(
          (d: any) => d?.keyValue === 'ifsc-config'
        )?.objectData ?? {},
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default UserKyc;
