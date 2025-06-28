import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { urlify } from '../../../utils/string';
import { fetchAPI } from '../../../api/strapi';
import { faqStrapiQuery } from '../../../utils/discovery';

import classes from './FAQSection.module.css';

// Skeleton
import FAQSectionSkeleton from '../../../skeletons/faq-section-skeleton/FAQSectionSkeleton';

const sortCompareFunction = (a: any, b: any) => {
  const first = a?.displayOrder || Infinity;
  const second = b?.displayOrder || Infinity;
  return first - second;
};

export default function FAQSection() {
  const router = useRouter();
  const [faqData, setFaqData] = useState(null);
  const [faqCategoriesData, setFaqCateoriesData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const renderCategories = () => {
    const categoryToShow: any = [];
    const categories = faqCategoriesData
      ?.filter(
        (val: any) =>
          val.attributes?.faqType?.data?.attributes?.label === 'Asset Types'
      )
      .map((val: any) => val.attributes)
      ?.sort(sortCompareFunction);
    const allQuestionsData = faqData?.attributes?.faqSections
      ?.map((sectionData: any) => sectionData?.data)
      ?.flat();
    categories?.forEach((category: any) => {
      const categoryQuestions = allQuestionsData
        ?.map((question: any) => {
          const categoriesLabelMap = question?.faqCategories?.data?.map(
            (category: any) => {
              return {
                lowerCase: category?.attributes?.label?.toLowerCase(),
                originalLabel: category?.attributes?.label,
              };
            }
          );
          for (const value of categoriesLabelMap) {
            if (value?.originalLabel === category?.label) {
              return question;
            }
          }
        })
        .filter(Boolean);
      if (categoryQuestions.length) {
        categoryToShow.push({
          label: `Everything About ${category?.label}`,
          question: `${categoryQuestions.length} Question${
            categoryQuestions.length > 1 ? 's' : ''
          }`,
          url: urlify(
            `/faq/${category?.faqType?.data?.attributes?.label}/${category?.label}`
          ),
        });
      }
    });
    // All FAQS
    categoryToShow.push({
      label: `All FAQs`,
      question: `${allQuestionsData?.length} Question${
        allQuestionsData?.length > 1 ? 's' : ''
      }`,
      url: '/faq',
    });
    return categoryToShow;
  };

  const categoriesData = useMemo(
    () => renderCategories(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [faqCategoriesData, faqData]
  );

  const onClickFAQ = (url: string) => {
    window.open(url, '_blank');
  };

  const getFAQData = async () => {
    const [faqResult, faqCategoriesResult] = await Promise.all([
      fetchAPI('/faq', faqStrapiQuery),
      fetchAPI('/faq-category-news', {
        populate: {
          icon: {
            populate: '*',
          },
          faqType: {
            populate: '*',
          },
        },
      }),
    ]);
    setFaqData(faqResult?.data);
    setFaqCateoriesData(faqCategoriesResult?.data);
  };
  useEffect(() => {
    getFAQData().then(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <FAQSectionSkeleton />;
  }

  return (
    <div className={classes.CardHeader}>
      <div className={classes.HeaderLeft}>
        <h3>Browse FAQs</h3>
        <h4>Get to know everything about us and our offerings</h4>
      </div>

      <div className={classes.FAQContainer}>
        {categoriesData.map((data) => {
          return (
            <div
              key={data?.label}
              className={classes.FAQDiscoverBox}
              onClick={() => onClickFAQ(data?.url)}
            >
              <div className={classes.FAQHeadingContainer}>
                <div className={classes.Heading}>{data?.label}</div>
                <div className={classes.SubHeading}>{data?.question}</div>
              </div>
              <div className="RightArrow">
                <span className={`icon-caret-right ${classes.Arrow}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
