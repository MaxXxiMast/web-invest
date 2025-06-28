import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';

import { AppThunk, handleApiError } from '../index';

import {
  fetchAsset,
  fetchAssets,
  fetchPastAsset,
  getOneTimeAgreements,
} from '../../api/assets';
import { callErrorToast, processError } from '../../api/strapi';
import {
  financeProductTypeConstants,
  isSDISecondary,
} from '../../utils/financeProductTypes';
import { fetchAssetDetailsContent } from '../../api/details';
import { fetchDocuments, getAifAgreementsTemplates } from '../../api/document';
import { setAccessDetails } from './access';
import type { PaymentTypeVariant } from '../../utils/investment';
import { getPaymentType } from '../../api/payment';

type currentDisplayState = {
  loading: {
    active: boolean;
    past: boolean;
    upcoming: boolean;
  };
  active: any[];
  upcoming: any;
  portfolio: any;
  past: any[];
  assetsExpiryTime: {
    active: number;
    past: number;
  };
  assetProps: {
    loading: boolean;
    pageData: any;
    returnsData: any;
  };
  selectedAsset: any;
  assetLoading: boolean;
  toggle: boolean;
  oneTimeAgreements?: any[];
  ckycOpened: boolean;
  investedAmount: {
    realEstate: number;
    sdi: number;
    bonds: number;
    startupEquity: number;
  };
  showRBIModal: boolean;
  showFdModal: boolean;
  isPaymentDetailsLoading?: boolean;
  paymentMethodPG?: PaymentTypeVariant | '';
  allPaymentMethodPG?: any;
  selectedAssetDocuments?: [];
  ratingScaleData: any;
  isDetailsLoaded?: boolean;
  showDefaultAssetDetailPage?: boolean;
};

const initialState: currentDisplayState = {
  active: [],
  upcoming: [],
  past: [],
  portfolio: [],
  assetsExpiryTime: {
    active: null,
    past: null,
  },
  assetProps: {
    loading: true,
    pageData: null,
    returnsData: null,
  },
  loading: {
    active: true,
    past: true,
    upcoming: true,
  },
  selectedAsset: null,
  assetLoading: false,
  toggle: true,
  ckycOpened: false,
  investedAmount: {
    realEstate: 0,
    sdi: 0,
    bonds: 0,
    startupEquity: 0,
  },
  showRBIModal: false,
  showFdModal: false,
  isPaymentDetailsLoading: true,
  paymentMethodPG: '',
  allPaymentMethodPG: {},
  ratingScaleData: {},
  isDetailsLoaded: false,
  showDefaultAssetDetailPage: true,
};

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setList: (
      state,
      {
        payload,
      }: PayloadAction<['active' | 'upcoming' | 'past' | 'portfolio', any[]]>
    ) => {
      state[payload[0]] = payload[1];
      if (['active', 'past'].includes(payload[0])) {
        const now = new Date();
        state.assetsExpiryTime[payload[0]] = new Date(
          now.getTime() + 15 * 60000
        ).getTime();
      }
    },
    setLoading: (
      state,
      { payload }: PayloadAction<['active' | 'upcoming' | 'past', boolean]>
    ) => {
      state.loading = { ...state.loading, [payload[0]]: payload[1] };
    },
    setAssetProps: (state, { payload }: PayloadAction<any>) => {
      state.assetProps = payload;
    },
    setCkycOpenedStatus: (state, { payload }: PayloadAction<any>) => {
      state.ckycOpened = payload;
    },
    setSelected: (state, { payload }: PayloadAction<any>) => {
      const data = { ...payload };
      state.selectedAsset = data;
      state.loading.active = false;
      state.assetLoading = false;
    },
    resetSelectedDetails: (state) => {
      state.selectedAsset = {};
    },
    setSelectedDetails: (state, { payload }: PayloadAction<any>) => {
      const { detailsMap, detailsHeadings, partnerHeadings, highlightsMap } =
        payload;
      const documentsKey = 'Documents';
      const detailsHeadingsArr = [...detailsHeadings, documentsKey];

      state.selectedAsset = {
        ...state.selectedAsset,
        detailsMap,
        highlightsMap,
        detailsHeadings: detailsHeadingsArr,
        partnerHeadings,
        isDetailsLoaded: true,
      };
    },
    setSelectedSPVDocuments: (state, { payload }: PayloadAction<any>) => {
      state.selectedAsset = {
        ...state.selectedAsset,
        spvDocuments: payload.documents,
      };
    },
    setAssetLoading: (state, { payload }: PayloadAction<any>) => {
      state.assetLoading = payload;
    },
    setToggle: (state, { payload }: PayloadAction<boolean>) => {
      state.toggle = payload;
    },
    setAssetForms: (state, { payload }: PayloadAction<any>) => {
      state.selectedAsset = {
        ...state.selectedAsset,
        spvAgreements: payload.agreements,
      };
    },
    setOneTimeAgreements: (state, action: PayloadAction<any>) => {
      state.oneTimeAgreements = action.payload?.agreements;
    },
    setShowRBIModal: (state, action: PayloadAction<boolean>) => {
      state.showRBIModal = action.payload;
    },
    setShowFdModal: (state, action: PayloadAction<boolean>) => {
      state.showFdModal = action.payload;
    },
    setIsPaymentDetailsLoading: (state, action: PayloadAction<boolean>) => {
      state.isPaymentDetailsLoading = action.payload;
    },
    setPaymentMethodPG: (state, action: PayloadAction<PaymentTypeVariant>) => {
      state.paymentMethodPG = action.payload;
    },
    setPaymentDetailsPG: (state, action: PayloadAction<any>) => {
      state.allPaymentMethodPG = action.payload;
    },
    setAssetDocuments: (state, action: PayloadAction<any>) => {
      state.selectedAssetDocuments = action.payload;
    },
    setRatingData: (state, action: PayloadAction<any>) => {
      state.ratingScaleData = action.payload;
    },
    setShowDefaultAssetDetailPage: (state, action: PayloadAction<any>) => {
      state.showDefaultAssetDetailPage = action.payload;
    },
  },
});

