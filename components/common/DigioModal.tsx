import React, { useEffect, useRef, useState } from 'react';
import PubSub from 'pubsub-js';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import snakeCase from 'lodash/snakeCase';

import Dialog from '@mui/material/Dialog';

import { getObjectClassNames } from '../utils/designUtils';
import { mediaQueries } from '../utils/designSystem';
import { loadDigio } from '../../utils/ThirdParty/scripts';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

import IconDialog from './IconDialog';
import { RootState } from '../../redux';
import {
  verifyOrderEsignDocuments,
  verifyOrderMcaDocuments,
  verifyOrderResignationDocuments,
} from '../../redux/slices/orders';

import { trackEvent } from '../../utils/gtm';
import { isGCOrder } from '../../utils/gripConnect';
import { postMessageToNativeOrFallback } from '../../utils/appHelpers';

import { getGripURL } from '../../api/strapi';

const classes: any = getObjectClassNames({
  dialogContainer: {
    width: 320,
    [mediaQueries.nonPhone]: {
      width: 380,
    },
  },
  popupHeader: {
    padding: 20,
  },
  header: {
    color: 'var(--gripBlue, #00357c)',
    marginBottom: 10,
    fontSize: 28,
    textAlign: 'left',
    fontWeight: 600,
    [mediaQueries.phone]: {
      fontSize: 20,
    },
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'left',
    lineHeight: 1.5,
  },
  dialogPaper: {
    margin: 0,
  },
  dialogRoot: {
    zIndex: '999999999 !important',
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    cursor: 'pointer',
    ' svg': {
      width: 15,
      zIndex: 10,
    },
  },
  popupOkButton: {
    backgroundColor: 'var(--gripBlue, #00357c)',
    color: 'var(--gripWhite, #ffffff)',
    borderRadius: 20,
    width: 150,
    padding: '8px 0px',
    textAlign: 'center',
    cursor: 'pointer',
    marginTop: 15,
    lineHeight: 1,
    border: '2px solid var(--gripBlue, #00357c)',
    fontWeight: 600,
    [mediaQueries.phone]: {
      fontSize: 14,
    },
  },
  popupCancelButton: {
    backgroundColor: 'var(--gripWhite, #ffffff)',
    color: 'var(--gripBlue, #00357c)',
    borderRadius: 20,
    width: 150,
    padding: '8px 0px',
    textAlign: 'center',
    cursor: 'pointer',
    marginTop: 15,
    lineHeight: 1,
    border: '2px solid var(--gripBlue, #00357c)',
    fontWeight: 600,
    [mediaQueries.phone]: {
      fontSize: 14,
    },
  },
  downloadButton: {
    fontSize: 12,
    textDecoration: 'underline',
    textDecorationColor: 'var(--gripPrimaryGreen, #00b8b7)',
    color: 'var(--gripPrimaryGreen, #00b8b7)',
    fontWeight: 500,
    float: 'right',
    marginRight: '35px',
    marginTop: 8,
    [mediaQueries.phone]: {
      fontSize: 12,
      marginTop: 8,
    },
    cursor: 'pointer',
  },
  heightFixed: {
    [mediaQueries.desktop]: {
      position: 'fixed !important',
    },
  },
});

