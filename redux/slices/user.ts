import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';
import Cookies from 'js-cookie';

import { AppState, AppThunk, handleApiError } from '../index';

import { fetchDocuments, uploadUserDocument } from '../../api/document';
import { socialLoginApi, verifyOtp } from '../../api/login';
import {
  callErrorToast,
  callSuccessToast,
  processError,
} from '../../api/strapi';

import { getSignedUrl } from '../../api/details';

import {
  createAifAgreements,
  fetchUser,
  fetchUserPreferences,
  getAifAgreements,
  getBankDetails,
  getUserKYCConsent,
  getUserNotifications,
  getUserPortfolio,
  initateAgreementEsign,
  updateUserApi,
  updateUserPreferences,
  verifyAgreementEsign,
  verifyAifAgreement,
  addKyc,
  getUserPortfolioSummary,
  verifyAIFOrderEsign,
  generateDownloadStatementRequest,
  addDepositoryAPI,
  deleteCMRDoc,
  getUserUccStatus,
} from '../../api/user';

import {
  createOrUpdateUserKYCConsent,
  startBankKYC,
  verifyIFSCCode,
} from '../../api/userKyc';
import {
  createFixerraOrderInitiate,
  createFixerraUser,
  fetchScheduleOfPayment,
  OrderInitateBody,
} from '../../api/assets';
import MoengageWebServices from '../../utils/ThirdParty/moengage/moengage';
import { updateCkycStatus } from '../../api/ckyc';
import { setAccessDetails } from './access';
import { upcommingReturnFilter } from '../../utils/portfolio';
import { handleKycStatus } from '../../api/rfqKyc';
import { isEmpty } from '../../utils/object';
import { setOpenFDStepperLoader } from './fd';
import { isPanVerifiedTimeCheck } from '../../components/TwoFactorAuthSingupModal/utils';
import { successOTPRudderStackEvent } from '../../utils/login';
import { trackEvent } from '../../utils/gtm';
import { getUserInvestmentData } from '../../api/portfolio';
import { getRFQMarketTiming } from './config';
import { redirectHandler } from '../../utils/windowHelper';
import { financeProductTypeConstants } from '../../utils/financeProductTypes';

export type userData = {
  userID: number;
  emailID: string;
  mobileNo: string;
  firstName: string;
  lastName: string;
  documents:
    | {
        docType: string;
        docSubType: string;
      }[];
  dematNo: string;
  kycPanStatus: string | number;
  kycAadhaarStatus: string | number;
  kycBankStatus: string | number;
  nomineeName: string;
  cheque: {
    status: string | number;
    subStatus: string | number;
  };
  residentialStatus: string;
  nomineeDob: Date;
  photo: string;
  nomineeEmail: string;
  placeOfBirth: string;
  countryOfBirth: string;
  kycDone: number;
  partnerType: string;
  userCKyc: {
    ckycStatus: string;
    // and other fields
  };
  aadhaar_back: string;
  aadhaar_front: string;
  nomineeAddress: string;
  userVan: string;
  userInvestedAssets: {
    LFDeals: boolean;
    IFDeals: boolean;
  };
  userType: string;
  createdAt: string;
  ckycDisabled: boolean;
  walletAmount: number;
  bill: any;
  driving_licence: any;
  other: any;
  ckycType: string;
  occupation: string;
  nationality: string;
  din: string;
  tin: string;
  politicallyExposedPerson: string;
  mobileCode: number;
  totalOrdersDuringDiwaliJackpot: number;
  investmentData?: any;
};

type PortfolioOverviewDetails = Partial<{
  id: number;
  xirr: number;
  financeProductTypeOrCombined: string;
  totalInvestmentAmount: number;
  totalReturnsReceived: number;
  totalExpectedReturns: number;
}>;

type currentDisplayState = {
  userType?: string | null;
  userData?: userData;
  kycDetails?: any;
  portfolio: any;
  portfolioLoading: boolean;
  repaymentLoading: boolean;
  notifications?: any;
  notificationsLoading?: boolean;
  experianData?: any;
  preferences?: any;
  isDevAuthorized?: boolean;
  pendingResignations?: any;
  pendingMcaEsign?: any;
  aifDocuments?: any[];
  kycConsent?: any;
  hasAssetTaxSlabConsent: boolean;
  depositoryDetails?: any;
  showAssetKycPopup?: boolean;
  kycConfigStatus?: any;
  uccStatus?: any;
  faceMatchRetryAttempt: number;
  showTwoFAModal: boolean;
  isDOBVerifiedTwoFAModal: boolean;
  showLogginOutModal: boolean;
  isTimeLessThanThirtyMins: boolean;
  openPasswordPopup: boolean;
  portfolioDiscoverData?: PortfolioOverviewDetails;
  isUserFetching?: boolean;
};

const userDataInit: userData = {
  userID: 0,
  emailID: '',
  mobileNo: '',
  firstName: '',
  lastName: '',
  documents: [],
  dematNo: '',
  kycPanStatus: '',
  kycAadhaarStatus: '',
  kycBankStatus: '',
  nomineeName: '',
  cheque: {
    status: '',
    subStatus: '',
  },
  residentialStatus: '',
  nomineeDob: null,
  photo: '',
  nomineeEmail: '',
  placeOfBirth: '',
  countryOfBirth: '',
  kycDone: 0,
  partnerType: '',
  userCKyc: {
    ckycStatus: '',
  },
  aadhaar_back: '',
  aadhaar_front: '',
  nomineeAddress: '',
  userVan: '',
  userInvestedAssets: {
    LFDeals: false,
    IFDeals: false,
  },
  userType: '',
  createdAt: '',
  ckycDisabled: false,
  walletAmount: 0,
  bill: null,
  driving_licence: null,
  other: null,
  ckycType: '',
  occupation: '',
  nationality: '',
  din: '',
  tin: '',
  politicallyExposedPerson: '',
  mobileCode: 0,
  totalOrdersDuringDiwaliJackpot: 0,
  investmentData: {},
};

