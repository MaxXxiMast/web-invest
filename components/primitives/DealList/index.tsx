import { useEffect, useState } from 'react';
import Image from 'next/image';

import MaterialModalPopup from '../MaterialModalPopup';
import CustomSkeleton from '../CustomSkeleton/CustomSkeleton';
import Button, { ButtonType } from '../Button';

import {
  AssetType,
  RegulatedBy,
} from '../../FilterAndCompare/utils/helperUtils';
import { processAssetData } from './utils';
import { fetchAPI } from '../../../api/strapi';

import styles from './DealListModal.module.css';

const DealListModal = ({
  onClose,
  isShowModal,
  handleSelectedDeal,
  selectedFilterOptions,
  totalNumberOfDeals,
  mainViewDeals,
}) => {
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [deals, setDeals] = useState(null); // null initially for loading state

  const handleDealClick = (dealData) => setSelectedDeal(dealData);

  const getDeals = async () => {
    const selectedIRR = selectedFilterOptions?.find(
      (item) => item.filterLabel === 'IRR/YTM'
    );
    const selectedTenure = selectedFilterOptions?.find(
      (item) => item.filterLabel === 'Tenure'
    );

    const modalDealListData = await fetchAPI(
      '/v3/assets/discovery/filter',
      {
        skip: 0,
        limit: totalNumberOfDeals,
        maxIrr: selectedIRR?.max,
        minIrr: selectedIRR?.min ?? 0,
        ...(selectedTenure && { minTenure: selectedTenure?.min }),
        ...(selectedTenure && { maxTenure: selectedTenure?.max }),
      },
      {},
      true
    );

    const filteredDeals = modalDealListData?.data?.filter(
      (item) => !mainViewDeals?.some((deal) => deal.assetID === item?.assetID)
    );

    if (filteredDeals) {
      filteredDeals.forEach((asset) => processAssetData(asset));
      setDeals(filteredDeals.sort((a, b) => a.irr - b.irr));
    }
  };

  useEffect(() => {
    getDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MaterialModalPopup
      isModalDrawer
      hideClose={false}
      showModal={isShowModal}
      handleModalClose={onClose}
      className={styles.dealListModal}
    >
      <h3>Select deal to compare</h3>
      <div className={`flex-column gap-10 ${styles.dealList}`}>
        {deals === null
          ? Array.from({ length: 3 }).map((ele, index) => (
              <div
                key={`skekelton_${index}_${Date.now()}`}
                className={styles.dealItem}
              >
                <CustomSkeleton styles={{ width: 92, height: 30 }} />
                <CustomSkeleton styles={{ width: '60%' }} />
              </div>
            ))
          : deals?.map((deal) => (
              <div
                key={deal?.assetID}
                className={`${styles.dealItem} ${
                  selectedDeal?.assetID === deal?.assetID ? styles.active : ''
                }`}
                onClick={() => handleDealClick(deal)}
              >
                <div
                  className={`flex justify-between items-center ${styles.dealItemContent}`}
                >
                  <Image
                    src={deal?.logo ?? ''}
                    className={`${styles.dealImg}`}
                    alt="logo"
                    layout="fixed"
                    height={30}
                    width={92}
                  />
                  <span>
                    <span>
                      {AssetType(deal) === 'High Yield FDs' ? (
                        <>Interest {deal?.irr ?? 'N/A'}%</>
                      ) : (
                        <>{`${deal?.irr?.split(' ')?.[1]} ${
                          deal?.irr?.split(' ')?.[0]
                        } `}</>
                      )}
                    </span>
                    <span> | {deal?.tenure}</span>
                  </span>
                </div>
                {selectedDeal?.assetID === deal?.assetID && (
                  <div className={`flex_wrapper ${styles.regulatedBadge}`}>
                    <span className="icon-shield" />
                    <p>{RegulatedBy(deal)}</p>
                  </div>
                )}
              </div>
            ))}
      </div>
      <Button
        width="100%"
        onClick={() => handleSelectedDeal(selectedDeal)}
        variant={ButtonType.Primary}
      >
        Compare this deal
      </Button>
    </MaterialModalPopup>
  );
};

export default DealListModal;
