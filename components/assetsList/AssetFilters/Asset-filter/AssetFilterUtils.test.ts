import { syncAssetFiltersToURL, parseAssetFiltersFromURL } from './utils';
import { NextRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { RootState } from '../../../../redux';

const createMockRouter = (): jest.Mocked<NextRouter> => ({
  route: '',
  pathname: '/assets',
  basePath: '',
  asPath: '',
  query: {},
  locale: undefined,
  locales: undefined,
  defaultLocale: undefined,
  domainLocales: undefined,
  isLocaleDomain: false,
  isReady: true,
  isFallback: false,
  isPreview: false,
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
});

describe('syncAssetFiltersToURL', () => {
  it('should construct URL with sort and filters and call router.push', () => {
    const mockRouter = createMockRouter();

    const mockState = {
        assetFilters: {
          sortOption: 'rating-desc',
          filters: {
            type: ['Bond', 'FD'],
            rating: ['AAA'],
          },
        },
      } as unknown as RootState;
      

    syncAssetFiltersToURL(mockRouter, mockState);

    const expectedUrl =
      '/assets?sort=rating-desc&type=Bond&type=FD&rating=AAA';
    expect(mockRouter.push).toHaveBeenCalledWith(expectedUrl, undefined, {
      shallow: true,
    });
  });

  it('should only include filters with non-empty arrays', () => {
    const mockRouter = {
      push: jest.fn(),
      pathname: '/assets',
    } as unknown as NextRouter;
  
    const mockState = {
      assetFilters: {
        sortOption: 'relevance',
        filters: {
          type: [], // will be skipped
          risk: ['Low'], // included
        },
      },
    } as unknown as RootState;
  
    syncAssetFiltersToURL(mockRouter, mockState);
  
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/assets?sort=relevance&risk=Low',
      undefined,
      { shallow: true }
    );
  });
  

  it('should handle empty sortOption and filters', () => {
    const mockRouter = createMockRouter();

    const mockState = {
        assetFilters: {
          sortOption: '',
          filters: {
            type: [],
          },
        },
      } as unknown as RootState;      

    syncAssetFiltersToURL(mockRouter, mockState);

    expect(mockRouter.push).toHaveBeenCalledWith('/assets', undefined, {
      shallow: true,
    });
  });
});

describe('parseAssetFiltersFromURL', () => {
  it('should parse query with multiple filters and sort', () => {
    const query: ParsedUrlQuery = {
      sort: 'popularity',
      type: ['Bond', 'FD'],
      rating: 'AAA',
    };

    const result = parseAssetFiltersFromURL(query);
    expect(result).toEqual({
      sort: 'popularity',
      filters: {
        type: ['Bond', 'FD'],
        rating: ['AAA'],
      },
    });
  });

  it('should handle query with only filters', () => {
    const query: ParsedUrlQuery = {
      type: 'Bond',
    };

    const result = parseAssetFiltersFromURL(query);
    expect(result).toEqual({
      sort: undefined,
      filters: {
        type: ['Bond'],
      },
    });
  });

  it('should handle empty query', () => {
    const query: ParsedUrlQuery = {};

    const result = parseAssetFiltersFromURL(query);
    expect(result).toEqual({
      sort: undefined,
      filters: {},
    });
  });

  it('should handle query with array sort (invalid case)', () => {
    const query: ParsedUrlQuery = {
      sort: ['relevance', 'rating'],
    };

    const result = parseAssetFiltersFromURL(query);
    expect(result.sort).toBe('relevance');
  });
});
