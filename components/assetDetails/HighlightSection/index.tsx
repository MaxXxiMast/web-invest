//Node Modules
import { useState } from 'react';

//Components
import ReasonToInvest from './ReasonToInvest';
import ImageHighlights from './ImageHighlights';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import Button from '../../primitives/Button';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

//Utils
import { groupBy } from 'lodash';
import { fallbackData } from './utils';

//Hooks
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../redux/slices/hooks';

//Styles
import styles from './HighlightSection.module.css';

type HighlightModalType = 'imgHighlights' | 'resonToInvest' | null;

const HighlightSection = () => {
  const { highlightsMap, isDetailsLoaded = false } = useAppSelector(
    (state) => state.assets?.selectedAsset
  );
  const { highlights = [], imageHighlights: imgData = [] } =
    highlightsMap || {};
  const isMobile = useMediaQuery();
  const [highlightModal, setHighlightModal] =
    useState<HighlightModalType>(null);

  const handleModal = (modalType: HighlightModalType) => {
    setHighlightModal(modalType);
  };

  const imgHighlights = groupBy(imgData, 'title');

  if (!isDetailsLoaded)
    return (
      <div
        className={`${
          isMobile ? 'flex-column' : 'flex'
        } justify-between m-12 gap-12 ${styles.container}`}
      >
        <CustomSkeleton
          styles={{
            height: 250,
            width: '100%',
          }}
        />
        <CustomSkeleton
          styles={{
            height: 250,
            width: '100%',
          }}
        />
      </div>
    );

  if (!highlights?.length && !Object.keys(imgHighlights)?.length) return null;

  return (
    <div
      className={`${
        isMobile ? 'flex-column' : 'flex'
      } justify-between items-center m-12 ${styles.container}`}
    >
      {highlights?.length ? (
        <div className={styles.highlightContainer}>
          <ReasonToInvest data={highlights} handleModal={handleModal} />
        </div>
      ) : null}
      {Object.keys(imgHighlights)?.length ? (
        <div className={styles.highlightContainer}>
          <ImageHighlights
            bannerData={imgHighlights}
            handleModal={handleModal}
          />
        </div>
      ) : null}

      {(!highlights?.length || !Object.keys(imgHighlights)?.length) &&
      !isMobile ? (
        <div className={styles.highlightContainer}>
          <ImageHighlights bannerData={fallbackData} isFallbackCard={true} />
        </div>
      ) : null}

      <MaterialModalPopup
        hideClose={false}
        className={styles.seeMoreModal}
        showCloseBtn
        isModalDrawer
        showModal={Boolean(highlightModal)}
        handleModalClose={() => setHighlightModal(null)}
      >
        <div className={styles.modalContainer}>
          {highlightModal === 'imgHighlights' ? (
            <ImageHighlights
              bannerData={imgHighlights}
              showSeeMore={false}
              className={styles.modalContent}
              handleModal={handleModal}
            />
          ) : (
            <ReasonToInvest
              data={highlights}
              handleModal={handleModal}
              showSeeMore={false}
              className={styles.modalContent}
            />
          )}
        </div>
        <Button
          width={'100%'}
          onClick={() => setHighlightModal(null)}
          className={styles.modalButton}
        >
          Okay
        </Button>
      </MaterialModalPopup>
    </div>
  );
};

export default HighlightSection;
