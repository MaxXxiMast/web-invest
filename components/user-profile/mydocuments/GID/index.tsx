// NODE MODULES
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Common Components
import { GIDDocModal } from '../../../portfolio';
import DocumentButton from '../DocumentButton';

// Styles
import styles from './GID.module.css';

const MaterialModalPopup = dynamic(
  () => import('../../../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

export default function GID({ gidDocuments }: { gidDocuments: any[] }) {
  const [showGIDModal, setShowGIDModal] = useState(false);

  if (!gidDocuments?.length) return null;

  return (
    <>
      <DocumentButton
        key={'gid'}
        name="GID"
        onClick={() => setShowGIDModal(true)}
      />
      <MaterialModalPopup
        showModal={showGIDModal}
        handleModalClose={() => {
          setShowGIDModal(false);
        }}
        className={styles.GIDDocModal}
        isModalDrawer
      >
        <GIDDocModal
          gid={gidDocuments}
          closeModal={() => {
            setShowGIDModal(false);
          }}
        />
      </MaterialModalPopup>
    </>
  );
}
