/**
 * Blog page data populate query
 */
export const blogPopulateQuery = {
  Article: {
    populate: {
      articleContent: '*',
      authorImage: {
        populate: '*',
      },
      coverImage: {
        populate: '*',
      },
      social: {
        populate: '*',
      },
    },
  },
  blog_categories: {
    populate: '*',
  },
  seo: {
    populate: '*',
  },
  attached_articles: {
    populate: {
      Article: {
        populate: {
          authorImage: {
            populate: '*',
          },
          coverImage: {
            populate: '*',
          },
        },
      },
      blog_categories: {
        populate: '*',
      },
    },
  },
};

/**
 * function to get array of string based on given params
 * @param articleData Article Object
 * @returns Array of tag names
 */

export const getArticleTagsArr = (articleData: any): string[] => {
  const dataArr: any[] = articleData?.blog_categories?.data || [];
  let tagArr: any[] = [];
  if (dataArr.length > 0) {
    tagArr = dataArr.map((ele: any) => ele?.attributes?.label);
  }
  return tagArr;
};

export class ImageModel {
  desktopUrl?: any;
  mobileUrl?: any;
  altText?: string;
}

export class AuthorModel {
  name?: string;
  date?: string;
  image?: ImageModel;
}

export class ArticleModel {
  image?: ImageModel;
  title?: string;
  shortDescription?: any;
  description?: any;
  author?: AuthorModel;
}

/**
 *
 * @param val String value
 * @param splitChar String split character
 * @returns Last item of split string
 */
export const getLastArrItemFromSplitString = (
  val: string,
  splitChar = '/'
): string => {
  if (val && val.trim() !== '') {
    const splitArr = val.split(splitChar);
    return splitArr[splitArr.length - 1];
  }
  return val;
};

export const blogCategoryForNavigation = {
  populate: {
    image: {
      populate: '*',
    },
  },
};

export type BlogCategoryStrapiData = Partial<{
  label: string;
  showNavigationDesktop: boolean;
  showNavigationMobile: boolean;
  image: any;
  [key: string]: string | boolean;
}>;
