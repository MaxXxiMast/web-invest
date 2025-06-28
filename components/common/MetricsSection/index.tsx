// NODE MODULES
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Components
import MetricCard from './MetricCard';
import Image from '../../primitives/Image';
import Button, { ButtonType } from '../../primitives/Button';

// Utils
import { getMetrics, getSectionFromHomePage } from '../../../utils/discovery';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { fetchAPI } from '../../../api/strapi';

// Styles
import styles from './MetricsSection.module.css';

const MetricsSection = () => {
  const router = useRouter();

  const [finalData, setFinalData] = useState<
    | {
        homepage: any;
        keyMetrics: any;
      }
    | {}
  >({});

  const { homepage = {}, keyMetrics = {} } = finalData as any;

  const { keyFigures } = getSectionFromHomePage(homepage);

  const data = keyFigures;

  const fetchHomePageData = async () => {
    const [homepageResult, keyMetrics] = await Promise.all([
      fetchAPI('/home-page', {
        populate: {
          keyFigures: {
            populate: '*',
          },
        },
      }),
      fetchAPI('/v1/stats/returns', {}, {}, true),
    ]);
    setFinalData({
      homepage: homepageResult?.data,
      keyMetrics: keyMetrics,
    });
  };

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const figures = data['figures'];

  const metricsCards = getMetrics(figures, keyMetrics).map((data) => (
    <MetricCard key={data.label} data={data} />
  ));

  const goToTransparancy = () => {
    router.push('/transparency');
  };

  return (
    <div className={`${styles.key_figures}`}>
      <div className="containerNew">
        <div className={styles.key_figures_container}>
          <div className={`${styles.key_figures__metrics}`}>
            <div className={styles.MetricHeadingContainer}>
              <div className={styles.GripVectorImage}>
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}discovery/grip_vector.svg`}
                  width={46}
                  height={35}
                  alt="gripvector"
                />
              </div>
              <div className={styles.MetricHeadingSubContainer}>
                <div className={styles.MetricHeading}>Grip at a glance</div>
                <div className={styles.MetricSubHeading}>
                  We aim to strengthen trust among our customers by making our
                  numbers accessible to all
                </div>
              </div>
            </div>
            <div className={styles.key_figures__section}>{metricsCards}</div>
          </div>
        </div>
      </div>
      <div className={styles.TransparencyButton}>
        <Button variant={ButtonType.Primary} onClick={goToTransparancy}>
          View Our Numbers
        </Button>
      </div>
    </div>
  );
};

export default MetricsSection;
