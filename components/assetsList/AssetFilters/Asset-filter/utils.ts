import { NextRouter } from 'next/router';
import { RootState } from '../../../../redux';
import { ParsedUrlQuery } from 'querystring';

export const syncAssetFiltersToURL = (router: NextRouter, state: RootState) => {
  const { filters, sortOption } = state.assetFilters;

  const query: Record<string, string | string[]> = {};

  if (sortOption) {
    query.sort = sortOption;
  }

  Object.entries(filters || {}).forEach(([key, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      query[key] = values;
    }
  });
  const queryString = Object.entries(query)
    .flatMap(([key, val]) =>
      Array.isArray(val)
        ? val.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
        : [`${encodeURIComponent(key)}=${encodeURIComponent(val)}`]
    )
    .join('&');

  const url = queryString
    ? `${router.pathname}?${queryString}`
    : router.pathname;
  router.push(url, undefined, { shallow: true });
};

export const parseAssetFiltersFromURL = (
  query: ParsedUrlQuery
): { sort?: string; filters: Record<string, string[]> } => {
  const filters: Record<string, string[]> = {};
  let sort: string | undefined = undefined;

  Object.entries(query).forEach(([key, value]) => {
    if (key === 'sort') {
      sort = Array.isArray(value) ? value[0] : (value as string);
    } else {
      if (Array.isArray(value)) {
        filters[key] = value;
      } else {
        filters[key] = [value as string];
      }
    }
  });

  return {
    sort,
    filters,
  };
};


