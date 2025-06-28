import {
  blogPopulateQuery,
  getArticleTagsArr,
  getLastArrItemFromSplitString,
  blogCategoryForNavigation,
  ImageModel,
  AuthorModel,
  ArticleModel,
} from './blog';

describe('blogUtils', () => {
  describe('getArticleTagsArr', () => {
    it('returns array of labels from valid article data', () => {
      const input = {
        blog_categories: {
          data: [
            { attributes: { label: 'Finance' } },
            { attributes: { label: 'Investing' } },
          ],
        },
      };

      const result = getArticleTagsArr(input);
      expect(result).toEqual(['Finance', 'Investing']);
    });

    it('returns empty array if data is missing or empty', () => {
      expect(getArticleTagsArr({})).toEqual([]);
      expect(getArticleTagsArr(null)).toEqual([]);
    });

    it('handles missing labels safely', () => {
      const input = {
        blog_categories: {
          data: [{ attributes: {} }, {}],
        },
      };
      const result = getArticleTagsArr(input);
      expect(result).toEqual([undefined, undefined]);
    });
  });

  describe('getLastArrItemFromSplitString', () => {
    it('returns last item from string split by default "/"', () => {
      expect(getLastArrItemFromSplitString('/blog/hello-world')).toBe('hello-world');
    });

    it('returns last item from string split by custom char', () => {
      expect(getLastArrItemFromSplitString('hello.world.again', '.')).toBe('again');
    });

    it('returns original value if empty string is passed', () => {
      expect(getLastArrItemFromSplitString('')).toBe('');
    });

    it('returns original value if only whitespace is passed', () => {
      expect(getLastArrItemFromSplitString('   ')).toBe('   ');
    });

    it('returns entire value if split char is not present', () => {
      expect(getLastArrItemFromSplitString('nosplit')).toBe('nosplit');
    });
  });

  describe('blogPopulateQuery', () => {
    it('should have required top-level keys', () => {
      expect(blogPopulateQuery).toHaveProperty('Article');
      expect(blogPopulateQuery).toHaveProperty('blog_categories');
      expect(blogPopulateQuery).toHaveProperty('seo');
      expect(blogPopulateQuery).toHaveProperty('attached_articles');
    });

    it('Article should contain nested populate keys', () => {
      expect(blogPopulateQuery.Article.populate).toHaveProperty('articleContent');
      expect(blogPopulateQuery.Article.populate).toHaveProperty('authorImage');
      expect(blogPopulateQuery.Article.populate).toHaveProperty('coverImage');
    });
  });

  describe('blogCategoryForNavigation', () => {
    it('should include image populate structure', () => {
      expect(blogCategoryForNavigation).toEqual({
        populate: {
          image: {
            populate: '*',
          },
        },
      });
    });
  });

  describe('Model classes', () => {
    it('should instantiate ImageModel correctly', () => {
      const img = new ImageModel();
      img.desktopUrl = 'url1';
      img.mobileUrl = 'url2';
      img.altText = 'some image';
      expect(img.desktopUrl).toBe('url1');
    });

    it('should instantiate AuthorModel with image', () => {
      const img = new ImageModel();
      const author = new AuthorModel();
      author.name = 'John';
      author.date = '2023-01-01';
      author.image = img;
      expect(author.name).toBe('John');
    });

    it('should instantiate ArticleModel with full data', () => {
      const img = new ImageModel();
      const author = new AuthorModel();
      const article = new ArticleModel();
      article.image = img;
      article.title = 'Blog Title';
      article.author = author;
      expect(article.title).toBe('Blog Title');
    });
  });
});
