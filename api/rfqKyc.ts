import {
  VerifyReqBodyModel,
  DocumentProcessModel,
  DocReqUploadModel,
  FileUploadResponseModel,
  otherInfoFormModel,
  KRAReqModel,
  AddressModuleType,
} from '../components/user-kyc/utils/models';
import { fetchAPI } from './strapi';

export const handleDocumentUpload = (
  data: DocReqUploadModel
): Promise<FileUploadResponseModel> => {
  return fetchAPI(
    `/v3/document/upload`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const handleDocumentProcess = (data: DocumentProcessModel) => {
  return fetchAPI(
    `/v3/document/process`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const getPanFromMobile = () => {
  return fetchAPI(
    '/v3/kyc/pan-verification',
    {},
    { method: 'POST' },
    true,
    false
  );
};

export const handleVerifyDocument = (data: VerifyReqBodyModel) => {
  return fetchAPI(
    `/v3/document/verify`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const KycNomineeDetails = async (params) => {
  const res = await fetchAPI(
    `/v3/users/nominee`,
    {},
    { method: 'PUT', body: JSON.stringify(params) },
    true,
    false,
    false,
    {},
    true,
    true
  );
  return res;
};

export const eSignAOF = () => {
  return fetchAPI(
    `/v3/kyc/aof/generate`,
    {},
    {},
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const aofVerify = (documentID: string) => {
  return fetchAPI(
    `/v3/kyc/aof/verify/${documentID}`,
    {},
    {},
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const handleOtherDetailPost = (data: otherInfoFormModel) => {
  return fetchAPI(
    `/v3/kyc/kra/other-details`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const handleFetchKRAPan = (data: KRAReqModel) => {
  return fetchAPI(
    `/v3/kyc/kra`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const handleKycStatus = (dealID?: string) => {
  let url = `/v3/kyc/status`;
  if (dealID) {
    url += `?assetID=${dealID}`;
  }

  return fetchAPI(url, {}, {}, true);
};

// Digilocker APIs
export const createDigilockerRequest = () => {
  return fetchAPI(
    `/v3/kyc/digilocker/login`,
    {},
    {
      method: 'POST',
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const fetchAadhaarDetailsFromDg = (id: string) => {
  return fetchAPI(
    `/v3/kyc/digilocker/fetch/${id}`,
    {},
    {
      method: 'POST',
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const verifyAddressDetails = (moduleType: AddressModuleType) => {
  return fetchAPI(
    `/v3/kyc/other-details/verify`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        docType: 'user',
        moduleType: moduleType,
      }),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const handleVerifyDemat = (data: any) => {
  return fetchAPI(
    `/v3/kyc/process/depository`,
    {},
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

type GetECASFromGmailParams = {
  code: string;
  environment?: string;
  client?: string;
};

export const getECASFromGmail = (data: GetECASFromGmailParams) => {
  const payload = {
    method: 'POST',
  };
  const { code } = data;
  if (code) {
    payload['body'] = JSON.stringify(data);
  }
  return fetchAPI(
    `/v3/kyc/process/ecas/google-apis`,
    {},
    payload,
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const getRetryCounts = () => {
  return fetchAPI(`/v3/kyc/retry-counts`, {}, {}, true, false);
};

export const sendAadhaarOTP = (aadhaarNumber: string) => {
  return fetchAPI(
    `/v3/kyc/aadhaar-xml/otp-generate`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        aadhaarNumber,
      }),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const verifyAadhaarOTP = (
  requestId: string,
  aadhaarNumber: string,
  otp: string
) => {
  return fetchAPI(
    `/v3/kyc/aadhaar-xml/otp-verify`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        requestId,
        aadhaarNumber,
        otp,
      }),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const isServiceActive = () => {
  return fetchAPI(
    `/v3/health/thirdParty`,
    {},
    { method: 'GET' },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const handleQualificationPost = (data: string) => {
  return fetchAPI(
    `/v3/users/qualification`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        qualification: data,
      }),
    },
    true,
    false
  );
};

export const handleFetchKRAPanV2 = () => {
  return fetchAPI(
    `/v3/kyc/kra`,
    {},
    {
      method: 'POST',
    },
    true,
    false,
    false,
    { 'x-api-version': 1.2 },
    true,
    true
  );
};