export const {
  setList,
  setLoading,
  setAssetProps,
  setSelected,
  setSelectedDetails,
  setSelectedSPVDocuments,
  setAssetLoading,
  setToggle,
  resetSelectedDetails,
  setAssetForms,
  setOneTimeAgreements,
  setCkycOpenedStatus,
  setShowRBIModal,
  setShowFdModal,
  setIsPaymentDetailsLoading,
  setPaymentMethodPG,
  setPaymentDetailsPG,
  setAssetDocuments,
  setRatingData,
  setShowDefaultAssetDetailPage,
} = assetsSlice.actions;

export default assetsSlice.reducer;

export function fetchAndSetPaymentTypes(
  assetID: number | string,
  paymentAmount: number
): AppThunk {
  return async (dispatch) => {
    dispatch(setIsPaymentDetailsLoading(true));
    try {
      const data = await getPaymentType(assetID, paymentAmount);
      dispatch(setPaymentDetailsPG(data));
      dispatch(setIsPaymentDetailsLoading(false));
    } catch (error) {
      dispatch(setIsPaymentDetailsLoading(false));
    }
  };
}

export function fetchAndSetAssets(
  cb?: (assets: any) => void,
  type: 'active' | 'past' = 'active'
): AppThunk {
  return async (dispatch) => {
    dispatch(fetchAndSetFilteredAssets(type, undefined, cb));
  };
}

export function fetchAndSetFilteredAssets(
  status: 'active' | 'upcoming' | 'past',
  recordCount?: number,
  cb?: (assets: any) => void
): AppThunk {
  return async (dispatch, getState) => {
    const now = new Date().getTime();
    const expTime = getState().assets.assetsExpiryTime?.[status];
    const oldData = getState().assets[status] || [];
    const hasData = oldData?.length > 0;
    const isDataExpired = expTime && expTime < now;

    if (!hasData || isDataExpired) {
      dispatch(setLoading([status, true]));
    } else {
      cb?.([...oldData]);
      dispatch(setLoading([status, false]));
    }

    try {
      const payload: any = { visibility: 1, status };
      recordCount && (payload.recordCount = recordCount);

      const response = await fetchAssets(payload);
      const { list: assets } = response.msg;

      if (JSON.stringify(oldData) !== JSON.stringify(assets) || isDataExpired) {
        dispatch(setList([status, assets]));
        cb?.([...assets]);
      }
    } catch (e) {
      console.error('Error fetching assets:', e);
      if (e) {
        callErrorToast(processError(e));
      }
    } finally {
      dispatch(setLoading([status, false]));
    }
  };
}

