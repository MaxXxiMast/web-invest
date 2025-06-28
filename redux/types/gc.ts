type UsersDTO = {
  userID: string;
  emailID: string;
  mobileNo: string;
  firstName: string;
  lastName: string;
};

export type GCAuthResponse = {
  userData: UsersDTO;
  userType: 'new' | 'existing';
  accessToken: string;
  redirectURL: string;
};
