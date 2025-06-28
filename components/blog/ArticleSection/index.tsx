// NODE MODULES
import { useCallback, useEffect, useState } from 'react';

// Components
import SectionComponent from '../../discovery/SectionComponent/SectionComponent';
import ArticleComponent from '../ArticleComponent';

// Utils
import { fetchAPI } from '../../../api/strapi';
import { blogPopulateQuery, getArticleTagsArr } from '../../../utils/blog';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Skeleton
import ArticleSectionSkeleton from '../../../skeletons/article-section-skeleton/ArticleSectionSkeleton';

// Styles
import classes from './ArticleSection.module.css';

export default function ArticleSection({ isInvestedUser }) {
  const [featureArticles, setFeatureArticles] = useState([]);
  const isMobileDevice = useMediaQuery('(max-width: 992px)');
  const smallMobile = useMediaQuery('(max-width: 350px)');

  const [isLoading, setIsLoading] = useState(true);

  const getArticles = useCallback(async () => {
    try {
      const articleRes = await fetchAPI('/articles', {
        populate: blogPopulateQuery,
        sort: ['createdAt:desc'],
        pagination: {
          page: 1,
          pageSize: 10,
        },
      });

      setFeatureArticles(articleRes?.data);
    } catch (error) {
      console.error('Failed to fetch articles', error);
    }
  }, []);

  useEffect(() => {
    getArticles().then(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderSlide = (ele: any, sectionId?: string) => {
    // Popular Blog Slide Component
    if (sectionId === 'popularBlogs') {
      return (
        <ArticleComponent
          key={`${ele?.Article?.articleHeading}_${ele?.Article?.publishedAt}--`}
          link={ele?.slug}
          image={ele?.Article?.coverImage}
          title={ele?.Article?.articleHeading}
          tagList={getArticleTagsArr(ele)?.slice(0, 2)}
          author={{
            image: ele?.Article?.authorImage,
            date: ele?.publishedAt,
            name: ele?.Article?.author,
          }}
          description={ele?.Article?.articleContent?.richLabel}
          designVersion="leftImage"
          showReadTimeAuthor={true}
          titleCharCount={smallMobile ? 40 : 48}
        />
      );
    }
  };

  const renderBlogSection = () => {
    const blogArr: any[] = featureArticles
      ?.slice(0, 5)
      ?.map((ele: any) => ele?.attributes);

    const slideCount = isMobileDevice ? 1.2 : 4;
    const spaceBetween = 16;
    return (
      <SectionComponent
        data={{
          sectionTitle: 'Latest blogs from us',
        }}
        sectionKey={`SectionComponent__PopularBlogs`}
        handleSlideComponent={(slideData) =>
          renderSlide(slideData, 'popularBlogs')
        }
        key={`SectionComponentPopularBlogs`}
        sliderDataArr={blogArr}
        isSliderSection={true}
        sliderOptions={{
          slidesPerView: slideCount,
          spaceBetween: spaceBetween,
        }}
        isShowBlurEnd={!isMobileDevice}
        className={classes.LatestBLogs}
        stylingClass={classes.sliderLatestBlogs}
      />
    );
  };
  return isLoading ? <ArticleSectionSkeleton /> : renderBlogSection();
}