const portfolioInitState = {
  id: 0,
  xirr: 0,
  financeProductTypeOrCombined: '',
  totalInvestmentAmount: 0,
  totalReturnsReceived: 0,
  totalExpectedReturns: 0,
};

const initialState: currentDisplayState = {
  kycDetails: {
    loadingBank: true,
    aadhaar: {},
    pan: {},
    bank: {},
    ocrResponse: {},
    ckycLoading: false,
    bankWrongAttempts: 0,
    depository: {},
    depositoryData: {}, // for profile depository
  },
  portfolio: {},
  portfolioLoading: true,
  repaymentLoading: false,
  hasAssetTaxSlabConsent: false,
  notifications: [],
  preferences: {},
  isDevAuthorized: false,
  pendingResignations: [],
  aifDocuments: [],
  kycConsent: [],
  depositoryDetails: {
    brokerName: '',
    dpName: '',
    isUpdate: false,
  },
  showAssetKycPopup: false,
  kycConfigStatus: {},
  uccStatus: {},
  faceMatchRetryAttempt: 1,
  showTwoFAModal: false,
  isDOBVerifiedTwoFAModal: false,
  showLogginOutModal: false,
  isTimeLessThanThirtyMins: true,
  openPasswordPopup: false,
  userData: userDataInit,
  portfolioDiscoverData: portfolioInitState,
  isUserFetching: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.userType = action.payload?.userType;
      state.userData = action.payload?.userData;
      state.kycDetails = state.kycDetails || initialState.kycDetails;
      state.portfolio = state.portfolio || initialState.portfolio;
      state.portfolioLoading =
        state.portfolioLoading || initialState.portfolioLoading;
    },
    setUserChequeOcrResponse: (state, action: PayloadAction<any>) => {
      state.kycDetails.ocrResponse = { ...action.payload };
    },
    deleteUserChequeOcrResponse: (state, action: PayloadAction<any>) => {
      state.kycDetails.ocrResponse = initialState.kycDetails.ocrResponse;
    },
    setUserData: (state, action: PayloadAction<any>) => {
      state.userData = { ...(state.userData || {}), ...(action.payload || {}) };
      state.kycDetails = state.kycDetails || initialState.kycDetails;
      state.portfolio = state.portfolio || initialState.portfolio;
      state.portfolioLoading =
        state.portfolioLoading || initialState.portfolioLoading;
      state.userData.cheque = isEmpty(action.payload.cheque)
        ? state.userData?.cheque
        : action.payload.cheque || null;
    },
    resetUserData: (state, action: PayloadAction<any>) => {
      state.userData = { ...(action.payload || {}) };
    },
    setKycDetails: (state, action: PayloadAction<any>) => {
      state.kycDetails = { ...state.kycDetails, ...action.payload };
    },
    setPortfolio: (state, action: PayloadAction<any>) => {
      const now = new Date();
      state.portfolio = {
        ...state.portfolio,
        ...action.payload,
        expTime: new Date(now.getTime() + 15 * 60000).getTime(),
      };
    },
    setCkycLoading: (state, action: PayloadAction<any>) => {
      state.kycDetails.ckycLoading = action.payload;
    },
    setPortfolioLoading: (state, action: PayloadAction<any>) => {
      state.portfolioLoading = action.payload;
    },
    setRepaymentSchedule: (state, action: PayloadAction<any>) => {
      const { portfolio } = state;
      const updateIndex = portfolio?.list?.findIndex(
        (portfolioData: any) =>
          portfolioData?.txns?.[0]?.orderID === action?.payload?.orderID
      );
      portfolio.list[updateIndex]['repaymentSchedule'] =
        action?.payload?.repaymentSchedule;
      state.portfolio = portfolio;
    },
    setRepaymentLoading: (state, { payload }: PayloadAction<any>) => {
      state.repaymentLoading = payload;
    },
    setNotifications: (state, action: PayloadAction<any>) => {
      state.notifications = action.payload;
    },
    setNotificationLoading: (state, action: PayloadAction<any>) => {
      state.notificationsLoading = action.payload;
    },
    setPreferences: (state, action: PayloadAction<any>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setDevAuthorized: (state, action: PayloadAction<any>) => {
      state.isDevAuthorized = action.payload;
    },
    setPendingResignations: (state, action: PayloadAction<any>) => {
      state.pendingResignations = action.payload;
    },
    setPendingMca: (state, action: PayloadAction<any>) => {
      state.pendingMcaEsign = action.payload;
    },
    setAifDocuments: (state, action: PayloadAction<any>) => {
      state.aifDocuments = action.payload;
    },
    setUserKYCConsent: (state, action: PayloadAction<any>) => {
      state.kycConsent = action.payload;
    },
    setBankWrongAttempts: (state, action: PayloadAction<any>) => {
      state.kycDetails = {
        ...state.kycDetails,
        bankWrongAttempts: action.payload,
      };
    },
    setDepositoryDetails: (state, action: PayloadAction<any>) => {
      state.depositoryDetails = {
        ...state.depositoryDetails,
        ...action.payload,
      };
    },
    resetDepositoryDetails: (state) => {
      state.kycDetails.depository = {};
    },
    resetBankDetails: (state) => {
      state.kycDetails.bank = {};
    },
    resetPANDetails: (state) => {
      state.kycDetails.pan = {};
    },
    showKycPopup: (state, action: PayloadAction<any>) => {
      state.showAssetKycPopup = action.payload;
    },
    setKycStatus: (state, action: PayloadAction<any>) => {
      state.kycConfigStatus = action.payload;
    },
    setUccStatus: (state, action: PayloadAction<any>) => {
      state.uccStatus = action.payload;
    },
    setUpdateFaceMatchAttempt: (state, action: PayloadAction<number>) => {
      state.faceMatchRetryAttempt = action.payload;
    },
    setShowTwoFAModal: (state, action: PayloadAction<boolean>) => {
      state.showTwoFAModal = action.payload;
    },
    setIsDOBVerifiedTwoFAModal: (state, action: PayloadAction<boolean>) => {
      state.isDOBVerifiedTwoFAModal = action.payload;
    },

    setLoggingOutDetail: (state, action: PayloadAction<boolean>) => {
      state.showLogginOutModal = action.payload;
    },
    setIsTimeLessThanThirtyMins: (state, action: PayloadAction<boolean>) => {
      state.isTimeLessThanThirtyMins = action.payload;
    },
    setOpenPasswordPopup: (state, action: PayloadAction<boolean>) => {
      state.openPasswordPopup = action.payload;
    },
    setDiscoverPortfolio: (
      state,
      action: PayloadAction<PortfolioOverviewDetails>
    ) => {
      state.portfolioDiscoverData = action.payload;
    },
    setIsUserFetching: (state, action: PayloadAction<boolean>) => {
      state.isUserFetching = action.payload;
    },
    setInvestmentData: (state, action: PayloadAction<any>) => {
      state.userData.investmentData = action.payload;
    },
    setCkycDetails: (state, action: PayloadAction<any>) => {
      state.userData.userCKyc = action.payload;
    },
    setAppState: (state, action: PayloadAction<any>) => {
      state.userData.ckycDisabled = action.payload?.ckycDisabled;
    },
  },
});

