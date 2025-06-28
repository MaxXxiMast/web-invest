import { render, screen, waitFor } from '@testing-library/react';
import ArticleSection from './index';
import * as apiUtils from '../../../api/strapi';
import * as blogUtils from '../../../utils/blog';
import * as mediaQueryHook from '../../../utils/customHooks/useMediaQuery';

// Mocks
jest.mock(
  '../../../skeletons/article-section-skeleton/ArticleSectionSkeleton',
  () => {
    const SkeletonLoader = () => (
      <div data-testid="skeleton-loader">Loading...</div>
    );
    SkeletonLoader.displayName = 'SkeletonLoader';
    return SkeletonLoader;
  }
);

jest.mock('../../discovery/SectionComponent/SectionComponent', () => {
  const SectionComponent = ({
    handleSlideComponent,
    sliderDataArr,
    sliderOptions,
  }: any) => (
    <div
      data-testid="section-component"
      data-slider-options={JSON.stringify(sliderOptions)}
    >
      {sliderDataArr.map((data: any, i: number) => (
        <div key={i} data-testid={`slide-${i}`}>
          {handleSlideComponent(data, 'popularBlogs')}
        </div>
      ))}
    </div>
  );
  SectionComponent.displayName = 'SectionComponent';
  return SectionComponent;
});

jest.mock('../ArticleComponent', () => {
  const MockArticleComponent = (props: any) => (
    <div data-testid="article">
      <h2>{props.title}</h2>
      <p>{props.description}</p>
      <div>{props.tagList?.join(', ')}</div>
      <div>{props.author?.name}</div>
    </div>
  );
  MockArticleComponent.displayName = 'MockArticleComponent';
  return MockArticleComponent;
});

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

describe('ArticleSection', () => {
  const mockArticles = [
    {
      id: 1,
      attributes: {
        Article: {
          articleHeading: 'Test Heading',
          publishedAt: '2024-04-16T00:00:00.000Z',
          coverImage: 'test-image.jpg',
          authorImage: 'author.jpg',
          author: 'John Doe',
          articleContent: {
            richLabel: 'Test content',
          },
        },
        slug: 'test-article',
        publishedAt: '2024-04-16T00:00:00.000Z',
      },
    },
  ];

  beforeEach(() => {
    jest.spyOn(apiUtils, 'fetchAPI').mockResolvedValue({ data: mockArticles });
    jest
      .spyOn(blogUtils, 'getArticleTagsArr')
      .mockReturnValue(['Tag1', 'Tag2']);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('renders loader initially', async () => {
    render(<ArticleSection isInvestedUser={false} />);
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('section-component')).toBeInTheDocument();
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });
  });

  it('renders articles after loading', async () => {
    render(<ArticleSection isInvestedUser={false} />);
    await waitFor(() => screen.getAllByTestId('article'));

    const articles = screen.getAllByTestId('article');
    expect(articles).toHaveLength(1);
    expect(articles[0].textContent).toContain('Test Heading');
    expect(articles[0].textContent).toContain('Test content');
    expect(articles[0].textContent).toContain('Tag1, Tag2');
    expect(articles[0].textContent).toContain('John Doe');
  });

  it('calls fetchAPI with correct params', async () => {
    render(<ArticleSection isInvestedUser={false} />);
    await waitFor(() => screen.getByTestId('section-component'));

    expect(apiUtils.fetchAPI).toHaveBeenCalledTimes(1);
    expect(apiUtils.fetchAPI).toHaveBeenCalledWith('/articles', {
      populate: blogUtils.blogPopulateQuery,
      sort: ['createdAt:desc'],
      pagination: { page: 1, pageSize: 10 },
    });
  });

  it('uses correct slide count for desktop', async () => {
    render(<ArticleSection isInvestedUser={false} />);
    await waitFor(() => screen.getByTestId('section-component'));

    const sectionComponent = screen.getByTestId('section-component');
    const sliderOptions = JSON.parse(sectionComponent.dataset.sliderOptions);
    expect(sliderOptions.slidesPerView).toBe(4);
  });

  it('uses correct slide count for mobile', async () => {
    jest
      .spyOn(mediaQueryHook, 'useMediaQuery')
      .mockImplementation((query: string) => {
        return query === '(max-width: 992px)' ? true : false;
      });

    render(<ArticleSection isInvestedUser={false} />);
    await waitFor(() => screen.getByTestId('section-component'));

    const sectionComponent = screen.getByTestId('section-component');
    const sliderOptions = JSON.parse(sectionComponent.dataset.sliderOptions);
    expect(sliderOptions.slidesPerView).toBe(1.2);
  });

  it('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(apiUtils, 'fetchAPI').mockRejectedValue(new Error('Failed'));

    render(<ArticleSection isInvestedUser={false} />);
    await waitFor(() => {
      expect(screen.getByTestId('section-component')).toBeInTheDocument();
      expect(screen.queryByTestId('article')).not.toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch articles',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
