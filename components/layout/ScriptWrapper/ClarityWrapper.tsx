import { useEffect, useState } from 'react';
import Script from 'next/script';
import { fetchAPI } from '../../../api/strapi';

export default function ClarityWrapper() {
  const [clarityKey, setClarityKey] = useState('');

  const loadClarity = async () => {
    const result = await fetchAPI(
      '/poQgjpmbbJsRfLNVPANsTLtW',
      {},
      {
        method: 'post',
        body: JSON.stringify({
          key: 'thirdparty.clarity',
        }),
      },
      true
    );
    setClarityKey(result?.value);
  };

  useEffect(() => {
    loadClarity();
  }, []);

  return clarityKey ? (
    <Script id="clarity-script" strategy="afterInteractive">
      {`
                (function (c, l, a, r, i, t, y) {
                  c[a] =
                    c[a] ||
                    function () {
                      (c[a].q = c[a].q || []).push(arguments);
                    };
                  t = l.createElement(r);
                  t.async = 1;
                  t.src = 'https://www.clarity.ms/tag/' + i;
                  y = l.getElementsByTagName(r)[0];
                  y.parentNode.insertBefore(t, y);
                })(window, document, 'clarity', 'script', "${clarityKey}");
              `}
    </Script>
  ) : null;
}
