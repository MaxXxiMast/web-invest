export type DocTypeModel = 'kyc' | 'user';
export type DocSubTypeModel =
  | 'pan'
  | 'depository'
  | 'cheque'
  | 'bank_statement'
  | 'net_banking_screenshot'
  | 'liveness'
  | 'eCAS';

export type KycStepType =
  | 'pan'
  | 'address'
  | 'liveness'
  | 'signature'
  | 'bank'
  | 'depository'
  | 'other'
  | 'nominee'
  | 'aof';

export type ErrorCardType = 'error' | 'underVerification';

export type LivenessErrorType =
  | 'locationDenied'
  | 'locationDataError'
  | 'outOfIndia'
  | 'docFetchError'
  | 'initError';

export type userLocationType = {
  lat: number | null;
  long: number | null;
  type?: 'geoLocation' | 'ip';
};

export type userDocsType = {
  pan: string | null;
  aadhar: string | null;
  aadhar_photo?: string | null;
};

export type AddressModuleType = 'kra' | 'digilocker';

export type BankDataModal = {
  accountType: string;
  accountNo: string;
  ifscCode: string;
  branchName?: string;
  accountName?: string;
};

export type SelectModel = {
  value?: string | ReadonlyArray<string> | number;
  labelKey: string;
};

export type livelinessModel = {
  filename: string;
  filepath: string;
  match: string;
  matchScore: number;
  conf: number;
};

export type otherInfoFormModel = {
  gender: string;
  occupation: string;
  income: string;
  nationality: string;
  maritalStatus: string;
  motherMaidenName: string;
  isSEBIAction: boolean;
  qualification: string;
};

export type DematDataModal = {
  panNo: string;
  dpID: string;
  clientID: string;
  brokerName: string;
};

export type PanDataModal = {
  panNo: string;
  name: string;
  date: string;
  nominee: string;
};

export type VerifyReqBodyModel = {
  docData: BankDataModal | PanDataModal | DematDataModal;
  docSubType: string;
  docType: string;
};

export type DocReqUploadModel = {
  docType: string;
  docSubType: string;
  filename: string;
  contentLength: number;
};

export type DocumentProcessModel = {
  docType: DocTypeModel;
  docSubType: DocSubTypeModel;
  filename?: string;
  filepath?: string;
  filepassword?: string;
  message?: object;
  docIDNo?: string;
};

export type FileUploadResponseModel = {
  fields: any;
  filepath: string;
  filename?: string;
  url: string;
};

export type PanDocumentResponseModel = {
  kycID: number;
  userID: number;
  docIDNo: string;
  docName: string;
  kycType: string;
  nomineeName: string;
  filename: string;
  filepath: string;
  ocrApproved: boolean;
  status: number;
  subStatus: number;
  retryCount?: number;
  dob: string;
};

export type ErrorModel = {
  type: string;
  heading: string;
  message: string;
  retryCount: number;
};

export type BankFieldErrorModel = {
  accTypeErr: boolean;
  accNoErr: boolean;
  ifscErr: boolean;
};

export type DocOptionsModel = {
  label: string;
  value: DocSubTypeModel;
  disabled?: boolean;
};

export type ErrorMessModel = {
  type?: string;
  heading: string;
  message: string;
};

export type KRAReqModel = {
  panNumber: string;
  dob: string;
};

export type AddressProofDTO = {
  address1: string;
  address2: string;
  address3: string;
  city: string;
  pincode: string;
  state: string;
  addressProofRef: string;
};

export type AddressStatusDTO = {
  permanentAddress: string;
  permanentCity: string;
  permanentState: string;
  permanentPincode: string;
  permanentAddressProofRef: string;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentPincode: string;
  currentAddressProofRef: string;
  userName: string;
  kraStatus: string;
  moduleType: string;
  status: number;
  currentAddress2?: string;
  currentAddress3?: string;
  permanentAddress2?: string;
  permanentAddress3?: string;
};

export type KRAResponseModel = {
  userID: number;
  kraID: number;
  kraStatus: string;
  userName?: string;
  permanent?: Partial<AddressProofDTO>;
  current?: Partial<AddressProofDTO>;
};

export type KycStatusResponseModel = {
  fields: any;
  isKYCComplete: boolean;
  isKYCPendingVerification: boolean;
  name: string;
  remarks: string[];
  optionalFields?: Record<string, unknown>;
};

export type KycStepModel = {
  status: number | string;
  name: KycStepType;
  isExistingData?: boolean;
};

export type DematProcessResponseModel = {
  id: number;
  userID: number;
  dpID: string;
  clientID: string;
  accountNo: string;
  ifscCode: string;
  status: number;
  dpName: string;
  dematName: string;
  subStatus: number;
  brokerName: string;
  panNo: string;
  retryCount?: string;
  type?: string;
  heading?: string;
  message?: string;
  ocrResponse?: Array<DematProcessResponseModel>;
};

export type DigilockerResponseModel = Partial<{
  createdAt: string;
  updatedAt: string;
  id: number;
  userID: number;
  moduleType: string;
  moduleStatus: string;
  gender: string;
  nationality: string;
  guardianName: string;
  permanentAddress1: string;
  permanentAddress2: string;
  permanentAddress3: string;
  permanentCity: string;
  permanentState: string;
  permanentPincode: string;
  permanentCountry: string;
  currentAddress1: string;
  currentAddress2: string;
  currentAddress3: string;
  currentCity: string;
  currentState: string;
  currentPincode: string;
  currentCountry: string;
  userName: string;
  permanentAddressProof: string;
  permanentAddressProofRef: string;
  status: number;
  subStatus: number;
}>;

/**  Demat Add Models Start */

export type DematAddDataModal = {
  dematID: string;
};

/**  Demat Add Models END */
