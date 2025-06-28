// NODE MODULES
import { useEffect, useState } from 'react';

// Components
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import LiveTabs from '../LiveTabs';
import Image from '../../primitives/Image';

// Utils
import { getStrapiMediaS3Url } from '../../../utils/media';

// Styles
import classes from './LiveCards.module.css';

type Props = {
  comparisonData?: any;
  title?: string;
};

const LiveCards = ({ comparisonData, title = '' }: Props) => {
  let autoChangeTime = 5;
  const isMobile = useMediaQuery();

  const [activeFilterIndex, setActiveFilterIndex] = useState(0);

  const isProductHovered = false;
  const [secondIterator, setSecondIterator] = useState(autoChangeTime);

  const filterArr = comparisonData?.map((ele) => ele?.Value);
  const cardsData = comparisonData?.map((ele) => {
    return {
      label: ele?.Value,
      imageURL: getStrapiMediaS3Url(ele?.image),
    };
  });

  const handleTabChange = (index: number) => {
    setActiveFilterIndex(index);
    setSecondIterator(autoChangeTime);
  };

  /**
   * Auto tab change for every ${autoChangeTime} seconds
   */

  useEffect(() => {
    let time = secondIterator;

    // RETURN IF HOVER STATE
    if (isProductHovered) {
      return;
    }

    // CHECK HOVER TIME
    const secondaTimer = setInterval(() => {
      // INCREMENT ONLY IF NOT IN HOVER STATE
      time--;
      if (time < 1) {
        time = autoChangeTime;
      }
      setSecondIterator(time);
    }, 1000);

    // AUTO TAB CHANGE ON EVERY GIVEN TIME
    const timeout = setInterval(() => {
      if (activeFilterIndex === filterArr?.length - 1) {
        setActiveFilterIndex(0);
      } else {
        setActiveFilterIndex(activeFilterIndex + 1);
      }
    }, secondIterator * 1000);

    return () => {
      clearInterval(timeout);
      clearInterval(secondaTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProductHovered, activeFilterIndex]);

  const renderCard = (cardDetails: { label: string; imageURL: string }) => {
    const { imageURL } = cardDetails || {};
    if (!imageURL) return null;
    return (
      <div className={classes.CardImage} key={cardDetails.label}>
        <Image src={imageURL} width={335} height={375} alt="url" />
      </div>
    );
  };

  return (
    <div className={classes.MainContainer}>
      {title ? <h3 className={classes.Heading}>{title}</h3> : null}
      {isMobile ? (
        <div className={`${classes.FilterWrapper}`}>
          <LiveTabs
            filterArr={filterArr}
            tabChange={(index) => handleTabChange(index)}
            activeFilter={activeFilterIndex}
            autoChangeTime={autoChangeTime * 1000}
            isProductHovered={isProductHovered}
          />
        </div>
      ) : null}
      <div className={classes.CardDetailsContainer}>
        {isMobile
          ? renderCard(cardsData?.[activeFilterIndex])
          : cardsData?.map((card: any, index: number) => renderCard(card))}
      </div>
    </div>
  );
};

export default LiveCards;
