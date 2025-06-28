import { useState, useEffect } from 'react';

import Image from '../../primitives/Image';
import PlaneIcon from '../../../components/assets/static/assetList/PlaneIcon.svg';

import { changeNumberFormat } from '../../../utils/number';

import { fetchAPI } from '../../../api/strapi';

import styles from './InvestementNumberCard.module.css';

const InvestementNumberCard = ({ className = '', transparencyData }) => {
  const [amount, setAmount] = useState(0);

  const fetchAmount = async () => {
    const res = await fetchAPI('/v1/stats/returns', {}, {}, true);
    setAmount(res?.totalInvestmentAmount);
  };

  useEffect(() => {
    fetchAmount();
  }, []);

  return (
    <>
      <div className={`${styles.InvestementNumberCard} ${className}`}>
        <div className={`${styles.CardBody}`}>
          <p className={styles.WeAreTransparent}>{transparencyData?.name}</p>
          <div className={styles.PlaneIcon}>
            <div className={styles.ImageContainer}>
              <Image src={PlaneIcon} alt="PlaneIcon" />
            </div>
            <div className={styles.ImageContent}>
              <h3>{changeNumberFormat(String(amount), 0)}</h3>
              <p>{transparencyData?.subLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvestementNumberCard;
