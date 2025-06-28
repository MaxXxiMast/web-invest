type SharedComponentsNames = 'seo' | 'links';

type StrapiComponentTypes = `shared.${SharedComponentsNames}`;

type StrapiBasicComponent = {
  id: number;
  __component: StrapiComponentTypes;
};

export interface SharedLinks extends StrapiBasicComponent {
  __component: 'shared.links';
  title: string;
  clickUrl: string;
  accessibilityLabel: string | null;
  openInNewTab: boolean;
}

export interface Seo extends StrapiBasicComponent {
  __component: 'shared.seo';
  metaTitle: string;
  metaDescription: string;
  keywords: null;
  metaRobots: null;
  structuredData: null;
  metaViewport: null;
  canonicalURL: null;
}

export type StrapiComponents = Seo | SharedLinks;

type PageData = Partial<StrapiComponents[]>;

export const getSeoData = (pageData: PageData = []) => {
  return pageData?.find((item) => item.__component === 'shared.seo');
};

export const getAllLinks = (pageData: PageData = []) => {
  return pageData?.filter((item) => item.__component === 'shared.links');
};