export const {
  setUser,
  setUserData,
  resetUserData,
  setKycDetails,
  setPortfolio,
  setPortfolioLoading,
  setRepaymentLoading,
  setRepaymentSchedule,
  setNotifications,
  setNotificationLoading,
  setPreferences,
  setDevAuthorized,
  setPendingResignations,
  setPendingMca,
  setAifDocuments,
  setUserKYCConsent,
  setUserChequeOcrResponse,
  deleteUserChequeOcrResponse,
  setCkycLoading,
  setBankWrongAttempts,
  setDepositoryDetails,
  resetDepositoryDetails,
  resetBankDetails,
  resetPANDetails,
  showKycPopup,
  setKycStatus,
  setUccStatus,
  setUpdateFaceMatchAttempt,
  setShowTwoFAModal,
  setIsDOBVerifiedTwoFAModal,
  setLoggingOutDetail,
  setIsTimeLessThanThirtyMins,
  setOpenPasswordPopup,
  setDiscoverPortfolio,
  setIsUserFetching,
  setInvestmentData,
  setCkycDetails,
  setAppState,
} = userSlice.actions;

export default userSlice.reducer;

export const getUserData: any = (state: AppState) => JSON.stringify(state.user);

export function authenticate(
  loginID: string,
  otpCode: string,
  mobileCode: string,
  utmParams: any,
  cb?: (_response: any) => void,
  errorCb?: (_response: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      Cookies.remove('storedTime2FA');

      // Login Payload
      const dataToSend = {
        loginID,
        otpCode,
        mobileCode,
        ...utmParams,
      };
      // Get GC Partner Code from cookies with gcPartnerCode key
      const partnerCode = Cookies.get('gcPartnerCode') || '';
      // IF gcPartnerCode is avaiable then send along with login api
      if (partnerCode) {
        dataToSend['partnerCode'] = partnerCode;
      }
      const response: any = await verifyOtp(dataToSend);
      dispatch(setUser(response.msg));

      const userId = response?.msg?.userData?.userID;
      const is2faRequired = response?.msg?.userData?.is2faRequired;
      dispatch(
        setAccessDetails({
          accessToken: response?.msg?.accessToken,
          is2faRequired: is2faRequired,
          userID: userId,
          firstName: response?.msg?.userData?.firstName,
          lastName: response?.msg?.userData?.lastName,
        })
      );
      const user = await fetchUser();
      dispatch(
        setAccessDetails({
          firstName: user?.firstName,
          lastName: user?.lastName,
          is2faRequired: is2faRequired,
          emailID: user?.emailID,
          mobileNo: user?.mobileNo,
        })
      );
      MoengageWebServices.trackUserLogin(userId);

      const userData = {
        ...user,
        is2faRequired: is2faRequired,
      };
      const data = { ...response.msg, userData: userData };
      dispatch(setUser(data));
      dispatch(getRFQMarketTiming());
      if (
        data?.userData?.emailID &&
        data?.userData?.mobileNo &&
        is2faRequired
      ) {
        handleKycStatus()
          .then((data) => {
            const givenTimestamp = data?.kycTypes[0]?.fields?.flag;
            const isPanVerified = data?.kycTypes[0]?.fields?.status === 1;

            if (isPanVerifiedTimeCheck(givenTimestamp) && isPanVerified) {
              dispatch(setShowTwoFAModal(true));
            } else {
              redirectHandler({
                pageUrl: window.location.origin + '/discover',
                pageName: 'Authenticate KYC Status',
              });
            }
            successOTPRudderStackEvent({
              emailID: userData?.emailID,
              mobileNo: userData?.mobileNo,
              mobileCode: userData?.mobileCode,
            });
          })
          .catch((err) => {
            callErrorToast(err);
          });
      } else {
        cb && cb(data);
      }
    } catch (err) {
      console.log(err, 'err');
      trackEvent('login_signup_error', { err: err });
      errorCb && errorCb(err);
    }
  };
}

