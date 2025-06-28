import axios from 'axios';
import { convertObjectToFormDataObj, fetchAPI } from './strapi';

export const fetchDocuments = (
  module: 'asset' | 'partner' | 'user' | 'spv' | 'order' | 'kyc',
  id?: number | string
) => {
  return fetchAPI(
    module == 'order' ? `/v3/portfolio/documents` : `/v1/documents/${module}`,
    module !== 'order'
      ? {
          ids: id,
        }
      : null,
    {},
    true
  );
};

export const getSignedUrl = (document: any) => {
  return fetchAPI(
    `/v1/documents/${document.module}/${document.docID}`,
    {},
    {},
    true
  );
};

export const getPortfolioDocSignedUrl = (objectPath: string) => {
  return fetchAPI(`/v3/document/${objectPath}`, {}, {}, true);
};

export const moveDocuments = (params: any) => {
  return fetchAPI(
    `/v2/documents/move`,
    {},
    { method: 'post', body: JSON.stringify(params) },
    true
  );
};

export const getAifAgreementsTemplates = (spvID: number) => {
  return fetchAPI(`/v2/spvs/aif-documents?spvID=${spvID}`, {}, {}, true);
};

const development = {
  PARTNER: 'e0e409385680b5a1d7a008fe048ecbd0',
  ASSET: 'wBv666Z%f4Z9Chb8ysPzkJN#wej7E%',
  SPV: 'NhHAbNjzu6r2yUMaqzFQ6hkzbXAGmrnG',
  ORDER: '4ZUbN4fyjt3sTjcgpZw7yGmmfOTPjHOM',
  USER: 'e0e409385680b5a1d7a008fe048ecbd0',
};

const production = {
  PARTNER: 'oE0HXc1zFvdYIVbgUqDalykxOi9Cp5R6PMj24ATBQJfK8WG7remwZsNStL3hnu',
  ASSET: 'mLa5TvWYEjGPlnKQxC702ywoNbOhs1cAgBFiD3zM9qtRJpHVSr86XIUueZd4fk',
  SPV: 'oOKjN7nZsAQgxtwiaYGqH0M4fbvcyDhmC2rdWuke5TzF1lVBUS3X8L6p9IPJRE',
  ORDER: 'YrnAlsxjG7U5EDzRaH6c8WmOhVpu0BK2CLiT9IFt4ZwQgJP1bNSXkdyoMfvqe3',
  USER: 'tByX9Pvf5aEUmCVK7pj6hrQeobZ2GJkWl0RAgOqIwcxN1SM4sTdHL3izDuFnY8',
};

type keyTypes = 'PARTNER' | 'ASSET' | 'SPV' | 'ORDER' | 'USER';

const keys = {
  development,
  production,
};

export const getAPIKey = (key: keyTypes): string => {
  return keys.development[key];
};

const asset = {
  accessid: 'assetModule',
  accesskey: getAPIKey('ASSET'),
};

const partner = {
  accessid: 'partnerModule',
  accesskey: getAPIKey('PARTNER'),
};

const user = {
  accessid: 'userModule',
  accesskey: getAPIKey('USER'),
};

const spv = {
  accessid: 'spvModule',
  accesskey: getAPIKey('SPV'),
};

const modules = {
  asset,
  partner,
  user,
  spv,
};

const createDocument = (id: number | string, data: any, module: string) => {
  return fetchAPI(
    '/v2/documents/upload/prepare',
    {},
    {
      contentType: 'multipart/form-data',
      method: 'post',
      body: JSON.stringify({
        ...data,
        moduleID: id,
        module: module,
      }),
    },
    true,
    undefined,
    undefined,
    modules.user
  );
};

const uploadDocumentStatus = (
  id: number | string,
  refID: string,
  module: string,
  accountType?: string,
  sendToTerminal?: boolean
) => {
  return fetchAPI(
    '/v2/documents/upload/done',
    {},
    {
      contentType: 'multipart/form-data',
      method: 'post',
      body: JSON.stringify({
        moduleID: id,
        module: module,
        refID,
        accountType, //for bankdocs
        sendToTerminal,
      }),
    },
    true
  );
};

export const uploadDocumentToS3 = async (
  postURL: string,
  data: any,
  file: File
) => {
  const body = convertObjectToFormDataObj({
    ...data,
    file,
  });
  return axios.post(postURL, body, {
    headers: {
      contentType: 'multipart/form-data',
    },
  });
};

export const uploadUserDocument = (
  userID: string | number,
  details: any,
  file: File
) => {
  return new Promise(async (resolve, reject) => {
    try {
      details.fileName = file.name;
      const sendToTerminal = details?.sendToTerminal;
      const accountType = details.accountType; //for bankdocs
      delete details.accountType;
      const documentResponse = await createDocument(userID, details, 'user');
      delete documentResponse.postData?.success_action_status;
      await uploadDocumentToS3(
        documentResponse.postURL,
        documentResponse.postData,
        file
      );
      const uploadResponse = await uploadDocumentStatus(
        userID,
        documentResponse.refID,
        'user',
        accountType,
        sendToTerminal
      );
      resolve(uploadResponse);
    } catch (e) {
      reject(e);
    }
  });
};
