// NODE MODULES
import { useEffect, useState } from 'react';

// Components
import Image from '../../../primitives/Image';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import Button from '../../../primitives/Button';

// Utils
import { getDPIDDetails } from '../../utils/financialUtils';

// Styles
import styles from './MultipleDemat.module.css';

type MultipleDematModalProps = {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (selectedBroker: string) => void;
  dematOcrResponse: any;
};

export default function MultipleDematModal({
  showModal,
  onClose,
  onSubmit,
  dematOcrResponse,
}: MultipleDematModalProps) {
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [selectedDematData, setSelectedDematData] = useState(null);

  useEffect(() => {
    if (Array.isArray(dematOcrResponse) && dematOcrResponse?.length > 0) {
      setSelectedBroker(
        `${dematOcrResponse[0].dpID}${dematOcrResponse[0].clientID}`
      );
      setSelectedDematData(dematOcrResponse[0]);
    }
  }, [dematOcrResponse]);

  const DematCard = ({ clientID, dpID, brokerName, onClick }) => {
    const dematID = `${dpID}${clientID}`;
    const brokerLogo = getDPIDDetails(dematID);
    return (
      <div
        className={`flex ${styles.DematCardContainer} ${
          selectedBroker === dematID ? styles.Active : ''
        }`}
        onClick={onClick}
      >
        <div className={`flex items-center ${styles.DematDetailsContainer}`}>
          <div className={`flex justify-center ${styles.BrokerIconContainer}`}>
            {brokerLogo ? (
              <div>
                <Image
                  src={brokerLogo}
                  width={20}
                  height={20}
                  layout="fixed"
                  alt="Demat/BO ID Image"
                />
              </div>
            ) : (
              <div
                className={`items-align-center-row-wise justify-center ${styles.NoDemat}`}
              >
                {brokerName?.slice(0, 1)?.toString()?.toUpperCase()}
              </div>
            )}
          </div>
          <div className={`flex-column ${styles.DematDetails}`}>
            <span>{brokerName}</span>
            <span>{dematID}</span>
          </div>
        </div>
        <span className={styles.Radio} />
      </div>
    );
  };

  if (!(Array.isArray(dematOcrResponse) && dematOcrResponse?.length > 0)) {
    return null;
  }

  const onClick = (dematID, item) => {
    setSelectedBroker(dematID);

    setSelectedDematData(item);
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={showModal}
      className={styles.MultipleDematModal}
      handleModalClose={onClose}
    >
      <div className={`flex-column ${styles.Container}`}>
        <span className={styles.Heading}>
          Select your preferred Demat account
        </span>
        <div className={`flex-column ${styles.MultipleDematContainer}`}>
          {dematOcrResponse.map((item) => {
            const { clientID, dpID, brokerName } = item;
            const dematID = `${dpID}${clientID}`;
            return (
              <DematCard
                key={dematID}
                clientID={clientID}
                dpID={dpID}
                brokerName={brokerName}
                onClick={() => {
                  onClick(dematID, item);
                }}
              />
            );
          })}
        </div>
        <div className={styles.Note}>
          Preferred Demat not in above list?{' '}
          <span className={styles.ClickHere} onClick={onClose}>
            Click here
          </span>
        </div>
        <Button width={'100%'} onClick={() => onSubmit(selectedDematData)}>
          Confirm
        </Button>
      </div>
    </MaterialModalPopup>
  );
}