export function authenticateSocialLoginRequest(
  code: string,
  provider: string,
  utmParams: any,
  cb?: (_response: any) => void,
  errorCb?: (_response: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      Cookies.remove('storedTime2FA');
      // Social Login Payload
      const dataToSend = {
        code,
        provider,
        ...utmParams,
      };
      // Get GC Partner Code from cookies with gcPartnerCode key
      const partnerCode = Cookies.get('gcPartnerCode') || '';
      // IF gcPartnerCode is avaiable then send along with login api
      if (partnerCode) {
        dataToSend['partnerCode'] = partnerCode;
      }

      const response: any = await socialLoginApi(dataToSend);
      dispatch(setUser(response?.msg));
      const userId = response?.msg?.userData?.userID;
      const is2faRequired = response?.msg?.userData?.is2faRequired;

      const emailID = response?.msg?.userData?.emailID;
      const mobileNo = response?.msg?.userData?.mobileNo;
      const type = emailID && mobileNo ? 'login' : 'signup';

      trackEvent('login_signup_with_social', {
        type: type,
        emailID: emailID,
        social: 'google',
      });
      dispatch(
        setAccessDetails({
          accessToken: response?.msg?.accessToken,
          is2faRequired: response?.msg?.userData?.is2faRequired,
          userID: userId,
          firstName: response?.msg?.userData?.firstName,
          lastName: response?.msg?.userData?.lastName,
        })
      );
      const user = await fetchUser();
      dispatch(
        setAccessDetails({
          firstName: user?.firstName,
          lastName: user?.lastName,
          is2faRequired: response?.msg?.userData?.is2faRequired,
          emailID: user?.emailID,
          mobileNo: user?.mobileNo,
        })
      );
      MoengageWebServices.trackUserLogin(userId);

      const data = { ...response.msg, userData: user };
      dispatch(setUser(data));
      dispatch(getRFQMarketTiming());
      if (
        data?.userData?.emailID &&
        data?.userData?.mobileNo &&
        is2faRequired
      ) {
        handleKycStatus()
          .then((data) => {
            const givenTimestamp = data?.kycTypes[0]?.fields?.flag;
            const isPanVerified = data?.kycTypes[0]?.fields?.status === 1;
            if (isPanVerifiedTimeCheck(givenTimestamp) && isPanVerified) {
              dispatch(setShowTwoFAModal(true));
            } else {
              redirectHandler({
                pageUrl: window.location.origin + '/discover',
                pageName: 'KYC Status SocialLogin Request',
              });
            }
            successOTPRudderStackEvent({
              emailID: user?.emailID,
              mobileNo: user?.mobileNo,
              mobileCode: user?.mobileCode,
            });
          })
          .catch((err) => {
            callErrorToast(err);
          });
      } else {
        cb && cb(data);
      }
    } catch (err) {
      console.log(err, 'err');
      errorCb && errorCb(err);
    }
  };
}

export function updateUser(
  data: any,
  cb?: (updatedUser?: any) => void,
  newUser?: boolean,
  errorCb?: (error: string) => void
): AppThunk {
  return async (dispatch, getState) => {
    const userID = getState().access.userID;
    if (userID) {
      try {
        await updateUserApi(userID, data, newUser);
        const user = await fetchUser();
        dispatch(
          setAccessDetails({
            firstName: user?.firstName,
            lastName: user?.lastName,
            emailID: user?.emailID,
            mobileNo: user?.mobileNo,
          })
        );
        dispatch(setUserData(user));
        cb && cb(user);
      } catch (e) {
        errorCb && errorCb(processError(e));
      }
    }
  };
}

export function fetchUserInfo(
  userID: string | number,
  cb?: (data: any) => void,
  notificationCall = true
): AppThunk {
  return async (dispatch, getState) => {
    dispatch(setIsUserFetching(true));
    try {
      if (Number(userID)) {
        const accessData = getState().access;
        const user = await fetchUser();
        dispatch(
          setAccessDetails({
            ...accessData,
            firstName: user?.firstName,
            lastName: user?.lastName,
            emailID: user?.emailID,
            mobileNo: user?.mobileNo,
          })
        );

        try {
          const params = {
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.emailID,
            mobileCode: `${user?.mobileCode}`,
            mobileNo: user?.mobileNo,
          };
          window['rudderanalytics']?.identify(String(userID), params);
          MoengageWebServices.transformUserIdentityEvent(params);
        } catch (e) {
          console.log(e, 'error');
        }

        if (notificationCall) {
          fetchNotifications(dispatch, userID);
        }
        cb && cb(user);
        dispatch(setUserData({ ...user }));
      }
    } catch (e: any) {
      if (Array.isArray(e) && !e?.includes('JWT')) {
        callErrorToast(processError(e));
      }
    } finally {
      dispatch(setIsUserFetching(false));
    }
  };
}

export function getKYCConsent(): AppThunk {
  return async (dispatch) => {
    const { result } = await getUserKYCConsent();
    dispatch(setUserKYCConsent(result));
  };
}

export function updateUserKYCConsent(data: any): AppThunk {
  return async (dispatch, getState) => {
    const kycConsent = getState().user.kycConsent;
    const { result: updatedConsent } = await createOrUpdateUserKYCConsent(data);
    dispatch(setUserKYCConsent([...kycConsent, updatedConsent]));
  };
}

/**
 * Fetch Bank Account Details for loggedin user
 */
export function getBankInfo(cb?: () => any, shouldFetchUser = true): AppThunk {
  return async (dispatch, getState) => {
    dispatch(setKycDetails({ loadingBank: true }));
    const userID = getState().access.userID;

    const details = await getBankDetails(userID);
    const kycDetails: any = {
      bank: details?.list?.length ? details.list[0] : {},
      loadingBank: false,
    };
    dispatch(setKycDetails(kycDetails));
    if (shouldFetchUser) {
      const user = await fetchUser();
      dispatch(setUserData({ ...user }));
    }
    cb?.();
  };
}

