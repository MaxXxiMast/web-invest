import { createContext } from 'react';

type TagsType = Partial<{
  id: number;
  attributes: {
    label: string;
    tagId: string;
    apiLabel: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}>;

export type FAQType = Partial<{
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  isBonds: boolean | null;
  isSDI: boolean | null;
  isLLP: boolean | null;
  isCommercialRealEstate: boolean | null;
  isStartupEquity: boolean | null;
  tags: {
    data: TagsType[];
  };
}>;

type PortfolioContext = {
  pageData: any[];
};

export const PortfolioContext = createContext<PortfolioContext>({
  pageData: [],
});
