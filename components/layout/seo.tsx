import Head from 'next/head';
import dompurify from 'dompurify';
import { PropsWithChildren } from 'react';

type SeoProps = {
  seo: any;
  isPublicPage?: boolean;
};

const Seo = ({
  seo,
  isPublicPage = false,
  children,
}: PropsWithChildren<SeoProps>) => {
  const sanitizer = dompurify.sanitize;
  const getEnv = function () {
    switch (process.env.NEXT_PUBLIC_GRIP_API_URL) {
      case 'http://gripinvest.in':
      case 'http://www.gripinvest.in':
      case 'https://gripinvest.in':
      case 'https://www.gripinvest.in':
        return 'production';
      default:
        return 'development';
    }
  };

  const getMetaRobots = () => {
    if (getEnv() === 'development') {
      return 'noindex,nofollow';
    }
    if (isPublicPage) {
      return '';
    }

    return seo?.metaRobots;
  };

  const metaRobots = getMetaRobots();

  return (
    <Head>
      {seo?.metaTitle && (
        <>
          <title>{seo.metaTitle}</title>
          <meta property="og:title" content={seo.metaTitle} />
          <meta name="twitter:title" content={seo.metaTitle} />
          <meta name="facebook:title" content={seo.metaTitle} />
        </>
      )}
      {seo?.metaDescription && (
        <>
          <meta name="description" content={seo.metaDescription} />
          <meta property="og:description" content={seo.metaDescription} />
          <meta name="twitter:description" content={seo.metaDescription} />
          <meta name="facebook:description" content={seo.metaTitle} />
        </>
      )}
      {seo?.metaImage && (
        <>
          <meta
            property="og:image"
            content={seo.metaImage?.data?.attributes?.url}
          />
          <meta
            name="twitter:image"
            content={seo.metaImage?.data?.attributes?.url}
          />
          <meta
            name="facebook:image"
            content={seo.metaImage?.data?.attributes?.url}
          />
          <meta name="image" content={seo.metaImage?.data?.attributes?.url} />
        </>
      )}
      {seo?.article && <meta property="og:type" content="article" />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="facebook:card" content="summary_large_image" />

      {seo?.canonicalURL && <link rel="canonical" href={seo.canonicalURL} />}
      {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
      {seo?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: sanitizer(JSON.stringify(seo.structuredData)),
          }}
        />
      )}
      {children}
      {metaRobots && <meta name="robots" content={metaRobots} />}
    </Head>
  );
};

export default Seo;