const attachOrderDocumentsToPorfolioList = (
  portfolioList: any,
  orderDocuments: any
) => {
  const mutableList = portfolioList.map((obj: any) => ({ ...obj }));
  mutableList.map((p: any) => (p.docs = []));
  orderDocuments?.msg?.list?.map((orderDoc: any) => {
    const indexOfAssetID = mutableList.findIndex(
      (e: any) => e.txns[0].orderID === orderDoc.moduleID
    );
    if (indexOfAssetID < 0) {
      return;
    }
    if (mutableList[indexOfAssetID]?.docs) {
      mutableList[indexOfAssetID].docs.push(orderDoc);
    } else {
      mutableList[indexOfAssetID].docs = [orderDoc];
    }
    return null;
  });
  return mutableList;
};

export function seeMorePorfolio(type: string, offset: number): AppThunk {
  return async (dispatch, getState) => {
    try {
      const res = await getUserPortfolio(type, 4, offset);
      const orderDocuments = getState().user.portfolio?.orderDocuments || {};
      const list = getState().user.portfolio.list || [];
      let newList = [...list, ...res.data];
      newList = attachOrderDocumentsToPorfolioList(newList, orderDocuments);
      const newPortfolio = {
        ...getState().user.portfolio,
        list: newList,
      };
      dispatch(setPortfolio(newPortfolio));
    } catch (e) {
      console.log(e);
      const activeSessionCb = () => {
        const data = {
          activeInvestment: 0,
          list: [],
          returnsTillDate: 0,
          totalActiveInvestment: 0,
          totalExpectedReturns: 0,
        };
        dispatch(setPortfolioLoading(false));
        dispatch(setPortfolio(data));
      };
      handleApiError(e, dispatch, activeSessionCb);
    }
  };
}

export function loadPortfolioPage(
  type: string,
  offset: number,
  cb?: () => void
): AppThunk {
  return async (dispatch, getState) => {
    try {
      const res = await getUserPortfolio(type, 4, offset);
      const orderDocuments = getState().user.portfolio?.orderDocuments || {};
      const list = getState().user.portfolio.list || [];
      let newList = [
        ...list.filter(
          (i: any) => i?.assetDetails?.financeProductType !== type
        ),
        ...res.data,
      ];
      newList = attachOrderDocumentsToPorfolioList(newList, orderDocuments);
      const newPortfolio = {
        ...getState().user.portfolio,
        list: newList,
      };
      dispatch(setPortfolio(newPortfolio));
      cb();
    } catch (e) {
      console.log(e);
      const activeSessionCb = () => {
        const data = {
          activeInvestment: 0,
          list: [],
          returnsTillDate: 0,
          totalActiveInvestment: 0,
          totalExpectedReturns: 0,
        };
        dispatch(setPortfolioLoading(false));
        dispatch(setPortfolio(data));
      };
      handleApiError(e, dispatch, activeSessionCb);
    }
  };
}

export function getPortfolio(fetchNonLlp = true): AppThunk {
  return async (dispatch, getState) => {
    const userData = getState().access;
    if (userData && userData.userID) {
      const now = new Date().getTime();
      const expTime = getState().user.portfolio?.expTime;
      const oldData = getState().user.portfolio?.list || [];

      if (expTime && expTime > now && oldData?.length > 0) {
        dispatch(setPortfolioLoading(false));
      } else {
        dispatch(setPortfolioLoading(true));
        dispatch(
          setPortfolio({
            activeInvestment: 0,
            list: [],
            returnsTillDate: 0,
            totalActiveInvestment: 0,
            totalExpectedReturns: 0,
            investmentCount: {},
          })
        );
      }

      try {
        let invesmentTypes = [
          financeProductTypeConstants.highyieldfd,
          financeProductTypeConstants.leasing,
          financeProductTypeConstants.inventory,
          financeProductTypeConstants.startupEquity,
          financeProductTypeConstants.realEstate,
        ];

        if (fetchNonLlp) {
          invesmentTypes = [
            financeProductTypeConstants.Baskets,
            financeProductTypeConstants.bonds,
            financeProductTypeConstants.sdi,
            ...invesmentTypes,
          ];
        }

        let data = await Promise.all(
          invesmentTypes.map((type) => getUserPortfolio(type, 4, 0))
        );
        let investmentCount = {};
        data.forEach((d: any, i: number) => {
          investmentCount[invesmentTypes[i]] = d.totalInvestmentCount;
        });
        data = data.map((d: any) => d.data).flat();
        if (JSON.stringify(oldData) !== JSON.stringify(data)) {
          dispatch(setPortfolio({ list: data, investmentCount }));
          const spvIDs = Object.keys(groupBy(data, 'spvID'));
          if (!spvIDs.length) {
            const newPortfolio = {
              ...getState().user.portfolio,
              list: [],
              spvDocs: [],
            };
            dispatch(setPortfolio(newPortfolio));
          } else {
            const [orderDocuments, spvData] = await Promise.all([
              fetchDocuments('order'),
              fetchDocuments('spv', spvIDs.join(',')),
            ]);
            let { list: spvList } = spvData;
            spvList = spvList.filter(
              (e: any) =>
                e.docSubType !== 'others' &&
                e.docSubType !== 'term sheet' &&
                e.docSubType !== 'gst' &&
                e.docSubType !== 'coi' &&
                e.docType !== 'invoice'
            );
            const spvDataGrouped = groupBy(spvList, 'moduleID');
            let portfolioList = JSON.parse(
              JSON.stringify(getState().user.portfolio.list)
            );
            portfolioList = attachOrderDocumentsToPorfolioList(
              portfolioList,
              orderDocuments
            );
            const newPortfolio = {
              ...getState().user.portfolio,
              list: portfolioList,
              spvDocs: spvDataGrouped,
              orderDocuments: orderDocuments,
            };
            dispatch(setPortfolio(newPortfolio));
          }
        }
        dispatch(setPortfolioLoading(false));
      } catch (e) {
        console.log(e);
        const activeSessionCb = () => {
          const data = {
            activeInvestment: 0,
            list: [],
            returnsTillDate: 0,
            totalActiveInvestment: 0,
            totalExpectedReturns: 0,
          };
          dispatch(setPortfolioLoading(false));
          dispatch(setPortfolio(data));
        };
        handleApiError(e, dispatch, activeSessionCb);
      }
    }
  };
}
function fetchNotifications(dispatch: any, userID: string | number) {
  if (Number(userID)) {
    dispatch(setNotificationLoading(true));
    getUserNotifications(userID).then((notifications) => {
      if (notifications.msg.data) {
        dispatch(setNotifications(notifications.msg.data));
      }
      dispatch(
        setPendingResignations(notifications.msg.resingationNotification || [])
      );
      dispatch(setPendingMca(notifications.msg.mcaNotifications || []));
      dispatch(setNotificationLoading(false));
    });
  }
}

