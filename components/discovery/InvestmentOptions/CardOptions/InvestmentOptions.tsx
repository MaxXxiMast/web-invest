import InvestmentOptionsCard from '../Card/InvestmentOptionsCard';
import { InvestmentCardData } from '../../../../utils/discovery';

import styles from './InvestmentOptions.module.css';

type Props = {
  showImageSlide: boolean;
};

function InvestmentOptions({ showImageSlide = false }: Props) {
  const activeAssetClasses = InvestmentCardData?.filter(
    (ele) => ele?.visibility
  )?.sort((a, b) => a?.order - b?.order);

  const productTypesCount = activeAssetClasses.length;
  return (
    <div
      className={`${styles.investmentOptionHolder} ${
        !showImageSlide ? styles.investmentOptionHolderWOImageSLide : ''
      }`}
    >
      <div className={styles.header}>Investment Options on Grip</div>
      <div className={styles.SubHeader}>
        {`15+ Live Deals across ${productTypesCount} Investment options`}
      </div>
      <div className={styles.cardHolder}>
        {activeAssetClasses.map((el, index) => (
          <InvestmentOptionsCard
            key={`invesmentCard_${el?.id}`}
            elementKey={`invesmentCard_${index}`}
            data={el}
          />
        ))}
      </div>
    </div>
  );
}

export default InvestmentOptions;
