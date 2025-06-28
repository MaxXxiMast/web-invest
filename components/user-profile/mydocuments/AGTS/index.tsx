// NODE MODULES
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Common Components
import DocumentButton from '../DocumentButton';

// Styles
import styles from './AGTS.module.css';
import AGTSDocModal from '../../../portfolio/AGTSDocModal';

const MaterialModalPopup = dynamic(
  () => import('../../../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

export default function AGTS({ agtsDocuments }: { agtsDocuments: any[] }) {
  const [showAGTSModal, setShowAGTSModal] = useState(false);

  if (!agtsDocuments?.length) return null;

  return (
    <>
      <DocumentButton
        key={'agts'}
        name="AGTS"
        onClick={() => setShowAGTSModal(true)}
      />
      <MaterialModalPopup
        showModal={showAGTSModal}
        handleModalClose={() => {
          setShowAGTSModal(false);
        }}
        className={styles.AGTSDocModal}
        isModalDrawer
      >
        <AGTSDocModal
          agts={agtsDocuments}
          closeModal={() => {
            setShowAGTSModal(false);
          }}
        />
      </MaterialModalPopup>
    </>
  );
}
