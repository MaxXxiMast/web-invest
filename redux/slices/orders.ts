import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppThunk, handleApiError } from '../index';
import {
  completeOrder as completeOrderApi,
  retryPayment as retryPaymentApi,
  getDocumentInfo,
  verifyOrderEsignDocs,
  getResignDoc,
  verifyOrderResignDocs,
  getMCADocumentInfo,
  getLLpDocumentsByOrderID,
  verifyMcaDocs,
  fetchOrderData,
  createRFQOrderWithExchange,
  createNonRFQOrder,
  completeOrderCashfree,
  completeOrderFD,
} from '../../api/order';
import { processError } from '../../api/strapi';
import { getUTMParamsIfExist } from '../../utils/utm';
import { moveInvestmentDocuments } from '../../api/user';
import {
  financeProductTypeConstants,
  isAssetCommercialProduct,
  isSDISecondary,
} from '../../utils/financeProductTypes';
import {
  CreateNonRFQOrderBody,
  PaymentProcessingBody,
  RFQPendingOrder,
} from '../types/rfq';
import { handleAssetCalculation } from '../../api/assets';

type currentDisplayState = {
  loading: boolean;
  list: any;
  selectedOrder: any;
  esignLoading?: boolean;
  llpDocuments: any;
  mcaEsignLoading?: boolean;
  rfqPendingOrder?: Partial<RFQPendingOrder>;
};

const initialState: currentDisplayState = {
  list: [],
  loading: true,
  selectedOrder: {},
  llpDocuments: [],
  mcaEsignLoading: false,
  rfqPendingOrder: {},
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setList: (state, { payload }: PayloadAction<any>) => {
      state.list = payload;
      state.loading = false;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setSelected: (state, { payload }: PayloadAction<any>) => {
      state.selectedOrder = payload;
      state.loading = false;
    },
    setEsignLoading: (state, { payload }: PayloadAction<any>) => {
      state.esignLoading = payload;
    },
    setLLpDocuments: (state, { payload }: PayloadAction<any>) => {
      state.llpDocuments = payload;
    },
    setMcaEsignLoading: (state, { payload }: PayloadAction<any>) => {
      state.mcaEsignLoading = payload;
    },
    setRFQPendingOrder: (state, { payload }: PayloadAction<any>) => {
      state.rfqPendingOrder = payload;
    },
  },
});

export const {
  setList,
  setLoading,
  setSelected,
  setEsignLoading,
  setLLpDocuments,
  setMcaEsignLoading,
  setRFQPendingOrder,
} = ordersSlice.actions;

export default ordersSlice.reducer;

export function createOrder(
  assetID: string | number,
  amount: number,
  walletAmount: number,
  preTax: boolean,
  cb: (data: any) => void,
  source?: string,
  units?: number,
  unitPrice?: number,
  extraParams?: any,
  onErrorCb?: () => void
): AppThunk {
  return async (dispatch) => {
    try {
      let order;
      const params = {
        assetID: Number(assetID),
        amount,
        walletAmount,
        preTax,
        utmParams: getUTMParamsIfExist(),
        source,
        units,
        unitPrice,
        ...extraParams,
      };

      order = await createNonRFQOrder(params);
      cb && cb(order);
    } catch (e) {
      onErrorCb && onErrorCb();
      handleApiError(e, dispatch);
    }
  };
}

const modifyNonPGOrderRes = (data, spvCategoryBank) => {
  const {
    status,
    preTaxReturns: preTaxAmount,
    orderTransferInitiationDate: orderConfirmationDueDate,
    orderSecuritiesTransferDate: securitiesTransferDate,
    ...rest
  } = data || {};

  const modifyData = {
    ...rest,
    preTaxAmount,
    orderConfirmationDueDate,
    securitiesTransferDate,
    isDealCompleted: false,
    createPendingOrder: status === 0,
    isOrderSuccessful: Number([0, 1, 7, 8].includes(status)),
    isSdiSecondaryOrder: isSDISecondary(rest),
    useCommercialNEFT: isAssetCommercialProduct(rest),
    spvName: spvCategoryBank?.accountName,
    spvAccountNo: spvCategoryBank?.accountNo,
    spvIfscCode: spvCategoryBank?.ifscCode,
  };

  return modifyData;
};

export function completeWalletOrder(params): AppThunk {
  const {
    assetID,
    amount,
    walletAmount,
    preTax,
    source,
    units,
    unitPrice,
    spvCategoryBank,
    cb,
  } = params || {};
  return async (dispatch) => {
    try {
      const data: CreateNonRFQOrderBody = {
        assetID,
        amount,
        walletAmount,
        preTax,
        source,
        units,
        unitPrice,
        utmParams: getUTMParamsIfExist(),
      };
      const order = await createNonRFQOrder(data);
      const modifyData = modifyNonPGOrderRes(order, spvCategoryBank);
      dispatch(setSelected(modifyData));
      cb && cb(modifyData);
      if (
        [
          financeProductTypeConstants.inventory,
          financeProductTypeConstants.leasing,
        ].includes(modifyData?.financeProductType)
      ) {
        await moveInvestmentDocuments(modifyData);
      }
    } catch (err) {
      handleApiError(err, dispatch);
    }
  };
}

