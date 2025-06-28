import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';

// Components
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import CloseLineIcon from '../../assets/CloseLineIcon';
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';

// Api
import {
  getUserTransactionAndReturns,
  returnsDownload,
} from '../../../api/portfolio';
import {
  callErrorToast,
  callSuccessToast,
  fetchAPI,
} from '../../../api/strapi';

// Utils
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { Skeleton } from '@mui/material';
import {
  HeaderTxt,
  NoteTxt,
  TabText,
  TransactionData,
  DownloadFlag,
  TransactionProps,
  TRANSACTIONS,
  txDownloadLabels,
} from './utils';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../../utils/appHelpers';
import { getOS } from '../../../utils/userAgent';
import { trackEvent } from '../../../utils/gtm';

// CSS
import classes from './Transaction.module.css';

const Transaction: React.FC<TransactionProps> = (props: TransactionProps) => {
  const { showModal, setShowModal, securityID, assetName = '' } = props ?? {};
  const [activeTab, setActiveTab] = useState<string>(Object.keys(TabText)[0]);
  const [transactionData, setTransactionData] =
    useState<TransactionData[]>(null);

  const [showLoader, setShowLoader] = useState(true);
  const [showDownload, setShowDownload] = useState(false);
  const [hidePdfDownload, setHidePdfDownload] = useState<DownloadFlag[]>([]);
  const [hideDownload, setHideDownload] = useState<DownloadFlag[]>([]);
  const wrapperRef = useRef(null);

  const isMobile = useMediaQuery();
  const isInReactNative = Cookies.get('webViewRendered');

  useEffect(() => {
    const getEarlyLiquidityAssets = async () => {
      try {
        const res = await fetchAPI(
          '/inner-pages-data',
          {
            filters: { url: '/liquidity' },
            populate: '*',
          },
          {},
          false
        );

        const hidePdfDownload =
          res?.data?.[0]?.attributes?.pageData?.[0]?.objectData
            ?.hidePdfDownload;
        const hideDownload =
          res?.data?.[0]?.attributes?.pageData?.[0]?.objectData?.hideDownload;

        setHidePdfDownload(hidePdfDownload);
        setHideDownload(hideDownload);
      } catch (error) {
        console.log(error);
      }
    };

    getEarlyLiquidityAssets();
  }, []);

  useEffect(() => {
    if (showModal && activeTab) {
      setShowLoader(true);
      getUserTransactionAndReturns({
        key: activeTab,
        securityID: props?.securityID,
      })
        .then((res) => {
          setShowLoader(false);
          setTransactionData(res);
        })
        .catch((err) => {
          console.error('Error fetching transaction data:', err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, activeTab]);

  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Unbind the event listener on clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeTab]);

  const handleModalClose = (value = false) => {
    setShowModal(value);
  };

  const handleDownloadVisibility = (types: DownloadFlag[]): boolean => {
    if (!Array.isArray(types) || types?.length === 0) return true;
    const os = getOS();

    trackEvent('transaction_download_clicked_visibility', {
      os,
      isReactNative: isInReactNative,
      webViewCookie: Cookies.get('webViewRendered'),
      isMobile,
      types,
    });

    if (isMobile) {
      if (isInReactNative && types.includes('App')) return false;
      if (types.includes('MobileWeb')) return false;
    } else {
      if (types.includes('Desktop')) return false;
      if (types.includes(os as DownloadFlag)) return false;
    }

    return true;
  };

  const getHeader = () => {
    return activeTab == TRANSACTIONS ? HeaderTxt.slice(0, 4) : HeaderTxt;
  };

  const handleClickOutside = (event: any) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowDownload(false);
    }
  };

  function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // Base64 string
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Converts Blob to base64 string
    });
  }

  const handleFileDownload = async (format: 'pdf' | 'excel') => {
    try {
      const type = activeTab as 'statement' | 'returns' | 'transactions';
      const fileName = `${assetName}_${type.replace(/^./, type[0])}_report.${
        format === 'excel' ? 'xlsx' : 'pdf'
      }`;

      const apiUrl = `/v3/portfolio/return-report/download?type=${type}&securityID=${securityID}&downloadFormat=${format}`;
      let base64: any = '';
      if (isRenderedInWebview()) {
        await returnsDownload(securityID, type, format)
          .then((response) => {
            return response.blob();
          })
          .then(async (blob) => {
            base64 = await convertBlobToBase64(blob);
          });
      }

      const handleDownload = async () => {
        callSuccessToast('Your download is in progress.');
        const blob = await returnsDownload(securityID, type, format).then(
          (response) => {
            return response.blob();
          }
        );
        // Create blob link to download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowDownload(false);
        // Revoke object URL to free memory
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      };

      postMessageToNativeOrFallback(
        'visualiseReturn',
        { apiUrl, fileName, base64: JSON.stringify(base64) },
        handleDownload
      );
    } catch (error) {
      console.error('Error downloading file:', error);
      callErrorToast('Error downloading file, please try again');
    }
  };

  const renderPaymentSchedulePopupItem = ({ id, label, icon }, index) => (
    <div
      key={`${id}`}
      className={`flex ${classes.DownloadSchedulePopupItemContainer}`}
      onClick={() => handleFileDownload(id)}
    >
      <div className={classes.DownloadSchedulePopupIcon}>
        <Image alt={label} src={icon} />
      </div>
      <div className={classes.DownloadSchedulePopupText}>{label}</div>
    </div>
  );

  const renderDownload = () => {
    return showDownload ? (
      <div className={classes.DownloadSchedulePopup}>
        {txDownloadLabels(handleDownloadVisibility(hidePdfDownload)).map(
          renderPaymentSchedulePopupItem
        )}
      </div>
    ) : null;
  };

  const Tabs = () => {
    return (
      <div className={classes.tab}>
        {Object.keys(TabText).map((key) => (
          <button
            className={`${classes.tabItem} ${
              activeTab == key ? classes.activeTab : ''
            }`}
            key={key}
            onClick={() =>
              setTimeout(() => {
                setActiveTab(key);
              }, 300)
            }
          >
            {TabText[key]}
          </button>
        ))}
      </div>
    );
  };

  const Header = () => {
    return (
      <div className={classes.header}>
        {getHeader().map((txt) => (
          <span
            style={{
              textAlign: (txt?.align ??
                'center') as React.CSSProperties['textAlign'],
            }}
            className={`${classes.headerItem}`}
            key={txt?.header}
          >
            {txt?.header}
          </span>
        ))}
      </div>
    );
  };

  const Rows = () => {
    const currentDate = new Date();

    return (
      <div className={classes.rows}>
        {transactionData.map((row) => (
          <div className={`${classes.row}`} key={row.orderID}>
            {getHeader().map((item) => {
              let statusClass = '';

              if (row?.action === 'RETURN') {
                if (row?.status === 'Completed') {
                  statusClass = classes.completed;
                } else if (
                  row?.status === 'Scheduled' &&
                  new Date(row?.date) < currentDate
                ) {
                  statusClass = classes.scheduled;
                }
              }

              return (
                <span
                  style={{
                    textAlign: (item?.align ??
                      'center') as React.CSSProperties['textAlign'],
                  }}
                  className={`${classes.rowItem} ${statusClass}`}
                  key={item.header}
                >
                  {item.value(row)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const Table = () => {
    return (
      <div className={classes.table}>
        <Header />
        <Rows />
      </div>
    );
  };

  const Title = () => {
    return (
      <div className={classes.titleContainer}>
        <p className={classes.title}>Transactions and Returns</p>
        <div className={classes.switchContainer}>
          <button
            onClick={() => handleModalClose()}
            className={classes.closeIcon}
            aria-label="Close"
          >
            <CloseLineIcon width={'18'} height={'18'} />
          </button>
        </div>
      </div>
    );
  };

  const Note = () => {
    return <p className={classes.note}>{NoteTxt}</p>;
  };

  const AddionalInfo = () => {
    return (
      <div className={`flex items-center justify-between`}>
        <div className={classes.additionalInfo}>
          {' '}
          <span
            className={`icon-info`}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--gripBlue, #00357c)',
            }}
          />
          <p className={classes.info}>
            {"You'll receive returns in your Demat linked bank account"}{' '}
          </p>
        </div>

        {handleDownloadVisibility(hideDownload) ? (
          <div
            className={`flex_wrapper gap-6 ${classes.downloadLink}`}
            ref={wrapperRef}
            onClick={() => setShowDownload(true)}
          >
            <span className="icon-download" /> Download
            {renderDownload()}
          </div>
        ) : null}
      </div>
    );
  };

  const BottomBtn = () => {
    return (
      <Button
        variant={ButtonType.BorderLess}
        onClick={() => handleModalClose()}
        className={classes.bottomBtn}
      >
        OKAY
      </Button>
    );
  };

  const RenderConent = () => {
    return (
      <div className={classes.container}>
        <Title />
        <Tabs />
        {showLoader ? (
          <Skeleton
            animation="wave"
            variant="rounded"
            height={270}
            width={'100%'}
            className={classes.skeleton}
          />
        ) : (
          <Table />
        )}

        <AddionalInfo />
        <BottomBtn />
      </div>
    );
  };
  const renderModal = () => (
    <MaterialModalPopup
      isModalDrawer={isMobile}
      showModal={showModal}
      closeIconSize={18}
      showCloseBtn={isMobile}
      handleModalClose={() => handleModalClose()}
      closeButtonClass={classes.VisualReturnCloseBtn}
      drawerExtraClass={classes.drawerClass}
      cardClass={classes.mainClass}
    >
      <RenderConent />
    </MaterialModalPopup>
  );
  return renderModal();
};

export default Transaction;
