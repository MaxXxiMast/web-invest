import Head from 'next/head';
import KnowYourInvestor from '../../components/know-your-investor/layout';

export default function PersonaResult() {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=SUSE:wght@100..800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <KnowYourInvestor />
    </>
  );
}
