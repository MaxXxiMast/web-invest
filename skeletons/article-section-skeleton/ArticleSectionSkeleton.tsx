import React from 'react';
import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import styles from './ArticleSectionSkeleton.module.css';

const ArticleSectionSkeleton = () => {
  return (
    <div>
      <CustomSkeleton className={styles.Title} />
      <div className={`flex ${styles.container}`}>
        <CustomSkeleton className={`${styles.ArticleCard}`} />
        <CustomSkeleton className={`${styles.ArticleCard}`} />
        <CustomSkeleton className={`${styles.ArticleCard}`} />
        <CustomSkeleton className={`${styles.ArticleCard}`} />
        <CustomSkeleton className={`${styles.ArticleCard}`} />
      </div>
    </div>
  );
};

export default ArticleSectionSkeleton;
