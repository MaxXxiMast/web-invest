// NODE MODULES
import { useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';

// Common Components
import Image from '../../../primitives/Image';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import Button, { ButtonType } from '../../../primitives/Button';

// Utils
import { otherBrokersDetail } from '../../utils/financialUtils';
import { DematCard, ModalContentType } from '../DematModal/utils';
import { getStrapiMediaS3Url } from '../../../../utils/media';
import { trackEvent } from '../../../../utils/gtm';

// Styles
import styles from './BrokerDetails.module.css';

type BrokerDetailsProps = {
  open: boolean;
  onCloseModal: () => void;
  onBackClick: () => void;
  modalData: DematCard;
};

export default function BrokerDetails({
  open,
  onCloseModal,
  onBackClick,
  modalData,
}: BrokerDetailsProps) {
  const brokerDetails: ModalContentType[] = modalData?.modalContent;
  const [selectedBroker, setSelectedBroker] = useState<
    Partial<ModalContentType>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const renderOtherDetails = () => {
    return (
      <div className={styles.OtherDetails}>
        In case you do not see your broker in the list, you can explore below
        options -
        <ul>
          {otherBrokersDetail.map((value) => {
            return <li key={`${value}`}>{value}</li>;
          })}
        </ul>
      </div>
    );
  };

  const handleClick = () => {
    trackEvent('Redirected_to_Broker', {
      broker: selectedBroker.heading,
    });
    selectedBroker?.link?.clickUrl
      ? window.open(selectedBroker.link.clickUrl, '_blank', 'noopener')
      : onCloseModal();
  };

  const renderBrokerDetails = () => {
    const isBrokerSelected = Object.keys(selectedBroker).length;

    if (!isBrokerSelected) return null;

    const isOtherDetails = selectedBroker?.heading
      ?.toLowerCase()
      .includes('other');

    const descrImg = getStrapiMediaS3Url(
      selectedBroker?.descriptionImage?.desktopUrl
    );
    return (
      <div>
        <div className={styles.BrokerDetailHeader}>
          {selectedBroker?.heading ?? ''}
        </div>
        {/* Added because NextImage do not take auto height or width */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className={styles.brokerDetails}>
          {descrImg ? (
            <div className={styles.BrokerDetailImageContainer}>
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={'brokerImage'}
                  src={descrImg}
                  className={styles.BrokerDetailImage}
                />
              } 
            </div>
          ) : null}

          {!isOtherDetails ? (
            <div className={styles.BrokerDetailSubHeading}>
              {selectedBroker?.description ?? ''}
            </div>
          ) : (
            renderOtherDetails()
          )}

          <div className={styles.BtnContainer}>
            <Button
              variant={ButtonType.Primary}
              width={'100%'}
              className={styles.BrokerDetailButton}
              onClick={handleClick}
            >
              <div className={`flex_wrapper  ${styles.ButtonDetails}`}>
                <span>{selectedBroker?.link?.title ?? 'Okay, understood'}</span>
                {selectedBroker?.link?.clickUrl ? (
                  <span className={`icon-caret-down ${styles.DownIcon}`} />
                ) : (
                  <span></span>
                )}
              </div>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderBrokersScroll = () => {
    return (
      <Tabs
        value={selectedBroker}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        <div className={styles.BrokersList}>
          {brokerDetails.map((broker) => {
            const brkerLogo = getStrapiMediaS3Url(
              broker?.headerImage?.desktopUrl
            );
            return (
              <div
                className={`${styles.BrokerImage} ${
                  selectedBroker?.heading === broker?.heading
                    ? 'SelectedBroker'
                    : ''
                }`}
                key={broker?.heading}
                onClick={() => {
                  trackEvent('Demat_Broker_Switched', {
                    broker: broker.heading,
                  });
                  setSelectedBroker(broker);
                }}
              >
                <Image
                  src={brkerLogo}
                  alt={broker?.heading}
                  width={33}
                  height={33}
                  layout="fixed"
                />
              </div>
            );
          })}
        </div>
      </Tabs>
    );
  };

  useEffect(() => {
    if (brokerDetails?.length) {
      setSelectedBroker(brokerDetails?.[0] ?? {});
      setIsLoading(false);
    }
  }, [brokerDetails]);

  if (isLoading) {
    return null;
  }

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={open}
      drawerExtraClass={styles.BrokerDetailDrawer}
      cardClass={styles.BrokerDetailCard}
      handleModalClose={onCloseModal}
    >
      <span className={styles.HeadingText}>{modalData?.modalTitle}</span>
      {modalData?.subHeader ? (
        <div className={`mt-12 ${styles.DematHeader}`}>
          <span>{modalData?.subHeader}</span>
        </div>
      ) : null}
      {renderBrokersScroll()}
      {renderBrokerDetails()}
    </MaterialModalPopup>
  );
}