export function fetchAndSetAsset(
  id: number | string,
  cb?: (data: any) => void,
  skipToggle?: boolean
): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setAssetLoading(true));
      dispatch(resetSelectedDetails());

      const response = await fetchAsset(id);
      const { data: asset } = response.msg;

      // here we are setting toggle value depending upon certain conditions
      if (!skipToggle) {
        /**
         * Toggle values: pre tax (false), post tax (true)
         *
         * SDI, CRE, SE, NCD are pre tax deals.
         *
         * If already invested in Leasing and Inventory
         * 1. pre tax: then set toggle to false
         * 2. post-tax: then set toggle to true
         */
        if (
          [
            financeProductTypeConstants.realEstate,
            financeProductTypeConstants.startupEquity,
            financeProductTypeConstants.ncd,
          ].includes(asset.financeProductType) ||
          (asset.lastOrderType && asset.lastOrderType === 'sp')
        ) {
          dispatch(setToggle(false));
          dispatch(
            setAccessDetails({
              preTaxToggle: false,
              selectedAsset: { ...asset },
            })
          );
        } else {
          dispatch(setToggle(true));
          dispatch(
            setAccessDetails({
              preTaxToggle: true,
              selectedAsset: { ...asset },
            })
          );
        }
      }

      asset.bonds = asset.bondsDetails;
      delete asset.bondsDetails;

      dispatch(
        setSelected({
          ...asset,
          spv: { ...asset.spv },
          detailsMap: {},
          detailsHeadings: [],
          partnerHeadings: [],
          documents: [],
          spvDocuments: [],
        })
      );

      // Do not check for SDI,Bonds,and FD
      if (
        ![
          financeProductTypeConstants.bonds,
          financeProductTypeConstants.highyieldfd,
          financeProductTypeConstants.sdi,
          financeProductTypeConstants.Baskets,
        ].includes(asset.financeProductType)
      ) {
        dispatch(fetchAndSetSPVDocuments(asset.spvID));
      }
      dispatch(setAssetLoading(false));
      cb && cb(asset);
    } catch (e) {
      console.log('error', e);
    }
  };
}