const dialogClasses = {
  paper: classes.dialogPaper,
  root: classes.dialogRoot,
};
const DigioModal = (props) => {
  const router = useRouter();
  return <DigioModalWithRouter {...props} router={router} />;
};
const DigioModalWithRouter: React.FC<any> = (props) => {
  const [digioData, setDigioData] = useState({
    redirectTo: '',
    data: {
      did: '',
      identifier: '',
      tokenID: '',
      fileName: '',
      module: '',
    },
    type: '',
    subType: '',
    onEsignDone: (_data?: any) => {},
    onEsignCancel: () => {},
    captureDigioEvents: (e: any) => {},
    onPopupError: () => {},
  });
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [showPopupBlocked, setShowPopupBlocked] = useState(false);

  const digioSubs = useRef<any>(null);

  const scrollToTop = () => {
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 1000);
  };

  useEffect(() => {
    if (digioData?.data?.tokenID) {
      renderDigioDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digioData]);

  useEffect(() => {
    loadDigio();
    digioSubs.current = PubSub.subscribe(
      'openDigio',
      (topic: string, obj: any) => {
        if (obj.openDigioModal) {
          setDigioData(obj);
        }
        configureCloseButton();
        scrollToTop();
      }
    );
    return () => {
      if (digioSubs.current) {
        PubSub.unsubscribe(digioSubs.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadEsign = () => {
    fetch(
      `${window.origin}/api/v1/order/download/doc?did=${digioData?.data.did}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
          Authorization: `Bearer ${props.access.accessToken}`,
        },
      }
    )
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([blob]));
        const fileName = `${digioData?.data.fileName}.pdf`;

        const handleDownload = () => {
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          // Append to html link element page
          document.body.appendChild(link);
          // Start download
          link.click();
        };

        postMessageToNativeOrFallback(
          'downloadAppDocument',
          {
            url: url,
            fileName,
          },
          handleDownload
        );
      });
  };

  const configureCloseButton = () => {
    setTimeout(() => {
      let digioIframe = document.querySelector('[id^="wrapperdigio-ifm-"]');
      if (digioIframe && digioIframe.id) {
        (digioIframe as HTMLElement).style.transition = 'all 0.5s ease';
        if (digioData?.type === 'signature' && window.innerWidth < 600) {
          (digioIframe as HTMLElement).style.width = `100%`;
          (digioIframe as HTMLElement).style.maxHeight = `70vh`;
          (digioIframe as HTMLElement).style.top = `10vh`;
        } else {
          (digioIframe as HTMLElement).style.height = `calc(100vh - 25%)`;
          (digioIframe as HTMLElement).style.maxWidth = `100%`;
          (digioIframe as HTMLElement).style.bottom = `0px`;
          (digioIframe as HTMLElement).style.margin = `auto 0`;
        }
        if (digioData?.data && digioData?.data.fileName) {
          let span = document.createElement('span');
          let t = document.createTextNode('Download');
          span.appendChild(t);
          span.className = classes.downloadButton;
          span.onclick = handleDownloadEsign;
          span.id = 'download';
          document.getElementById(digioIframe.id)?.appendChild(span);
        }
        let ele = document.getElementById(
          digioIframe.id.replace('wrapper', 'parent')
        );

        ele.style.height = '100%';

        ele.className = classes.heightFixed;
        const imgSrc = `${GRIP_INVEST_BUCKET_URL}homev2/ic-close.svg`;

        document.getElementById(digioIframe.id).firstChild.remove();
        let imgEl = document.createElement('img');
        imgEl.src = imgSrc;
        imgEl.height = 12;
        imgEl.width = 12;
        imgEl.className = classes.closeButton;
        imgEl.onclick = askToCloseDigio;
        imgEl.id = 'digioClose';
        document.getElementById(digioIframe.id)?.appendChild(imgEl);
      }
    }, 3000);
  };

  const sendEsignRudderStackEvent = (
    eventName: string,
    extraData: {
      [key: string]: string;
    } = {}
  ) => {
    const { asset = {}, user = {} } = props || {};

    const data = {
      assetID: asset?.assetID,
      userID: user?.userData?.userID,
      createdAt: new Date(),
      financeProductType: asset?.financeProductType,
      ...extraData,
    };
    trackEvent(eventName, data);
  };

  const digioCallback = (data: any) => {
    const isError = data.hasOwnProperty('error_code');
    if (isError && digioData?.type === 'signature') {
      digioData?.captureDigioEvents?.(data);
    }
    if (!isError) {
      if (digioData?.type === 'signature') {
        digioData?.onEsignDone(data);
      } else if (digioData?.type === 'order') {
        props.verifyOrderEsignDocuments(digioData?.data, () => {
          // send rudderstack event after esign sucess
          sendEsignRudderStackEvent('esign', {
            doc_name: snakeCase('Investment Agreement'),
          });
          digioData?.onEsignDone();
          props.router.push(digioData?.redirectTo);
        });
      } else if (digioData?.type === 'resignation') {
        props.verifyOrderResignationDocuments(digioData?.data, () => {
          props.router.push(digioData?.redirectTo);
        });
      } else if (digioData?.type === 'mca') {
        props.verifyOrderMcaDocuments(digioData?.data, () => {
          digioData?.onEsignDone();
        });
      } else if (digioData?.onEsignDone) {
        digioData?.onEsignDone(digioData?.data);
      }
    }
    if (digioData?.type === 'kyc') {
      props.router.push(digioData?.redirectTo);
    }
    if (isError && digioData?.type === 'order') {
      props.router.push(digioData?.redirectTo);
    }
  };

  const isMobileApp = Cookies.get('webViewRendered');
  const renderDigioDialog = () => {
    const isGCSignatureFlow =
      (isGCOrder() || isMobileApp) &&
      digioData.type === 'signature' &&
      digioData.subType === 'aof';

    const digioConfig = {
      is_iframe: true,
      callback: digioCallback,
      event_listener: (event: any) => {
        //check if cpature event is for digio error
        if (event?.payload?.error || event?.event?.includes('failed')) {
          digioData?.captureDigioEvents?.(event);
        }
      },
    };

    const digioSignatureConfig = {
      is_redirection_approach: true,
      is_iframe: false,
      redirect_url: `${window?.location?.origin || getGripURL()}/user-kyc`,
    };

    const configObject = isGCSignatureFlow ? digioSignatureConfig : digioConfig;

    try {
      (window as any).digio = new (window as any).Digio({
        // environment: getEnv() === 'production' ? 'production' : 'sandbox', //Temporary commenting for testing
        environment: 'production',
        ...configObject,
        logo: `${GRIP_INVEST_BUCKET_URL}home/gripinvest.png`,
        theme: {
          primaryColor: '#00357c',
          secondaryColor: '#FFFFFF',
        },
      });
      (window as any).digio.init();
      const { did, identifier, tokenID } = digioData?.data;
      (window as any).digio.submit(did, identifier, tokenID);
    } catch (err) {
      digioData?.onPopupError
        ? digioData?.onPopupError()
        : setShowPopupBlocked(true);
    }
  };

  const askToCloseDigio = () => {
    setAskConfirmation(true);
  };

  const handleClose = () => {
    setAskConfirmation(false);
    (window as any).digio.cancel();
    digioData?.onEsignCancel?.();
  };

  const continueEsign = () => {
    setAskConfirmation(false);
  };

  const hidePopupDialog = () => {
    setShowPopupBlocked(false);
  };

  return (
    <div>
      <Dialog classes={dialogClasses} open={askConfirmation}>
        <div className={classes.dialogContainer}>
          <div className={classes.popupHeader}>
            <div className={classes.header}>Cancel eSign?</div>
            <div className={classes.subHeader}>
              Are you sure want to cancel eSigning?
            </div>
            <div className="flex justify-around">
              <div className={classes.popupCancelButton} onClick={handleClose}>
                Cancel eSign
              </div>
              <div className={classes.popupOkButton} onClick={continueEsign}>
                Continue eSign
              </div>
            </div>
          </div>
        </div>
      </Dialog>
      <IconDialog
        showDialog={showPopupBlocked}
        iconUrl={`${GRIP_INVEST_BUCKET_URL}dealsV2/additional-kyc-warning.svg`}
        headingText={'Switch off Block Pop up'}
        subHeadingText={'Go to Settings -> Safari -> Block Popups'}
        onCloseDialog={() => hidePopupDialog()}
        id="digio-popup-blocked"
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
  asset: state.assets.selectedAsset,
  access: state.access,
});

const mapDispatchToProps = {
  verifyOrderEsignDocuments,
  verifyOrderResignationDocuments,
  verifyOrderMcaDocuments,
};

export default connect(mapStateToProps, mapDispatchToProps)(DigioModal);
