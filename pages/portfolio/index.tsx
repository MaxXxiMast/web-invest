// NODE MODULES
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';

// Redux
import { useSelector } from 'react-redux';
import { RootState } from '../../redux';

// Components
import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import Seo from '../../components/layout/seo';
import MyInvestments from '../../components/portfolio/my-investments';
import UserPortfolio from '../../components/portfolio-summary';
import MyTransactions from '../../components/my-transactions';
import MyHoldings from '../../components/portfolio/my-holdings';

// Utils
import { trackEvent } from '../../utils/gtm';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

// Contexts
import { PortfolioContext } from '../../components/portfolio-summary/context';

// APIs
import { fetchAPI } from '../../api/strapi';

// Styles
import styles from '../../styles/Portfolio/Portfolio.module.css';

const SUMMARY = 'Summary';
const HOLDINGS = 'My Holdings';
const INVESTMENTS = 'My Investments';
const TRANSACTIONS = 'My Transactions';

const Portfolio: NextPage = () => {
  const [localProps, setLocalProps] = useState({
    loading: true,
    pageData: null,
  });
  const [allowTabs, setAllowTabs] = useState([SUMMARY]);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(null);

  const getData = async () => {
    const data = await getServerData();
    setLocalProps({ loading: false, ...data?.props });
  };
  const portfolioValue = {
    pageData: localProps?.pageData,
  };

  useEffect(() => {
    const routerHash = router.asPath.split('#')[1]; // Get hash part
    const handleUrl = () => {
      if (routerHash === 'my_investments') {
        router.push('/portfolio#my_holdings');
        return;
      }

      // All tabs are now always available
      const updatedTabs = [SUMMARY, HOLDINGS, TRANSACTIONS];

      const matchedTab = updatedTabs.find(
        (ele) => routerHash === handleHashUrl(ele)
      );

      if (matchedTab) {
        setActiveTab(matchedTab);
      } else {
        setActiveTab(SUMMARY); // Default to SUMMARY if no valid tab is found
      }

      // Update state only if tabs have changed
      if (JSON.stringify(allowTabs) !== JSON.stringify(updatedTabs)) {
        setAllowTabs(updatedTabs);
      }
    };

    handleUrl();
  }, [router.asPath]);

  useEffect(() => {
    getData();
  }, []);

  const seoData = localProps?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  const handleHashUrl = (value: string) => {
    if (value === TRANSACTIONS) {
      return 'transactions';
    }

    return value
      .split(' ')
      .map((ele: string) => {
        return ele.toLocaleLowerCase();
      })
      .join('_');
  };

  const handleTabChange = (ele: string) => {
    if (ele === activeTab) return;

    setActiveTab(ele);
    const newUrl = `/portfolio#${handleHashUrl(ele)}`;

    if (router.asPath !== newUrl) {
      router.push(newUrl, undefined, { shallow: true });
    }

    if (window.innerWidth <= 767) {
      window.scroll(0, 0);
    }

    trackEvent('Portfolio Tab Switch', { tab: ele });
  };

  useEffect(() => {
    if (window.innerWidth <= 767) {
      let scrollPosition = 0;
      const headerEle = document.getElementById('NavigationMain');
      const handleScroll = () => {
        const portfolioFilterTab =
          document.getElementById('PortfolioFilterTab');
        const sidebarLinks = document.getElementById('MobileFilterList');

        if (headerEle && portfolioFilterTab) {
          if (window.scrollY > 50) {
            headerEle.classList.add('hideToTop');
            // TAB ONE
            if (activeTab === SUMMARY) {
              portfolioFilterTab.classList.add('boxShadow');
              portfolioFilterTab.classList.remove('withFilter');
            }

            //TAB TWO
            if (activeTab === INVESTMENTS && sidebarLinks) {
              portfolioFilterTab.classList.add('withFilter');
            }
          } else {
            headerEle.classList.remove('hideToTop');
            portfolioFilterTab.classList.remove('boxShadow');
            portfolioFilterTab.classList.remove('floating');
            //TAB TWO
            if (activeTab === INVESTMENTS && sidebarLinks) {
              portfolioFilterTab.classList.remove('withFilter');
            }
          }

          if (activeTab === INVESTMENTS && sidebarLinks) {
            if (scrollPosition < window.scrollY) {
              portfolioFilterTab.classList.remove('floating');
            } else {
              portfolioFilterTab.classList.add('floating');
            }
            scrollPosition = window.scrollY;
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (headerEle) {
          headerEle.classList.remove('hideToTop');
        }
      };
    }
  });

  const getPortfolioBody = () => {
    if (activeTab === INVESTMENTS) return <MyInvestments />;
    else if (activeTab === HOLDINGS) return <MyHoldings />;
    else if (activeTab === TRANSACTIONS) return <MyTransactions />;
    else {
      return (
        <PortfolioContext.Provider value={portfolioValue}>
          <UserPortfolio />
        </PortfolioContext.Provider>
      );
    }
  };

  const getBody = () => {
    return (
      <>
        <div className={styles.PortfolioTabs} id="PortfolioFilterTab">
          <div className={styles.PortfolioTabsInner}>
            <ul>
              {allowTabs.map((ele: string) => {
                return (
                  <li
                    onClick={() => handleTabChange(ele)}
                    key={`item_${ele}`}
                    className={`flex items-center ${
                      activeTab === ele ? styles.Active : ''
                    }`}
                  >
                    {ele}
                    {ele === HOLDINGS && (
                      <span className="flex items-center justify-center gap-2">
                        <Image
                          src={`${GRIP_INVEST_BUCKET_URL}icons/shooting-start.svg`}
                          alt="shooting-star"
                          width={10}
                          height={10}
                        />{' '}
                        NEW
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {getPortfolioBody()}
      </>
    );
  };

  const getSkelton = () => {
    return (
      <div className={styles.Skelton}>
        <CustomSkeleton styles={{ height: 40, width: 100 }} />
        <CustomSkeleton styles={{ height: 40, width: 100 }} />
      </div>
    );
  };

  return (
    <div className={`InnerPageMain ${styles.PortfolioInnerPageMain}`}>
      <Seo seo={seoData} />
      <div className="containerNew">{getBody()}</div>
    </div>
  );
};

async function getServerData() {
  try {
    const [pageData] = await Promise.all([
      fetchAPI(
        '/inner-pages-data',
        {
          filters: {
            url: '/portfolio',
          },
          populate: {
            pageData: {
              populate: {
                seo: {
                  populate: true,
                },
                testimonials: {
                  populate: ['profileImage'],
                },
                images: {
                  populate: ['desktopUrl'],
                },
                slideImage: {
                  populate: ['desktopURL'],
                },
              },
            },
          },
        },
        {},
        false
      ),
    ]);

    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default Portfolio;
