import { trackVisualReturnsClick } from './event';
import { trackEvent } from './gtm';

jest.mock('./gtm', () => ({
  trackEvent: jest.fn(),
}));

const userID = 'user_456';
const investmentAmount = 100000;

beforeEach(() => {
  jest.clearAllMocks();
});

test('should call trackEvent with all valid asset fields (happy path)', () => {
  const asset = {
    assetID: 'a1',
    assetName: 'Asset Name',
    productCategory: 'Debt',
    productSubcategory: 'Bond',
    financeProductType: 'TypeA',
  };

  trackVisualReturnsClick({
    asset,
    userID,
    investmentAmount,
    lotSize: 5,
    isMobile: true,
  });

  expect(trackEvent).toHaveBeenCalledWith('visualise_returns', {
    user_id: userID,
    asset_id: 'a1',
    visualised_amount: 100000,
    asset_name: 'Asset Name',
    device: 'mobile',
    product_category: 'Debt',
    product_sub_category: 'Bond',
    lots_selected: 5,
    cta_text: 'Visualise Returns',
    financial_product_type: 'TypeA',
  });
});

test('should handle asset with missing optional fields (undefined props)', () => {
  const asset = {
    assetID: 'a2',
  };

  trackVisualReturnsClick({
    asset,
    userID,
    investmentAmount,
    isMobile: false,
  });

  expect(trackEvent).toHaveBeenCalledWith('visualise_returns', {
    user_id: userID,
    asset_id: 'a2',
    visualised_amount: 100000,
    asset_name: undefined,
    device: 'desktop',
    product_category: undefined,
    product_sub_category: undefined,
    lots_selected: null,
    cta_text: 'Visualise Returns',
    financial_product_type: undefined,
  });
});

test('should handle asset as null (tests asset?.)', () => {
  trackVisualReturnsClick({
    asset: null as any,
    userID,
    investmentAmount,
    isMobile: true,
  });

  expect(trackEvent).toHaveBeenCalledWith('visualise_returns', {
    user_id: userID,
    asset_id: undefined,
    visualised_amount: 100000,
    asset_name: undefined,
    device: 'mobile',
    product_category: undefined,
    product_sub_category: undefined,
    lots_selected: null,
    cta_text: 'Visualise Returns',
    financial_product_type: undefined,
  });
});

test('should handle asset as undefined (also tests asset?.)', () => {
  trackVisualReturnsClick({
    asset: undefined as any,
    userID,
    investmentAmount,
    isMobile: false,
  });

  expect(trackEvent).toHaveBeenCalledWith('visualise_returns', {
    user_id: userID,
    asset_id: undefined,
    visualised_amount: 100000,
    asset_name: undefined,
    device: 'desktop',
    product_category: undefined,
    product_sub_category: undefined,
    lots_selected: null,
    cta_text: 'Visualise Returns',
    financial_product_type: undefined,
  });
});
