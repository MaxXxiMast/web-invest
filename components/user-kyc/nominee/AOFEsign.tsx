// NODE MODULES
import React from 'react';

// Common Components
import Image from '../../primitives/Image';
import Button from '../../primitives/Button';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { EsignInfo } from '../utils/NomineeUtils';

// Styles
import classes from './Nominee.module.css';

type AOFEsignProps = {
  handleEsign: () => {};
  loading: boolean;
};

const AOFEsign = (props: AOFEsignProps) => {
  const { handleEsign, loading } = props;

  return (
    <div className={classes.EsignContainer}>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}icons/signature.svg`}
        alt={'Esign'}
        width={120}
        height={120}
        layout="fixed"
      />
      <div className={classes.EsignTitle}>{EsignInfo.title}</div>
      <div className={classes.EsignDesc}>{EsignInfo.description}</div>
      <Button
        onClick={handleEsign}
        disabled={loading}
        width={'100%'}
        className={classes.EsignButton}
        isLoading={loading}
      >
        Proceed to eSign
      </Button>
    </div>
  );
};

export default AOFEsign;
