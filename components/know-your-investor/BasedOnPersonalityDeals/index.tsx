import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classes from './BasedOnPersonality.module.css';

// primitives
import SectionComponent from '../../discovery/SectionComponent/SectionComponent';
import AssetCardComponent from '../../primitives/AssetCardComponent/AssetCardComponent';

// utils
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Apis
import { getAssetsResultsPersona } from '../../../api/persona';

export const updatePersonaDataField = (data = []) => {
  if (!Array.isArray(data)) return [];

  const output = data.map((entry) => ({
    partner: {
      logo: entry?.logo,
    },
    minInvestmentAmount: entry?.minInvest,
    minInvestment: entry?.minInvest,
    status: 'active',
    ...entry,
  }));
  return output;
};

const handleSlideComponent = (slideData: any) => (
  <AssetCardComponent asset={slideData} isPersona />
);

const BasedOnPersonalityDeals: React.FC = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const isMobileDevice = useMediaQuery();
  const { customerPersonality = '' } = useSelector(
    (state: any) => state?.knowYourInvestor ?? {}
  );

  let slideCount = isMobileDevice ? 1.2 : 2.4;
  let spaceBetween = isMobileDevice ? 14 : 18;

  const title = `Discover the deals for ${customerPersonality}`;

  useEffect(() => {
    getAssetsResultsPersona({ limit: 5 })
      .then((res) => {
        const { data = [] } = res ?? {};
        setDeals(updatePersonaDataField(data));
      })
      .catch((err) => {
        setDeals([]);
      });
  }, [customerPersonality]);

  if (!Array.isArray(deals) || deals?.length <= 1 || !customerPersonality) {
    return null;
  }

  return (
    <SectionComponent
      data={{
        sectionTitle: title,
      }}
      sectionKey={`SectionComponent`}
      handleSlideComponent={(slideData) => handleSlideComponent(slideData)}
      key={`SectionComponent`}
      sliderDataArr={deals}
      sliderOptions={{
        slidesPerView: slideCount,
        spaceBetween: spaceBetween,
      }}
      stylingClass={classes.sliderPopular}
      isShowBlurEnd={deals.length > 2 && !isMobileDevice}
    />
  );
};

export default BasedOnPersonalityDeals;