export function completeOrder(
  data: string,
  order_id: string,
  cb: (data: any) => void
): AppThunk {
  return async (dispatch) => {
    const dataToSend = data
      ? {
          pgData: data,
        }
      : {
          orderID: order_id,
        };
    let order = await completeOrderApi(dataToSend);
    const assetCalculation = await handleAssetCalculation(
      order?.msg?.data?.assetID,
      order?.msg?.data?.units || order?.msg?.data?.amount
    );
    const { assetCalcDetails } = assetCalculation;

    if (order?.msg?.data.preTaxAmount) {
      order.msg.data.preTaxAmount =
        assetCalcDetails?.preTaxReturns ||
        assetCalcDetails?.preTaxTotalReturns ||
        assetCalcDetails?.totalPreTaxAmount;
    }
    dispatch(setSelected(order.msg.data));
    cb && cb(order.msg.data);
    if (
      [
        financeProductTypeConstants.inventory,
        financeProductTypeConstants.leasing,
      ].includes(order?.msg?.data?.financeProductType)
    ) {
      await moveInvestmentDocuments(order.msg.data);
    }
  };
}

export function retryPayment(
  transactionID: string,
  cb: (data: any) => void,
  failedCb?: (data: any) => void
): AppThunk {
  return async () => {
    try {
      const order = await retryPaymentApi(transactionID);
      cb && cb(order?.msg);
    } catch (e) {
      failedCb && failedCb(e);
    }
  };
}

export function getDocumentDetails(
  assetID: number | string,
  cb?: (data: any, name?: string, type?: any, orderId?: string) => void,
  failedCb?: (data: any) => void,
  assetName?: string,
  orderID?: string
): AppThunk {
  return async (dispatch) => {
    try {
      const res = await getDocumentInfo(assetID);
      cb && cb({ ...res, assetID, orderID }, assetName, null);
    } catch (err) {
      const e = err as any;
      const activeSessionCb = () => {
        if (e?.response?.data && e?.response?.data?.msg) {
          failedCb && failedCb(e.response.data.msg);
        } else {
          failedCb && failedCb('Something went wrong!');
        }
      };
      handleApiError(e, dispatch, activeSessionCb);
    }
    dispatch(setEsignLoading(false));
  };
}

export function getMCADocumentDetails(
  orderID: string,
  cb?: (data: any, name?: string) => void,
  failedCb?: (data: any) => void,
  assetName?: string,
  orderId?: string
): AppThunk {
  return async (dispatch) => {
    try {
      const data = await getMCADocumentInfo(orderID);
      data.orderID = orderId;
      cb && cb(data, assetName);
    } catch (err) {
      const e = err as any;
      const activeSessionCb = () => {
        if (e?.response?.data && e?.response?.data?.msg) {
          failedCb && failedCb(e.response.data.msg);
        } else {
          failedCb && failedCb('Something went wrong!');
        }
      };
      handleApiError(e, dispatch, activeSessionCb);
    }
    dispatch(setEsignLoading(false));
  };
}

export function getPartnerResignation(
  orderID: string,
  assetName: string,
  cb?: (data: any, name?: string, type?: string) => void,
  failedCb?: (data: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      const data = await getResignDoc(orderID);
      cb && cb({ ...data.data, type: 'resignation' }, assetName, 'resignation');
    } catch (error) {
      console.log(error);
      failedCb && failedCb(processError(error));
    }
    dispatch(setEsignLoading(false));
  };
}

export function verifyOrderEsignDocuments(
  data: any,
  cb?: () => void
): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setEsignLoading(true));
      await verifyOrderEsignDocs(data);
      dispatch(setEsignLoading(false));
      cb && cb();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function verifyOrderResignationDocuments(
  data: any,
  cb?: () => {}
): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setEsignLoading(true));
      await verifyOrderResignDocs(data);
      dispatch(setEsignLoading(false));
      cb && cb();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function toggleEsignLoading(loading: boolean): AppThunk {
  return async (dispatch) => {
    dispatch(setEsignLoading(loading));
  };
}

export function getLLpDocuments(orderID: string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setLLpDocuments([]));
      const data = await getLLpDocumentsByOrderID(orderID);
      dispatch(setLLpDocuments(data));
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function verifyOrderMcaDocuments(data: any, cb?: () => {}): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setMcaEsignLoading(true));
      await verifyMcaDocs(data);
      cb && cb();
      dispatch(setMcaEsignLoading(false));
      window.location.reload();
    } catch (e) {
      handleApiError(e, dispatch);
    } finally {
      dispatch(setMcaEsignLoading(false));
    }
  };
}

export function fetchOrderStatus(
  orderID: string,
  cb?: (data: any) => {}
): AppThunk {
  return async (dispatch) => {
    try {
      const response = await fetchOrderData(orderID);

      const order = response?.msg?.data;
      const orderData = { ...order };
      orderData.isOrderSuccessful = ![
        'cancelled',
        'failed',
        'onhold',
        'refunded',
        'user_dropped',
      ].includes(orderData.status);
      dispatch(setSelected(orderData));
      cb && cb(orderData);
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function placeOrderWithExchange(
  body: PaymentProcessingBody,
  successCb: (data: any) => void,
  errorCb: () => void
): AppThunk {
  return async (dispatch) => {
    try {
      const response = await createRFQOrderWithExchange(body);
      successCb(response);
    } catch (e) {
      errorCb();
      handleApiError(e, dispatch);
    }
  };
}

export function completeOrderForCashfree(
  orderID: string,
  paymentData: Record<string, unknown>,
  cb: () => void
): AppThunk {
  return async (dispatch) => {
    try {
      await completeOrderCashfree(orderID);
      dispatch(
        setSelected({
          orderID,
          ...paymentData,
        })
      );
    } catch (e) {
      console.log('error occured in checking status', e);
    } finally {
      cb();
    }
  };
}

export function completeOrderForFD(
  orderID: string,
  fixerraOrderID: string,
  params?: any,
  cb?: () => void
): AppThunk {
  return async (dispatch) => {
    try {
      await completeOrderFD(orderID, params);
      dispatch(
        setSelected({
          orderID,
          fixerraOrderID,
        })
      );
    } catch (e) {
      console.log('error occured in checking status', e);
    } finally {
      cb();
    }
  };
}
