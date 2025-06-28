import React from 'react';
import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import styles from './FAQSectionSkeleton.module.css';

const FAQSectionSkeleton = () => {
  return (
    <div className={styles.container}>
      <CustomSkeleton className={styles.Title} />
      <CustomSkeleton className={styles.SubTitle} />
      <CustomSkeleton className={styles.Content} />
    </div>
  );
};

export default FAQSectionSkeleton;
