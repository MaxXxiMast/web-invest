type _MoengageWebUserIdentity = {
  // name
  firstName: string;
  lastName: string;
  name?: string;
  // email ID
  email?: string;
  // phone number
  mobileCode?: string;
  mobileNo?: string;
  mobile?: string;
};
class MoengageWebServices {
  private static getClientInstance() {
    if (typeof window !== 'undefined') {
      return (window as any).Moengage || null;
    }
    return null;
  }

  static trackUserLogin(userID: number) {
    const _Moengage = MoengageWebServices.getClientInstance();
    _Moengage?.add_unique_user_id(userID);
  }

  static trackUserLogout() {
    const _Moengage = MoengageWebServices.getClientInstance();
    _Moengage?.destroy_session();
  }

  static track(eventName: string, params: object = {}) {
    const _Moengage = MoengageWebServices.getClientInstance();
    _Moengage?.track_event(eventName, {
      ...params,
    });
  }

  static transformUserIdentityEvent(params: any) {
    // pick events required for Moengage
    const transformedParams: _MoengageWebUserIdentity = {
      ...params,
      firstName: params.firstName,
      lastName: params.lastName,
      ...(params.firstName?.length && params.lastName?.length
        ? {
            name: `${params.firstName} ${params.lastName}`,
          }
        : {}),

      email: params.email,

      mobileCode: params.mobileCode,
      mobileNo: params.mobileNo,
      ...(params.mobileNo?.length && params.mobileCode?.length
        ? {
            mobile: `${params.mobileCode}${params.mobileNo}`,
          }
        : {}),
    };
    return transformedParams;
  }
}

export default MoengageWebServices;
