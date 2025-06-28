import Cookie from 'js-cookie';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from '../../Image';

import ArticleComponent from '../../../blog/ArticleComponent';
import MegaMenuLinkItem from '../MegaMenuLinkItem';

import classes from './BlogNavigationContent.module.css';

import {
  BlogCategoryStrapiData,
  getArticleTagsArr,
} from '../../../../utils/blog';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import { getStrapiMediaS3Url } from '../../../../utils/media';
import { urlify } from '../../../../utils/string';
import { AllBlogCategory, BlogCategoryDataNav } from '../data';

function BlogNaviagtionContent({ contextData }) {
  const {
    loading,
    recentArticles,
    totalBlogCount,
    countBlogCategory,
    blogCategories,
  }: any = contextData;

  const isMobile = useMediaQuery('(max-width: 992px)');

  if (loading) {
    return null;
  }

  const renderBlogSlide = (ele: any) => {
    return (
      <ArticleComponent
        key={`nav-article-${ele?.Article?.articleHeading}_${ele?.Article?.publishedAt}`}
        link={ele?.slug}
        image={ele?.Article?.coverImage}
        title={ele?.Article?.articleHeading}
        tagList={getArticleTagsArr(ele)?.slice(-1)}
        author={{
          image: ele?.Article?.authorImage,
          date: ele?.publishedAt,
          name: ele?.Article?.author,
        }}
        description={ele?.Article?.articleContent?.richLabel}
        className={classes.NavArticle}
        titleClassName={classes.NavArticleTitle}
        designVersion="leftImage"
        titleCharCount={50}
      />
    );
  };

  const renderMobileBlogView = () => {
    return (
      <Swiper
        spaceBetween={16}
        slidesPerView={2}
        observeParents
        observer
        breakpoints={{
          0: {
            spaceBetween: 16,
            slidesPerView: 1.1,
          },
          768: {
            spaceBetween: 16,
            slidesPerView: 2,
          },
          1024: {
            spaceBetween: 16,
            slidesPerView: 2,
          },
        }}
        className={classes.SwiperContainer}
      >
        <div className={classes.SwiperBlogWrapper}>
          {recentArticles.map((ele: any) => {
            return (
              <SwiperSlide
                key={`nav-article-${ele?.Article?.articleHeading}-${ele?.Article?.publishedAt}_${ele?.Article?.createdAt}`}
                className={classes.SwiperSlide}
              >
                {renderBlogSlide(ele)}
              </SwiperSlide>
            );
          })}
        </div>
      </Swiper>
    );
  };

  const getBlogCategories = (): (BlogCategoryDataNav | undefined)[] => {
    const visibilityKey = isMobile ? 'mobileVisibity' : 'desktopVisibity';
    const data = blogCategories
      ?.map((ele: BlogCategoryStrapiData) => {
        if (ele?.label && countBlogCategory?.[ele?.label]) {
          const newObj: BlogCategoryDataNav = {
            clickUrl: '/blog',
            title: ele?.label,
            shortDescription: `${countBlogCategory?.[ele?.label] || 0} blogs`,
            openInNewTab: false,
            icon: getStrapiMediaS3Url(ele?.image?.desktopUrl || {}),
            id: urlify(ele?.label),
            desktopVisibity: ele?.showNavigationDesktop ?? false,
            mobileVisibity: ele?.showNavigationMobile ?? false,
            count: countBlogCategory?.[ele?.label] || 0,
          };
          return newObj;
        }
      })
      .filter((ele) => ele?.[visibilityKey])
      .sort(
        (categoryPrev, categoryNext) =>
          (categoryNext?.count ?? 0) - (categoryPrev?.count ?? 0)
      )
      ?.slice(0, isMobile ? 3 : 4);
    data.push({
      ...AllBlogCategory,
      ...{
        shortDescription: `${totalBlogCount} blogs`,
      },
    });

    return data;
  };

  const handleClick = (tag = '') => {
    let categoryIndex = 0;
    if (tag !== AllBlogCategory.title) {
      categoryIndex =
        blogCategories.findIndex((ele: any) => ele?.label === tag) + 1;
    }
    Cookie.set('clickTag', `${categoryIndex}`);
  };

  return (
    <div className={classes.MainContainer}>
      <div className={classes.SubContainerLeft}>
        <div className={classes.Heading}>Top blog categories</div>
        <div className={classes.BlogCategoryContainer}>
          {getBlogCategories()?.map((ele) => {
            return (
              <MegaMenuLinkItem
                key={`${ele?.title}__title`}
                title={ele?.title}
                shortDescription={ele?.shortDescription}
                openInNewTab={ele?.openInNewTab}
                isBgFilledIcon={ele?.isBgFilledIcon}
                handleClick={() => handleClick(ele?.title)}
                clickUrl={ele?.clickUrl}
                icon={
                  ele?.icon ? (
                    <Image
                      src={ele?.icon as string}
                      alt={ele?.title}
                      width={ele?.id === 'blogs' ? 24 : 46}
                      height={ele?.id === 'blogs' ? 24 : 46}
                      layout="fixed"
                    />
                  ) : null
                }
                className={` ${classes.CategoryBox} ${
                  ele?.id === 'blogs' ? classes.TopBorder : ''
                }`}
                iconClassName={classes.IconClassName}
              />
            );
          })}
        </div>
      </div>
      <div className={classes.SubContainerRight}>
        <div className={classes.Heading}>Latest from our blogs</div>
        {isMobile ? (
          renderMobileBlogView()
        ) : (
          <div className={classes.BlogsContainer}>
            {recentArticles?.map(renderBlogSlide)}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogNaviagtionContent;
