import React, { useState } from 'react';
import dompurify from 'dompurify';

import CircularProgress from '@mui/material/CircularProgress';

import Image from '../../primitives/Image';
import IconDialog from '../../common/IconDialog';

import styles from './AIFConsent.module.css';

import { mediaQueries } from '../../utils/designSystem';
import { getObjectClassNames } from '../../utils/designUtils';
import { useAppSelector } from '../../../redux/slices/hooks';

import { assetStatus } from '../../../utils/asset';
import {
  isAssetCommercialProduct,
  isAssetStartupEquity,
} from '../../../utils/financeProductTypes';

const classes: any = getObjectClassNames({
  consentText: {
    fontSize: 12,
    lineHeight: '24px',
    margin: '8px 0',
    [mediaQueries.phone]: {
      width: '110%',
    },
  },
  hyperLink: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: '#00357c',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'left',
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 600,
  },
});

type MyProps = {
  hideAIFConsent?: boolean;
  hideAIFPartnerLogo?: boolean;
};

function AifConsent({
  hideAIFConsent = false,
  hideAIFPartnerLogo = false,
}: MyProps) {
  const sanitizer = dompurify.sanitize;
  const [showPopUp, setPopUp] = useState(false);

  const asset = useAppSelector((state) => state.assets?.selectedAsset || {});
  const spvDetails = asset?.spv;

  const { aifDetails = {} } = spvDetails;
  const { tooltip, tooltipText } = aifDetails;

  const isPastAsset = assetStatus(asset) === 'past';

  const hideAIFConsentText = isAssetStartupEquity(asset) && isPastAsset;

  const renderTooltipText = () => {
    return tooltip ? (
      <div
        className={classes.subHeader}
        dangerouslySetInnerHTML={{
          __html: sanitizer(tooltip),
        }}
      />
    ) : (
      <div className={classes.subHeader}>
        Investments in the investee companies are being secured from the Grand
        Anicut Angel Fund, a duly SEBI registered Angel Fund having registration
        number:{' '}
        <span className={classes.bold}>IN/AIF1/19-20/0738 (“Fund”)</span>{' '}
        managed by{' '}
        <a
          href="https://www.anicutcapital.com/"
          target={'_blank'}
          rel="noopener noreferrer"
        >
          Anicut Capital
        </a>{' '}
        LLP (“
        <span className={classes.bold}>Investment Manager</span>”). I agree to
        become a contributor to the Fund and hereby confirm my approval for
        investments in schemes launched by the Fund.
      </div>
    );
  };

  const getSEBIRegistredPartnerStyles = () => {
    return `${styles.BottomExtraCard} ${
      hideAIFConsentText ? styles.BottomExtraCardSEPast : ''
    } ${
      isAssetCommercialProduct(asset) && isPastAsset
        ? styles.BottomExtraCardCREPast
        : ''
    }`;
  };

  const renderAIFConsentText = () => {
    return !hideAIFConsent ? (
      <div className={styles.BottomExtraContent}>
        <p>
          By Continuing, I agree to be the part of{' '}
          <span className={styles.hyperLink} onClick={() => setPopUp(true)}>
            {tooltipText ?? 'AIF'}
          </span>
        </p>
      </div>
    ) : null;
  };

  const renderSPVLogo = () => {
    return spvDetails?.spvLogo ? (
      <Image src={spvDetails?.spvLogo} alt="Anicut" />
    ) : (
      <CircularProgress size={20} />
    );
  };

  return (
    <>
      {renderAIFConsentText()}
      {!hideAIFPartnerLogo ? (
        <div className={getSEBIRegistredPartnerStyles()}>
          <span className={styles.ExtraCardContent}>
            Registered AIF Partner
          </span>
          <span className={styles.ExtraCardImage}>{renderSPVLogo()}</span>
        </div>
      ) : null}

      <IconDialog
        showDialog={showPopUp}
        headingText={tooltipText ?? 'AIF'}
        subHeadingText={''}
        onSubmit={() => setPopUp(false)}
        onCloseDialog={() => setPopUp(false)}
        id="consent"
        submitButtonText={'OKAY'}
      >
        {renderTooltipText()}
      </IconDialog>
    </>
  );
}

export default AifConsent;
