//NODE MODULES
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

//COMPONENTS
import Button, { ButtonType } from '../components/primitives/Button';
import Image from '../components/primitives/Image';
import Seo from '../components/layout/seo';
import BackdropComponent from '../components/common/BackdropComponent';

//API
import { fetchAPI } from '../api/strapi';

//UTILS
import { getStrapiMediaS3Url } from '../utils/media';
import { GRIP_INVEST_BUCKET_URL } from '../utils/string';
import { NoFoundPage, defaultData } from '../utils/page-not-found';

//STYLESHEETS
import styles from '../styles/NoPageFound.module.css';

export default function FourOhFour({ data }: { data: NoFoundPage }) {
  const router = useRouter();

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    router.events.on('routeChangeStart', () => setShowLoader(true));
    router.events.on('routeChangeComplete', () => setShowLoader(false));

    return () => {
      router.events.off('routeChangeStart', () => setShowLoader(true));
      router.events.off('routeChangeComplete', () => setShowLoader(false));
    };
  }, [router]);

  const goToPage = (url: string) => {
    router.push(url);
  };

  const renderNotFoundPage = () => {
    return (
      <div className={`flex justify-between ${styles.containerPage}`}>
        <div className={`${styles.notFound}`}>
          <Image
            src={
              getStrapiMediaS3Url(data?.image?.desktopUrl) ||
              `${GRIP_INVEST_BUCKET_URL}${defaultData.image.dekstopUrl}`
            }
            alt={data?.image?.altText || defaultData?.image.altText}
            className={styles.notFoundImage}
          />
        </div>

        <div className={`flex direction-column ${styles.notFoundDetails}`}>
          <div className={styles.header}>
            {data?.header || defaultData?.header}
          </div>
          <div className={styles.subHeader}>
            {data?.subHeader || defaultData?.subHeader}
          </div>

          <Button
            variant={ButtonType.Primary}
            className={styles.primaryButton}
            onClick={() =>
              goToPage(data?.button?.clickUrl || defaultData?.button?.clickUrl)
            }
          >
            {data?.button?.label || defaultData?.button?.label}
          </Button>
          <div
            className={`flex items-center ${styles.backButtonContainer}`}
            onClick={() =>
              goToPage(
                data?.homeButton?.clickUrl || defaultData?.homeButton?.clickUrl
              )
            }
          >
            <span className={styles.backButton}>
              <Image
                layout={'fixed'}
                width={12}
                height={12}
                src={`${GRIP_INVEST_BUCKET_URL}commons/LeftCaret.svg`}
                alt="leftcaretlogo"
              />
            </span>

            <span className={styles.secondaryText}>
              {data?.homeButton?.label || defaultData?.homeButton?.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Seo seo={data?.seo} />
      {showLoader ? (
        <BackdropComponent open={showLoader} />
      ) : (
        renderNotFoundPage()
      )}
    </>
  );
}

export async function getStaticProps() {
  try {
    const noFoundPageResult = await fetchAPI('/no-found-pages', {
      populate: {
        image: {
          populate: '*',
        },
        button: {
          populate: '*',
        },
        homeButton: {
          populate: '*',
        },
        seo: {
          populate: '*',
        },
      },
    });

    return {
      props: {
        data: noFoundPageResult?.data?.[0]?.attributes || {},
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {
      props: {},
    };
  }
}
