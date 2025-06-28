import { useEffect, useState } from 'react';

// Components
import AssetMobileButton from '../AssetMobileButton';

//API
import { fetchAPI } from '../../../api/strapi';

import CssScrollCarousel from '../../css-scroll-carousel';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import TestimonialCardComponent from '../../testimonial-card';
import { TestimonialCard } from '../../testimonial-card/types';

// Styles
import styles from './PastAssetDetailCalculator.module.css';

const PastAssetDetailCalculator = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTestimonialData = async () => {
    setLoading(true);
    try {
      const homePageTopFold = await fetchAPI('/inner-pages-data', {
        filters: {
          url: '/home-top-fold',
        },
        populate: {
          pageData: {
            on: {
              'shared.testimonial-component': {
                populate: {
                  testimonials: {
                    populate: '*',
                  },
                  headerContent: {
                    populate: '*',
                  },
                },
              },
            },
          },
        },
      });
      const homePageData = homePageTopFold?.data[0]?.attributes?.pageData || [];
      const testimonialsFold = homePageData?.find(
        (data) => data?.__component === 'shared.testimonial-component'
      );
      setData(testimonialsFold?.testimonials);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTestimonialData();
  }, []);

  return (
    <div className={styles.PastDealsContent}>
      {loading ? (
        <div className="flex gap-12 mt-12">
          <CustomSkeleton styles={{ height: 160, width: '100%' }} />
          <CustomSkeleton styles={{ height: 160, width: '90px' }} />
        </div>
      ) : (
        <CssScrollCarousel
          slideWidth={500}
          animationSpeed={50}
          data={data}
          renderItem={(item: TestimonialCard, index) => (
            <TestimonialCardComponent key={index} item={item} />
          )}
        />
      )}
      <div className={styles.cardDescription}>
        <p className={styles.header}>
          Join <span className={styles.accent}>2.5 lac+</span> smart investors
          on Grip
        </p>
        <p className={styles.description}>
          Change the way you invest with high yielding curated deals exclusively
          available on Grip
        </p>
      </div>
      <AssetMobileButton className={styles.bottomBgColor} />
    </div>
  );
};

export default PastAssetDetailCalculator;
