import { getSecret } from '../../api/secrets';
import { getEnv } from '../constants';

const loadMoengage = (src: string, params: any) => {
  (function (window: any, document) {
    const MOENGAGE = 'Moengage';
    window.moengage_object = MOENGAGE;
    let t: any = {},
      q = function (f: any) {
        return function () {
          (window.moengage_q = window.moengage_q || []).push({
            f: f,
            a: arguments,
          });
        };
      },
      f = [
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
        'moe_events',
        'call_web_push',
        'track',
        'location_type_attribute',
      ],
      h = { onsite: ['getData', 'registerCallback'] },
      n: any;
    for (let k in f) {
      t[f[k]] = q(f[k]);
    }
    for (let k in h)
      for (let l in h.onsite) {
        null == t[k] && (t[k] = {});
        t[k][h.onsite[l]] = q(k + '.' + h.onsite[l]);
      }
    let a = document.createElement('script');
    let m = document.getElementsByTagName('script')[0];
    a.async = true;
    a.src = src;
    m && m.parentNode && m.parentNode.insertBefore(a, m);
    window.moe =
      window.moe ||
      function () {
        n = arguments[0];
        return;
      };
    a.onload = function () {
      if (n) {
        (window as any)[MOENGAGE] = (window as any).moe(n);
      }
    };
  })(window, document);

  (window as any).Moengage = (window as any).moe({
    app_id: params.appID,
    debug_logs: params.debugLogs,
    cluster: 'DC_3',
  });
};

const initiateScript = (id: string, src: string, params: any) => {
  switch (id) {
    case 'moengageScript': {
      loadMoengage(src, params);
      break;
    }
    default: {
      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.type = 'text/javascript';
      script.defer = true;
      document.body.appendChild(script);
      break;
    }
  }
};

const loadScriptAsync = (scriptId: string, scriptSrc: string) => {
  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement('script');
    scriptElement.id = scriptId;
    scriptElement.src = scriptSrc;
    scriptElement.async = true;
    scriptElement.onload = resolve;
    scriptElement.onerror = reject;
    document.head.appendChild(scriptElement);
  });
};

const loadScript = (id: string, src: string, params: any = {}) => {
  const script = document.getElementById(id);
  if (!script) {
    initiateScript(id, src, params);
  }
};

const loadCashfree = async () => {
  const sandboxSrc = 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js';
  const productionSrc = 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.prod.js';
  await loadScriptAsync(
    'cashfreeScript',
    getEnv() === 'production' ? productionSrc : sandboxSrc
  );
};

const loadDigio = () => {
  loadScript('digioScript', 'https://app.digio.in/sdk/v11/digio.js');
};

/**
 * Invoke this function in DEV environment only for checking MoEngage events.
 * For production , MoEngage script is initialized with debug_level = 0 using GTM
 */
const initMoengage = () => {
  getSecret('moengage.app_id')
    .then((appID: { value: string }) => {
      getSecret('moengage.debug_logs').then((debugLogs: { value: string }) => {
        loadScript(
          'moengageScript',
          'https://cdn.moengage.com/webpush/moe_webSdk.min.latest.js',
          { appID: appID.value, debugLogs: Number(debugLogs.value) }
        );
      });
    })
    .catch((_err) => {
      // missing Moengage app ID from secrets
    });
};

const loadHyperverge = async () => {
  await loadScriptAsync(
    'hypervergeScript',
    'https://hv-camera-web-sg.s3-ap-southeast-1.amazonaws.com/hyperverge-web-sdk@7.5.6/src/sdk.min.js'
  );
};

export { loadDigio, initMoengage, loadHyperverge, loadCashfree };