export function fetchAndSetDetails(assetID: any, cb?: () => void): AppThunk {
  return async (dispatch, getState) => {
    const finalPayload = await fetchAssetDetailsContent(assetID);
    const { assetDetails = [], partners: partnerDetails = [] } =
      finalPayload || {};
    const { highlightsContent, assetContent } = assetDetails?.reduce(
      (
        acc: { highlightsContent: any[]; assetContent: any[] },
        content: any
      ) => {
        ['highlights', 'imageHighlights'].includes(content?.page)
          ? acc.highlightsContent.push(content)
          : acc.assetContent.push(content);
        return acc;
      },
      { highlightsContent: [], assetContent: [] }
    );
    const highlightsData = highlightsContent?.sort(
      (detail1: any, detail2: any) => {
        return detail1.displayOrder - detail2.displayOrder;
      }
    );
    const highlightsMap = groupBy(highlightsData, 'page');

    const details = [...assetContent, ...partnerDetails].sort(
      (detail1: any, detail2: any) => {
        return detail1.displayOrder - detail2.displayOrder;
      }
    );
    let detailsMap = groupBy(details, 'page');
    let detailsHeadings = Object.keys(detailsMap);

    const getPartnerTitle = (dataArr: any[]) => {
      let partnerTitle = dataArr[0]?.page;
      return partnerTitle;
    };

    // CHECK FOR MORE THEN FOUR PARTNERS AND ASSET TYPE IS SDI SECONDARY
    const partnerGrpByModuleId = groupBy(partnerDetails, 'moduleID');

    // Partner Heading only for this function
    const asset = getState()?.assets?.selectedAsset || {};
    let partnerHeadings: string[] = [];
    if (Object.keys(partnerGrpByModuleId).length > 4 && isSDISecondary(asset)) {
      detailsHeadings = [];
      const assetDetailObj = groupBy(assetDetails, 'moduleName');
      assetDetailObj?.asset?.sort((detail1: any, detail2: any) => {
        return detail1.displayOrder - detail2.displayOrder;
      });

      // GET ASSET PARTNER TITLE
      const partner: any = {};
      const partnerArr: any = [];
      if (Object.keys(partnerGrpByModuleId).length > 0) {
        for (const key in partnerGrpByModuleId) {
          if (Object.prototype.hasOwnProperty.call(partnerGrpByModuleId, key)) {
            // FILTER THE PARTNER ARR IN WHICH TITLE NOT INCLUDING 'ABOUT'
            const title: string = getPartnerTitle(
              partnerGrpByModuleId[key]
            ).toLowerCase();

            if (title.includes('about')) {
              // filter content arr if title not contain about
              const contentArr: any[] = partnerGrpByModuleId[key].filter(
                (ele) => {
                  const titleInner: string = ele?.title?.toLowerCase();
                  return titleInner?.includes('about');
                }
              );

              // THIS LINE IS FOR TITLE PURPOSE
              partner[getPartnerTitle(partnerGrpByModuleId[key])] = contentArr;

              // PARTNER CONTENT ARR
              partnerArr.push({
                [getPartnerTitle(partnerGrpByModuleId[key])]: contentArr,
              });
            }
          }
        }
      }

      const assetDataObj = {
        ...(assetDetailObj?.asset?.length > 0 && {
          ['About Asset']: assetDetailObj.asset,
        }),
        ['About Partners']: partnerArr || [],
      };

      const titleObject = {
        ...(assetDetailObj?.asset?.length > 0 && {
          ['About Asset']: assetDetailObj.asset,
        }),
        ...partner,
      };

      for (const key in titleObject) {
        if (Object.prototype.hasOwnProperty.call(titleObject, key)) {
          if (detailsHeadings.indexOf(key) === -1) {
            detailsHeadings.push(key);
          }
        }
      }

      partnerHeadings = ['About Partners'];
      if (assetDetailObj?.asset?.length > 0) {
        partnerHeadings.unshift('About Asset');
      }
      detailsMap = assetDataObj;
    }

    dispatch(
      setSelectedDetails({
        detailsMap,
        detailsHeadings,
        partnerHeadings,
        highlightsMap,
      })
    );
    cb?.();
  };
}

export function fetchAndSetSPVDocuments(spvID: number | string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setSelectedSPVDocuments([]));
      const { list: spvDocuments } = await fetchDocuments('spv', spvID);

      const documents = spvDocuments.filter((document: any) => {
        return (
          document.docType && document.docType.toLowerCase() === 'agreement'
        );
      });

      dispatch(setSelectedSPVDocuments({ documents }));
    } catch (e) {}
  };
}

export function fetchAndSetAgreementPDF(
  spvID: number,
  cb?: (data: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      const res = await getAifAgreementsTemplates(spvID);
      dispatch(setAssetForms({ agreements: res.agreements }));
      cb && cb(res.agreements);
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function fetchAndSetOneTimeAgreements(spvType: number): AppThunk {
  return async (dispatch) => {
    const files = await getOneTimeAgreements(spvType);
    dispatch(setOneTimeAgreements(files));
  };
}

export function fetchAndSetPastAsset(
  assetID: number,
  successCb: (data: any) => void,
  failedCb: (error: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      const pastAssetDetails = await fetchPastAsset(assetID);

      let assetData = {
        ...pastAssetDetails,
        bonds: pastAssetDetails?.bondsDetails,
      };

      dispatch(setSelected(assetData));
      successCb(assetData);
    } catch (err) {
      failedCb(err);
    }
  };
}
