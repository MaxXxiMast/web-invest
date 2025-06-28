import newrelic from 'newrelic';
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';
type NewRelicProps = {
  browserTimingHeader: string;
};
class MyDocument extends Document<NewRelicProps> {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps & NewRelicProps> {
    const initialProps = await Document.getInitialProps(ctx);
    const browserTimingHeader = newrelic.getBrowserTimingHeader({
      hasToRemoveScriptWrapper: true,
    });
    return {
      ...initialProps,
      browserTimingHeader,
    };
  }
  render() {
    return (
      <Html>
        <Head>
          <script
            defer
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: this.props.browserTimingHeader,
            }}
          />
          {/* Non-blocking load of external font CSS to improve performance */}
          <link
            rel="stylesheet"
            href="https://static-assets.gripinvest.in/grip-icons/CSS/FontIcon.module.css"
            media="all"
            onLoad={(e) => {
              const link = e.currentTarget as HTMLLinkElement;
              link.media = 'all';
            }}
          />
          {/* Fallback stylesheet for users who have JavaScript disabled */}
          <noscript>
            <link
              rel="stylesheet"
              href="https://static-assets.gripinvest.in/grip-icons/CSS/FontIcon.module.css"
            />
          </noscript>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
export default MyDocument;