/**
 * TODO:
 *   1. We can get the userID from redux state
 *
 * Fetch notifications for a user
 * @param userID userID of the user
 * @param cb
 * @returns
 */
export function fetchUserNotifications(
  userID: string | number,
  cb?: () => void
): AppThunk {
  return async (dispatch) => {
    try {
      fetchNotifications(dispatch, userID);
      cb && cb();
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

/**
 * Fetch pan and aadhaar Details for loggedin user
 */
export function getPanAadhaarDetails(
  succesCb?: () => void,
  shouldFetchUser = true,
  shouldFetchSignedDocuments = true
): AppThunk {
  return async (dispatch, getState) => {
    try {
      const details = await fetchDocuments('kyc');
      if (shouldFetchSignedDocuments) {
        const signedUrls = await Promise.all(
          details.list.map((doc: any) => {
            const params: any = { docID: doc?.docID };
            if (
              doc?.docSubType === 'depository' ||
              doc?.kycType === 'depository'
            ) {
              params.module = 'user';
            } else {
              params.module = doc?.module;
            }
            return getSignedUrl(params);
          })
        );
        details.list.forEach((doc: any) => {
          let dataToMap: any = signedUrls.find(
            (el: any) => Number(el.docID) === Number(doc.docID)
          );
          doc.signedUrl = dataToMap.url;
        });
      }

      let detailsGrouped = groupBy(details.list, 'kycType');

      if (Object.keys(detailsGrouped)?.length > 0) {
        const keys = [
          'aadhaar',
          'pan',
          'passport',
          'driving-licence',
          'cheque',
          'depository',
        ];
        keys.forEach((el) => {
          detailsGrouped[el] =
            detailsGrouped[el] && detailsGrouped[el].length
              ? detailsGrouped[el][0]
              : {};
        });
        if (detailsGrouped?.hasOwnProperty('depository')) {
          detailsGrouped.depositoryData = { ...detailsGrouped.depository };
        }
        dispatch(setKycDetails(detailsGrouped));
      } else {
        dispatch(
          setKycDetails({ aadhaar: {}, pan: {}, passport: {}, depository: {} })
        );
      }
      if (shouldFetchUser) {
        const user = await fetchUser();
        dispatch(setUserData({ ...user }));
      }
      await new Promise((resolve, reject) => {
        try {
          succesCb?.();
          resolve(true);
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function getUserKycDocuments(
  userID: any,
  cb?: () => any,
  shouldFetchSignedDocuments?: boolean
): AppThunk {
  return async (dispatch) => {
    try {
      if (Number(userID)) {
        const docs = await fetchDocuments('user', userID);

        const userDocs: any = {
          aadhaar_back: null,
          aadhaar_front: null,
          pan: null,
          cheque: null,
          passport_front: null,
          passport_back: null,
          passport: null,
          other: null,
          bill: null,
          driving_licence: null,
          depository: null,
        };
        if (docs.list.length > 0 && shouldFetchSignedDocuments) {
          const signedUrls = await Promise.all(
            docs.list
              .filter((doc: any) => doc.docType !== 'mca')
              .map((doc: any) => {
                const params: any = { docID: doc.docID };
                if (
                  doc.docSubType === 'depository' ||
                  doc.kycType === 'depository'
                ) {
                  params.module = 'user';
                } else {
                  params.module = doc?.module;
                }
                return getSignedUrl(params);
              })
          );
          docs.list.forEach((doc: any) => {
            let dataToMap: any = signedUrls.find(
              (el: any) => Number(el.docID) === Number(doc.docID)
            );
            doc.signedUrl = dataToMap?.url;
            if (doc.docSubType !== 'photo') {
              userDocs[doc.docSubType] = doc;
            } else {
              userDocs['photo'] = doc.fullPath;
            }
          });
          dispatch(
            setKycDetails({
              driving_licence: userDocs['driving_licence'],
              depository: userDocs['depository'],
            })
          );

          dispatch(setUserData({ ...userDocs, documents: docs?.list }));
        } else {
          dispatch(setUserData({ ...userDocs, documents: docs?.list }));
        }
        cb?.();
      }
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function initateSpvAgreementEsign(
  params: any,
  cb?: (data: any, type: string) => void,
  ecb?: (data: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      const type = params.type;
      const result = await initateAgreementEsign(params.formID, params.amount);
      cb &&
        cb(
          {
            ...result,
            type,
            fileName: type,
            module: 'userDocuments',
            signOnce: params.signOnce,
            formID: params.formID,
          },
          type
        );
    } catch (error) {
      ecb && ecb(processError(error));
    }
  };
}

export function verifyAifAgreements(params: any, cb?: () => {}): AppThunk {
  return async (dispatch) => {
    try {
      await verifyAifAgreement(params);
      cb && cb();
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };
}

export function validateAgreementsEsign(params: any, cb?: () => {}): AppThunk {
  return async (dispatch) => {
    try {
      if (params.orderID) {
        await verifyAIFOrderEsign(params);
      } else {
        await verifyAgreementEsign(params);
      }
      cb && cb();
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };
}

export function fetchAndSetAifDocs(): AppThunk {
  return async (dispatch) => {
    const files = await getAifAgreements();
    dispatch(setAifDocuments(files.result));
  };
}

export function getAnicutAgreement(
  params: any,
  cb?: (data: any, type: string) => void,
  ecb?: (data: any, type: string) => void
): AppThunk {
  return async (dispatch) => {
    try {
      const type = params.type;
      const data = await createAifAgreements(params);
      const result = data.result;
      cb &&
        cb({ ...result, type, fileName: type, module: 'userDocuments' }, type);
    } catch (error) {
      ecb && ecb(processError(error), params.type);
    }
  };
}

export function updatePreferences(data: any, token: string): AppThunk {
  return async (dispatch, getState) => {
    try {
      let currentPreferences = getState().user.preferences;
      let newPreferences = {
        ...currentPreferences,
        config: {
          ...currentPreferences.config,
          [data.channel]: {
            ...currentPreferences.config[data.channel],
            ...data.data,
          },
        },
      };
      await updateUserPreferences(data, token);
      dispatch(setPreferences(newPreferences));
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function fetchPreferences(token: string, cb: () => void): AppThunk {
  return async (dispatch) => {
    try {
      const userPreference = await fetchUserPreferences(token);
      dispatch(setPreferences(userPreference));
      cb && cb();
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function uploadKycDocuments(
  file: File,
  docType: string,
  docSubType: string,
  cb?: (success?: boolean, error?: unknown) => void,
  accountType?: string,
  showError: boolean = true,
  sendToTerminal?: boolean
): AppThunk {
  return async (dispatch, getState) => {
    const userData = getState().user.userData;
    try {
      if (userData.userID) {
        let document: any = await uploadUserDocument(
          userData.userID,
          {
            docType: docType,
            docSubType: docSubType,
            displayName: `KYC Document - ${docSubType}`,
            displayOrder: 1,
            accountType,
            sendToTerminal,
          },
          file
        );
        const signedUrlData = await getSignedUrl({
          module: 'user',
          docID: document.docID,
        });
        if (signedUrlData?.url) {
          document.signedUrl = signedUrlData.url;
        }
        const moreData: any = {};
        if (docSubType === 'aadhaar_front') {
          if (userData?.aadhaar_back) {
            moreData['kycAadhaarStatus'] = 'pending verification';
          }
          document.status = 'pending verification';
        } else if (docSubType === 'aadhaar_back') {
          if (userData?.aadhaar_front) {
            moreData['kycAadhaarStatus'] = 'pending verification';
          }
          document.status = 'pending verification';
        } else if (docSubType === 'pan') {
          moreData['kycPanStatus'] = 'pending verification';
          document.status = 'pending verification';
        } else if (docSubType === 'cheque') {
          moreData['kycBankStatus'] = 'pending verification';
          dispatch(setUserChequeOcrResponse({ ...document?.ocrResponse }));
        }
        dispatch(
          setUserData({ ...userData, [docSubType]: document, ...moreData })
        );

        cb && cb(document);
      }
    } catch (e) {
      cb && cb(false, processError(e));
      if (showError) {
        handleApiError(e, dispatch);
      }
    }
  };
}
export function clearOcrResponse(): AppThunk {
  return async (dispatch) => {
    dispatch(deleteUserChequeOcrResponse({}));
  };
}

export function getPortfolioSummary(
  assetStatus: string,
  dateRange: string,
  cb?: () => void,
  isDiscovery = false,
  financeProductType = '',
  upcomingReturnType = upcommingReturnFilter[0].id
): AppThunk {
  return async (dispatch, getState) => {
    const userData = getState().user.userData;
    setPortfolioLoading(true);

    const modifyDateRange =
      upcomingReturnType === upcommingReturnFilter?.[1]?.['id']
        ? 'next6month'
        : dateRange;

    if (userData && userData.userID) {
      try {
        const data = await getUserPortfolioSummary(
          assetStatus,
          modifyDateRange,
          upcomingReturnType,
          isDiscovery,
          financeProductType
        );
        if (upcomingReturnType == upcommingReturnFilter[1].id) {
          dispatch(
            setPortfolio({
              summary: {
                ...data,
              },
            })
          );
        } else {
          dispatch(setPortfolio({ summary: data }));
        }
        setPortfolioLoading(false);
      } catch (e) {
        const activeSessionCb = () => {
          dispatch(setPortfolio({}));
        };
        handleApiError(e, dispatch, activeSessionCb);
      } finally {
        cb?.();
      }
    }
  };
}

export function fetchRepaymentSchedule(
  assetID: string,
  orderID?: string
): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setRepaymentLoading(true));
      const response = await fetchScheduleOfPayment(assetID, orderID);
      const { msg } = response;
      dispatch(setRepaymentSchedule({ repaymentSchedule: msg, orderID }));
      dispatch(setRepaymentLoading(false));
    } catch (e) {
      handleApiError(e, dispatch);
    }
  };
}

export function updateUserKYC(
  params: any,
  kycType: string,
  successCb?: () => void,
  errorCb?: (err: any) => void
): AppThunk {
  return async () => {
    try {
      await addKyc(params, kycType);
      successCb?.();
    } catch (e) {
      errorCb?.(e);
    }
  };
}

export function initiateKYCForBank(
  data: any,
  succesCb?: (response: any) => void,
  errorCb?: (response: any) => void
): AppThunk {
  return async () => {
    try {
      const response = await startBankKYC(data);
      succesCb?.(response);
    } catch (e) {
      errorCb?.(e);
    }
  };
}

export function esignDocument(
  cb?: (data: any, name?: string, notification?: any) => void,
  failedCb?: (data: any, name?: string) => void,
  assetName?: string,
  formID?: any,
  amount?: any,
  notification?: any
): AppThunk {
  return async (dispatch) => {
    try {
      const data = await initateAgreementEsign(formID, amount);
      cb && cb(data, assetName, notification);
    } catch (err) {
      const e = err as any;
      const activeSessionCb = () => {
        if (
          (e?.response?.data && e?.response?.data?.msg) ||
          e?.response?.data?.message
        ) {
          failedCb &&
            failedCb(
              e?.response?.data?.msg || e?.response?.data?.message,
              assetName
            );
        } else {
          failedCb && failedCb('Something went wrong!', assetName);
        }
      };
      handleApiError(e, dispatch, activeSessionCb);
    }
  };
}

export function updateCkyc(): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setCkycLoading(true));
      await updateCkycStatus();
    } catch (e) {
      console.log(e, 'ERROR');
    }
  };
}

export function generateStatementRequest(data: any, cb?: () => void): AppThunk {
  return async () => {
    try {
      await generateDownloadStatementRequest(data);
      callSuccessToast('Request Submitted!');
      cb && cb();
    } catch (e) {
      cb && cb();
    }
  };
}

export function addDepository(
  data: any,
  cb?: (updatedUser?: any) => void,
  errorCb?: (error: string) => void
): AppThunk {
  return async (dispatch, getState) => {
    const userID = getState().access.userID;
    if (userID) {
      data.userID = userID;
      try {
        await addDepositoryAPI(data);
        const user = await fetchUser();
        dispatch(setUserData(user));
        cb && cb(user);
      } catch (e) {
        errorCb && errorCb(processError(e));
      }
    }
  };
}

export function deleteCMRDocument(
  type: string,
  cb?: (updatedUser?: any) => void,
  errorCb?: (error: string) => void
): AppThunk {
  return async (dispatch, getState) => {
    const userID = getState().access.userID;
    if (userID) {
      try {
        await deleteCMRDoc(type, userID);
        const user = await fetchUser();
        dispatch(setUserData(user));
        cb && cb(user);
      } catch (e) {
        errorCb && errorCb(processError(e));
      }
    }
  };
}

export function getDataFromIFSC(
  ifsc: string,
  succesCb: (data: any) => void,
  failedCb: (error: any) => void
): AppThunk {
  return async () => {
    try {
      const result = await verifyIFSCCode(ifsc);
      succesCb(result);
    } catch (e) {
      failedCb(e);
    }
  };
}

export function closeKycPopup(): AppThunk {
  return async (dispatch) => {
    dispatch(showKycPopup(false));
  };
}

export function fetchKycConfigStatus(
  assetID?: string,
  cb?: (kycData?: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      const config = await handleKycStatus(assetID);
      dispatch(setKycStatus({ default: { ...config, kycStatusLoaded: true } }));
      cb?.(config);
    } catch (e) {
      dispatch(setKycStatus({}));
      cb?.();
    }
  };
}

export function fetchUccStatus(): AppThunk {
  return async (dispatch) => {
    try {
      const UccData = await getUserUccStatus();
      dispatch(setUccStatus(UccData));
    } catch (e) {
      dispatch(setUccStatus({}));
    }
  };
}

export function createFDOrder(
  orderBody: OrderInitateBody,
  succesCb: (paymentLink: string) => void,
  errorCb: () => void
): AppThunk {
  return async (dispatch) => {
    let finalTenure = Number(orderBody?.tenure || 1);

    if (isNaN(finalTenure)) {
      finalTenure = 1;
    }

    try {
      await createFixerraUser();
      dispatch(
        setOpenFDStepperLoader({
          step: 1,
        })
      );
      const { paymentLink } = await createFixerraOrderInitiate({
        ...orderBody,
        tenure: Math.ceil(finalTenure),
      });
      succesCb(paymentLink);
    } catch (e) {
      const message = processError(e);
      callErrorToast(message);
      errorCb();
    }
  };
}

export function fetchPortfolioOverviewDiscover(
  signal: AbortSignal,
  onFinallyCb?: () => void
): AppThunk {
  return async (dispatch) => {
    getUserInvestmentData(
      'Bonds,Commercial Property,High Yield FDs,Inventory Financing,Lease Financing,SDI Secondary,Basket',
      'all',
      signal
    )
      .then((data) => {
        dispatch(setDiscoverPortfolio(data));
      })
      .catch(() => {
        dispatch(setDiscoverPortfolio(portfolioInitState));
      })
      .finally(() => {
        onFinallyCb?.();
      });
  };
}

export const logout =
  (payload: {
    redirect: string;
    isAutoLogout: boolean;
    externalUserId?: string;
    pageSection?: string;
  }) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const userID = state?.user?.userData?.userID ?? '';

    if (
      typeof payload === 'object' &&
      payload !== null &&
      !Array.isArray(payload)
    ) {
    await trackEvent(
        'user_logged_out',
        {
          isAutologout: payload?.isAutoLogout,
          externalUserId: payload?.externalUserId,
          userId: userID,
          type: payload?.isAutoLogout ? 'automated' : 'manual',
          last_page: payload?.pageSection ?? window.location.pathname?.split('/')[1],
        },
        '',
        state
      );
    }

    MoengageWebServices.trackUserLogout();

    localStorage.clear();
    Cookies.remove('storedTime2FA');
    Cookies.remove('loginID');
    Cookies.remove('gcPartnerCode');
    Cookies.remove('utm');

    if ((window as any)?.ReactNativeWebView) {
      (window as any)?.ReactNativeWebView?.postMessage('user_logout_event');
    }

    setTimeout(() => {
      redirectHandler({
        pageUrl: window.location.origin + (payload?.redirect ?? ''),
        pageName: 'Logout function',
      });
    }, 700);
  };
