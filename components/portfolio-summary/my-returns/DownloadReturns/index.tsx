// NODE MODULES
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

// Components
import { DownloadCASModal } from '../../../portfolio';
import Image from '../../../primitives/Image';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';

// Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

// API
import { callSuccessToast, fetchAPI } from '../../../../api/strapi';

// Utils
import {
  getCurrentFinancialYearFormat,
  getFinancialYearListOnCount,
} from '../../../../utils/date';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import { trackEvent } from '../../../../utils/gtm';
import { financialProductTypeMappings } from '../../utils';
import { ymdFormat } from '../../../../utils/dateFormatter';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';

// Styles
import styles from './DownloadReturns.module.css';

interface ModalTimerProps {
  showDownloadModal: boolean;
  onCloseModal: () => void;
}

const ModalTimer: React.FC<ModalTimerProps> = ({
  showDownloadModal,
  onCloseModal,
}) => {
  const [count, setCount] = useState(5);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const modalTimer = () => {
    const id = setInterval(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);
    setIntervalId(id);
  };

  useEffect(() => {
    if (showDownloadModal) {
      setCount(5);
      modalTimer();
    }
    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDownloadModal]);

  useEffect(() => {
    if (count <= 0) {
      onCloseModal();

      clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <>
      <div className={styles.label}>Upgradation in Process</div>
      <div className={styles.sublabel}>
        We are upgrading Report download feature for better experience. It will
        be available soon. We’ll notify you once it is back.
      </div>
      <div className={`mt-12 ${styles.sublabel}`}>
        Popup closes in {count} seconds..
      </div>
    </>
  );
};

const DownloadReturns = () => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  // GET selectedAssetType
  const {
    selectedAssetType = 'Bonds, SDIs & Baskets',
    totalAmountInvested = 0,
  } = useAppSelector((state) => state.portfolioSummary);

  // GET UserID
  const { userID = '' } = useAppSelector((state) => state?.user?.userData);

  const isMobile = useMediaQuery('(max-width:768px)');

  const commonEventData = {
    user_id: userID,
    timestamp: new Date().toISOString(),
    asset_type: selectedAssetType,
    amount_invested: totalAmountInvested,
  };

  const onCloseModal = () => {
    trackEvent('document_requested', {
      ...commonEventData,
      financial_year: '',
      cancel_click: true,
    });
    setShowDownloadModal(false);
  };

  const handleDownloadPDF = async ({ financialYear }) => {
    if (financialYear === '') return;
    const [firstYear, secondYear] = financialYear?.split('-') ?? [];
    const params = {
      financeProductType: financialProductTypeMappings?.[selectedAssetType],
      type: 'all',
      startDate: dayjs(`${firstYear}-04-01`).format(ymdFormat),
      endDate: dayjs(`${secondYear}-03-31`).format(ymdFormat),
      financialYear: `FY ${financialYear}`,
    };
    try {
      await fetchAPI(
        `/v3/portfolio/user-return-report/download`,
        {},
        { method: 'post', body: JSON.stringify(params) },
        true,
        false
      );
      callSuccessToast(
        'Returns Report has been successfully sent to your registered email address.'
      );
      trackEvent('download_returns_report', {
        ...commonEventData,
        ...params,
      });
    } catch (error) {
      console.error('Failed ', error);
    } finally {
      setShowDownloadModal(false);
    }
  };

  const isBondsAndSDI = selectedAssetType === 'Bonds, SDIs & Baskets';
  const startingYear = isBondsAndSDI ? '2022' : '2021';

  // IF Selected Asset Type is FD return null
  if (selectedAssetType === 'High Yield FDs') return null;

  return (
    <>
      <div
        className={`items-align-center-row-wise`}
        onClick={() => setShowDownloadModal(true)}
      >
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/line_download_black.svg`}
          width={18}
          height={18}
          layout="fixed"
          alt="line_download_black"
        />
        <span className={`${styles.download}`}> Download returns report</span>
      </div>
      {showDownloadModal || isMobile ? (
        <MaterialModalPopup
          showModal={showDownloadModal}
          handleModalClose={onCloseModal}
          className={styles.DownloadCasModal}
          isModalDrawer
        >
          <DownloadCASModal
            heading="Download Returns Report"
            financialYearList={getFinancialYearListOnCount(startingYear, 5)}
            defaultValue={getCurrentFinancialYearFormat()}
            showDivider={false}
            ctaIcon={'icons/ReportIcon.svg'}
            ctaText={'Get Report'}
            closeModal={() => setShowDownloadModal(false)}
            handleCtaClick={handleDownloadPDF}
          />
        </MaterialModalPopup>
      ) : null}
    </>
  );
};

export default DownloadReturns;
