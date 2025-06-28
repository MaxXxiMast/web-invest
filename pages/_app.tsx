import { createContext, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import type { AppProps } from 'next/app';
import App from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import Cookie from 'js-cookie';

// Components
import Main from '../components/layout/main';
import Layout from '../components/layout/layout';
import Toast from '../components/common/Toast';
import MainProvider from '../components/layout/MainProvider';
import ThirdPartyProvider from '../components/layout/ThirdPartyProvider';
import ScriptWrapper from '../components/layout/ScriptWrapper';

// Utils
import store from '../redux/index';
import { fetchAPI } from '../api/strapi';
import { capitalize } from '../utils/string';
import { getSecret } from '../api/secrets';
import { setGlobalAuthSecret } from '../utils/validateResponse';

// Styles
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import AppLayoutWrapper from '../components/layout/AppLayoutWrapper';
import { setServerDown } from '../redux/slices/access';

export const GlobalContext = createContext({});
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const [globalContextData, setGlobalContextData] = useState(null);
  let obppSPVCategory = '';

  if (!globalContextData) {
    const {
      global,
      upiSuggestions,
      constVal,
      debartmentData,
      experimentsData,
      toolsCategory,
      authSecret,
    } = pageProps;

    obppSPVCategory = constVal?.obppSPVCategory;

    const globalContext = {
      ...global?.attributes,
      enableDebartment:
        debartmentData?.enableDebarment === undefined
          ? true
          : debartmentData?.enableDebarment,

      obppSPVCategoryID: (obppSPVCategory as any)?.map(Number) || [],
      linkedinPartnerId: constVal?.linkedin_partner_id,
      obppSPVCategory: constVal?.obppSPVCategory,
      upiSuggestions,
      experimentsData,
      typeFormId: constVal?.typeFormId,
      bank_form_url: constVal?.bank_form_url,
      demat_form_url: constVal?.demat_form_url,
      hideiOS: constVal?.hideiOS,
      hideAndroid: constVal?.hideAndroid,
      toolsCategory,
    };
    setGlobalContextData(globalContext);
    setGlobalAuthSecret(authSecret);
  }

  useEffect(() => {
    store.dispatch(setServerDown(false));
    if (router.pathname !== '/assets') {
      window.history.scrollRestoration = 'manual';
    } else {
      window.history.scrollRestoration = 'auto';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   *  On route change sending event to rudderstack
   */
  useEffect(() => {
    router.events.on('routeChangeStart', onRouteChanged);
    router.events.on('routeChangeComplete', onRouteChangedCompleted);
    return () => {
      router.events.off('routeChangeStart', onRouteChanged);
      router.events.off('routeChangeComplete', onRouteChangedCompleted);
    };
  }, [router]);

  const getPath = () => {
    const pathName = window.location.pathname;
    const pathKeys = pathName?.split('/')?.slice(1);
    let path = '';
    pathKeys.forEach((p: string) => {
      path = `${path}${path.length > 0 ? ' ' : ''}${capitalize(p)}`;
    });
    if (path === '') {
      path = 'Home';
    }
    return path;
  };

  const onRouteChangedCompleted = () => {
    try {
      const path = getPath();
      window['rudderanalytics']?.page(path);
    } catch (e) {
      console.log(e, 'error');
    }
  };

  const onRouteChanged = () => {
    const path = getPath();
    if (Cookie.get('kycSource') && !path.includes('Kyc')) {
      Cookie.remove('kycSource');
    }
    sessionStorage.setItem('lastVisitedPage', window.location.pathname);
  };

  const urlPathName = router.pathname;

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
        />

        <meta
          httpEquiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, orientation=portrait"
        />

        <link
          rel="preconnect"
          href="https://cdn.moengage.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://cdn.moengage.com" />
        <link
          rel="preconnect"
          href="https://sdk-03.moengage.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://sdk-03.moengage.com" />
      </Head>
      <ScriptWrapper linkedinPartnerId={globalContextData?.linkedinPartnerId} />
      <ThirdPartyProvider rudderStackKey={pageProps?.constVal?.rudderKey} />
      <Provider store={store}>
        <MainProvider>
          <Main>
            <GlobalContext.Provider value={globalContextData}>
              {urlPathName.startsWith('/external-ui') ? (
                <Component {...pageProps} />
              ) : (
                <>
                  <Layout>
                    <AppLayoutWrapper>
                      <Component {...pageProps} />
                    </AppLayoutWrapper>
                  </Layout>
                </>
              )}
            </GlobalContext.Provider>
            <ToastContainer limit={1} />
            <Toast />
          </Main>
        </MainProvider>
      </Provider>
    </>
  );
}
MyApp.getInitialProps = async (ctx: any) => {
  //data will be loaded on server side only, client side it will use local component state
  if (!ctx?.ctx?.req) {
    return {};
  }

  const [
    appProps,
    globalRes,
    upiData,
    debartmentData,
    constVal,
    experimentsData,
    toolsCategory,
    authSecret,
  ] = await Promise.all([
    App.getInitialProps(ctx), // Calls page's `getInitialProps` and fills `appProps.pageProps`
    fetchAPI(
      '/global',
      {
        populate: {
          logo: '*',
          headerLinks: {
            populate: '*',
          },
          loggedinHeaderLinks: {
            populate: '*',
          },
          profileLinks: {
            populate: '*',
          },
          footerSections: {
            populate: '*',
          },
          Footer: {
            populate: {
              socialMedia: {
                populate: '*',
              },
              footerLogo: {
                fields: ['url', 'alternativeText'],
              },
              terms: {
                populate: '*',
              },
              privacy: {
                populate: '*',
              },
              investorCorner: {
                populate: '*',
              },
              contactUs: {
                populate: '*',
              },
              addressImage: {
                populate: '*',
              },
            },
          },
        },
      },
      {},
      false
    ),
    fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/upi-suggestions',
        },
        populate: '*',
      },
      {},
      false
    ),
    fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/debarment',
        },
        populate: {
          pageData: {
            populate: '*',
          },
        },
      },
      {},
      false
    ),
    fetchAPI('/inner-pages-data', {
      filters: {
        url: '/constants',
      },
      populate: '*',
    }),
    fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/experiments-data',
        },
        populate: '*',
      },
      {},
      false
    ),
    fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/tools',
        },
        populate: '*',
      },
      {},
      false
    ),
    getSecret('auth.encryption_key'),
  ]);

  // Pass the data to our page via props
  return {
    ...appProps,
    pageProps: {
      global: globalRes?.data,
      upiSuggestions:
        upiData?.data[0]?.attributes?.pageData[0]?.objectData?.upiSuggestions,
      constVal: constVal?.data[0]?.attributes?.pageData[0]?.objectData,
      debartmentData:
        debartmentData?.data?.[0]?.attributes?.pageData?.[0]?.objectData,
      experimentsData:
        experimentsData?.data?.[0]?.attributes?.pageData?.[0]?.objectData ?? {},
      toolsCategory:
        toolsCategory?.data[0]?.attributes?.pageData[0]?.objectData,
      authSecret: authSecret?.value,
    },
  };
};

export default MyApp;
