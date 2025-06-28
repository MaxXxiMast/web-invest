// Node modules
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Compopnents
import PersonaAssetCard from '../../primitives/PersonaAssetCard';
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';

// Utils
import { generateAssetURL } from '../../../utils/asset';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Styles
import styles from './AssetsPersona.module.css';

export default function AssetData({ assetsData }: any) {
  const router = useRouter();
  const isMobile = useMediaQuery();

  useEffect(() => {
    if (!isMobile) {
      const profileCard = document.getElementById('PROFILECARD');
      if (profileCard) {
        const profileCardHeight = profileCard.clientHeight;
        const extraDealCard = document.getElementById('extraDealCard');
        if (extraDealCard) {
          extraDealCard.style.maxHeight = `${profileCardHeight - 40}px`;
        }
      }
    }
  }, [isMobile]);

  const handleClickAsset = (asset: any) => {
    trackEvent('personality_deal_card_clicked', {
      section: 'persona_results',
      asset_id: asset?.assetID,
      asset_name: asset?.partnerName,
    });
    router.push(generateAssetURL(asset));
  };

  const handleOnCliclExplore = (asset: any) => {
    router.push('/assets');
  };

  const renderExploreMoreCard = () => {
    return (
      <div className={`flex-column ${styles.exploreMoreCard}`}>
        <div className={`flex items-center ${styles.exploreMoreTop}`}>
          <span>We have more live deals across the platform</span>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}asset-details-content/personaExplore.svg`}
            alt="Explpre more"
            width={99}
            height={86}
            layout={'fixed'}
          />
        </div>
        <div className="items-align-center-row-wise">
          <Button
            width={'100%'}
            onClick={handleOnCliclExplore}
            variant={ButtonType.PrimaryLight}
          >
            <>
              {`Explore More `}
              <span className="icon-caret-right" />
            </>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <section
      className={`${styles.dealsSection} ${
        assetsData?.length > 1 ? styles.dealCardShadow : ''
      } ${!assetsData?.length ? styles.specialPadding : ''}`}
    >
      <span
        className={`items-align-center-row-wise ${styles.dealsSectionTitle}`}
      >
        DEALS MATCHING YOUR PERSONA
      </span>
      <div
        className={`${styles.dealCard} ${
          assetsData?.length >= 2 ? styles.extraDealCard : ''
        }`}
        id="extraDealCard"
      >
        {assetsData?.map((asset) => {
          return (
            <PersonaAssetCard
              key={asset?.assetID}
              partnerLogo={asset?.logo}
              partnerName={asset?.partnerName}
              assetData={[
                {
                  label: 'YTM',
                  value: `${asset?.irr}%`,
                },
                {
                  label: 'Tenure',
                  value: `${asset?.tenure} ${
                    asset?.tenureType
                      ? asset?.tenureType
                      : `Month${Number(asset?.tenure) > 1 ? 's' : ''}`
                  }`,
                },
              ]}
              handleClick={() => handleClickAsset(asset)}
              buttonText="Invest Now"
            />
          );
        })}
        {renderExploreMoreCard()}
      </div>
    </section>
  );
}
