// NODE MODULES
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

// Components
import Button from '../../primitives/Button';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';

// Hooks
import { updateTimeCheck } from './useTimeCheck';

// Utils
import { fetchAPI } from '../../../api/strapi';
import { trackEvent } from '../../../utils/gtm';

// Styles
import styles from './RBIPopup.module.css';

type RbiPopupProps = {
  modalType?: string;
  showModal: boolean;
  onClose: () => void;
};

type RBIDetails = Partial<{
  title: string;
  details: string[];
}>;

const RbiPopup = ({ showModal, modalType, onClose }: RbiPopupProps) => {
  const startTime = performance.now();

  const [finalData, setFinalData] = useState<RBIDetails>({});

  const [loading, setLoading] = useState(true);

  const handleOnClickProceed = () => {
    const endTime = performance.now();
    const elapsedTime = (endTime - startTime) / 1000;
    trackEvent('rbi_popup_click', {
      duration_of_popup_open: elapsedTime,
      cta_text: 'Proceed',
    });

    if (modalType === 'fdModal') {
      Cookies.set('storedTimeFd', new Date().getTime().toString());
    } else {
      Cookies.set('storedTime', new Date().getTime().toString());
    }
    updateTimeCheck();
    onClose();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rbiDetails = await fetchAPI('/inner-pages-data', {
          filters: {
            url: '/asset-nudge-modal',
          },
          populate: {
            pageData: {
              populate: '*',
            },
          },
        });

        const finalDetails =
          rbiDetails?.data?.[0]?.attributes?.pageData?.[0]?.objectData;

        setFinalData(
          modalType === 'fdModal' ? finalDetails?.fd : finalDetails?.rbi
        );
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    updateTimeCheck();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showModal) {
      const body = document.querySelector('body');
      if (body) {
        body.classList.remove('scroll-hidden');
      }
    }
  }, [showModal]);

  if (!showModal) return null;

  const renderBody = () => {
    if (loading) {
      return (
        <div
          className={`items-align-center-column-wise ${styles.RBIContainer}`}
        >
          <CustomSkeleton
            styles={{
              width: '100%',
              height: 24,
            }}
          />
          <CustomSkeleton
            styles={{
              width: '100%',
              height: 120,
            }}
          />
          <CustomSkeleton
            styles={{
              width: '100%',
              height: 52,
            }}
          />
        </div>
      );
    }

    return (
      <div className={`items-align-center-column-wise ${styles.RBIContainer}`}>
        <h1>
          {finalData?.title || 'RBI regulated SDIs vs SEBI regulated SDIs'}
        </h1>
        <ul>
          {finalData.details?.map((detail) =>
            detail ? <li key={detail}>{detail}</li> : null
          )}
        </ul>
        <Button width={'100%'} onClick={handleOnClickProceed}>
          Proceed
        </Button>
      </div>
    );
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      hideClose
      showModal={showModal}
      className={styles.RBIModal}
      cardClass={styles.RBIModalDrawer}
      closeOnOutsideClick={false}
    >
      {renderBody()}
    </MaterialModalPopup>
  );
};

export default RbiPopup;
