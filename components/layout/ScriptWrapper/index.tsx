import Script from 'next/script';
import { getEnv } from '../../../utils/constants';
import ClarityWrapper from './ClarityWrapper';

export default function ScriptWrapper({
  linkedinPartnerId,
}: {
  linkedinPartnerId: string;
}) {
  return (
    <>
      <Script
        src={`https://cdn.moengage.com/release/dc_3/moe_webSdk_webp.min.latest.js?app_id=KNETQED1VF61YXND8AD8ZSFQ&debug_logs=${
          getEnv() === 'production' ? 0 : 1
        }`}
      />
      <Script id="moengage-script" strategy="worker">
        {`
            var moeDataCenter = 'dc_3'; // Replace "DC" with the actual Data center value from the above table
            var moeAppID = 'KNETQED1VF61YXND8AD8ZSFQ'; // Replace "AppID" available in the settings page of MoEngage Dashboard.
            !(function (e, n, i, t, a, r, o, d) {
              if (!moeDataCenter || !moeDataCenter.match(/^dc_[0-9]+$/gm))
                return console.error(
                  'Data center has not been passed correctly. Please follow the SDK installation instruction carefully.'
                );
              var s = (e[a] = e[a] || []);
              if (((s.invoked = 0), s.initialised > 0 || s.invoked > 0))
                return (
                  console.error(
                    'MoEngage Web SDK initialised multiple times. Please integrate the Web SDK only once!'
                  ),
                  !1
                );
              e.moengage_object = a;
              var l = {},
                g = function n(i) {
                  return function () {
                    for (var n = arguments.length, t = Array(n), a = 0; a < n; a++)
                      t[a] = arguments[a];
                    (e.moengage_q = e.moengage_q || []).push({ f: i, a: t });
                  };
                },
                u = [
                  'track_event',
                  'add_user_attribute',
                  'add_first_name',
                  'add_last_name',
                  'add_email',
                  'add_mobile',
                  'add_user_name',
                  'add_gender',
                  'add_birthday',
                  'destroy_session',
                  'add_unique_user_id',
                  'update_unique_user_id',
                  'moe_events',
                  'call_web_push',
                  'track',
                  'location_type_attribute',
                ],
                m = { onsite: ['getData', 'registerCallback'] };
              for (var c in u) l[u[c]] = g(u[c]);
              for (var v in m)
                for (var f in m[v])
                  null == l[v] && (l[v] = {}), (l[v][m[v][f]] = g(v + '.' + m[v][f]));
              (r = n.createElement(i)),
                (o = n.getElementsByTagName('head')[0]),
                (r.async = 1),
                (r.src = t),
                o.appendChild(r),
                (e.moe =
                  e.moe ||
                  function () {
                    return ((s.invoked = s.invoked + 1), s.invoked > 1)
                      ? (console.error(
                          'MoEngage Web SDK initialised multiple times. Please integrate the Web SDK only once!'
                        ),
                        !1)
                      : ((d = arguments.length <= 0 ? void 0 : arguments[0]), l);
                  }),
                r.addEventListener('load', function () {
                  if (d)
                    return (
                      (e[a] = e.moe(d)), (e[a].initialised = e[a].initialised + 1 || 1), !0
                    );
                }),
                r.addEventListener('error', function () {
                  return console.error('Moengage Web SDK loading failed.'), !1;
                });
            })(
              window,
              document,
              'script',
              'https://cdn.moengage.com/release/' +
                moeDataCenter +
                '/moe_webSdk.min.latest.js',
              'Moengage'
            );
            Moengage = moe({
              app_id: moeAppID,
              debug_logs: ${getEnv() === 'production' ? 0 : 1},
            });
          `}
      </Script>
      <Script id="linkedin-partner-id-script" strategy="afterInteractive">
        {`
        _linkedin_partner_id = "${linkedinPartnerId}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        `}
      </Script>
      <Script
        id="linkedin-data-partner-ids-script"
        strategy="afterInteractive"
        src="https://snap.licdn.com/li.lms-analytics/insight.min.js"
      />
      <Script id="lintrk-script" strategy="afterInteractive">
        {`
        (function(l) {
          if (!l) {
            window.lintrk = function(a, b) {
              window.lintrk.q.push([a, b]);
            };
            window.lintrk.q = [];
          }
          var s = document.getElementsByTagName("script")[0];
          var b = document.createElement("script");
          b.type = "text/javascript";
          b.async = true;
          b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b, s);
        })(window.lintrk);
        `}
      </Script>

      <ClarityWrapper />
      <Script id="bufferEvents">
        {`
            window.rudderanalytics = [];
            var methods = [
              'setDefaultInstanceKey',
              'load',
              'ready',
              'page',
              'track',
              'identify',
              'alias',
              'group',
              'reset',
              'setAnonymousId',
              'startSession',
              'endSession',
              'consent'
            ];
            for (var i = 0; i < methods.length; i++) {
              var method = methods[i];
              window.rudderanalytics[method] = (function (methodName) {
                return function () {
                  window.rudderanalytics.push([methodName].concat(Array.prototype.slice.call(arguments)));
                };
              })(method);
            }
        `}
      </Script>

      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          alt=""
          src={`https://px.ads.linkedin.com/collect/?pid=${linkedinPartnerId}&fmt=gif`}
        />
      </noscript>
    </>
  );
}
