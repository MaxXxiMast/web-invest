import { isKycUnderVerification, pendingStatuses } from '../../utils/user';

export const isKycPendingWoCMRCML = (userData: any) => {
  const { kycPanStatus, kycAadhaarStatus, kycBankStatus, cheque, nomineeName } =
    userData || {};

  return (
    pendingStatuses.includes(kycPanStatus) ||
    pendingStatuses.includes(kycAadhaarStatus) ||
    pendingStatuses.includes(kycBankStatus) ||
    !cheque ||
    cheque?.status === 'pending verification' ||
    cheque?.status === 2 ||
    !nomineeName
  );
};

export const getTotalOrdersCheckStatus = (
  userData: any,
  walletSummary: any
) => {
  const totalOrders = userData?.investmentData?.totalInvestments;
  const skipWithdrawalAmountCheck = walletSummary?.skipWithdrawalCheck;
  return Boolean(totalOrders || skipWithdrawalAmountCheck);
};

export const isUserInstitutional = (userData: any, userPan: string) => {
  return userData?.type === 'institutions' || isUserPANInstitutional(userPan);
};

const isUserPANInstitutional = (panNo: string = '') => {
  const allowedAsInstitutional = ['C', 'F', 'A', 'T', 'B', 'L'];
  if (panNo?.length === 10) {
    return allowedAsInstitutional.includes(panNo[3].toUpperCase());
  } else {
    return false;
  }
};

export const getVaultToolipForWithdrawal = (user: any, walletSummary: any) => {
  const { portfolio, userData, kycDetails } = user;
  const list = portfolio?.list || [];
  let esignPending = false;
  let resignPending = false;
  for (let i = 0; i < list.length; i++) {
    let portfolio = list[i];
    if (portfolio?.hasLlp && !portfolio?.isEsigned && !esignPending) {
      esignPending = true;
    }
    if (
      portfolio?.hasResignation &&
      portfolio?.shouldResign &&
      !portfolio?.isResigned &&
      !resignPending
    ) {
      resignPending = true;
    }
  }
  const kycDone = userData?.kycDone || false;
  const kycPending = isKycPendingWoCMRCML(user.userData);
  const kycUnderVerification = isKycUnderVerification(user.userData);
  const allowIfOrdersPlaced = getTotalOrdersCheckStatus(
    userData,
    walletSummary
  );
  const userPan = kycDetails?.pan?.docIDNo;
  const kycBankStatus = user?.kycBankStatus;
  const isInstitutional =
    isUserInstitutional(user.userData, userPan) &&
    (kycBankStatus === 'verified' || kycBankStatus === 1);

  if (isInstitutional) {
    if (!allowIfOrdersPlaced) {
      return `Please reach out to invest@gripinvest.in to proceed`;
    }
    return `Click to place a withdrawal request. Money will be transferred to your registered bank account within 1 business day`;
  }
  if (kycPending) {
    let prefix = `Visit notification center to complete your KYC`;
    let suffix = `to be able to withdraw from Vault`;
    if (esignPending && resignPending) {
      return `${prefix}, eSign your LLP agreement(s) and resignation letter(s) ${suffix}`;
    } else if (esignPending && !resignPending) {
      return `${prefix}, eSign your LLP agreement(s) ${suffix}`;
    } else if (!esignPending && resignPending) {
      return `${prefix}, eSign your resignation letter(s) ${suffix}`;
    } else if (!esignPending && !resignPending) {
      return `${prefix} ${suffix}`;
    }
  } else if (kycUnderVerification) {
    let prefix = `Wait for your KYC to be verified`;
    let suffix = `to be able to withdraw from Vault.`;
    if (esignPending && resignPending) {
      return `${prefix} and then eSign your LLP agreement(s) and resignation letter(s) ${suffix}`;
    } else if (esignPending && !resignPending) {
      return `${prefix} and then eSign your LLP agreement(s) ${suffix}`;
    } else if (!esignPending && resignPending) {
      return `${prefix} and then eSign your resignation letter(s) ${suffix}`;
    } else if (!esignPending && !resignPending) {
      return `${prefix} ${suffix}`;
    }
  } else if (kycDone) {
    let prefix = `Visit notification center to complete eSign of your`;
    let suffix = `to be able to withdraw from Vault`;
    if (esignPending && resignPending) {
      return `${prefix} LLP agreement(s) and resignation letter(s) ${suffix}`;
    } else if (esignPending && !resignPending) {
      return `${prefix} LLP agreement(s) ${suffix}`;
    } else if (!esignPending && resignPending) {
      return `${prefix} resignation letter(s) ${suffix}`;
    } else if (!allowIfOrdersPlaced) {
      return `Please reach out to invest@gripinvest.in to proceed`;
    } else if (!esignPending && !resignPending) {
      return `Click to place a withdrawal request. Money will be transferred to your registered bank account within 1 business day`;
    }
  }
  if (!allowIfOrdersPlaced) {
    return `Please reach out to invest@gripinvest.in to proceed`;
  }
  return `Click to place a withdrawal request. Money will be transferred to your registered bank account within 1 business day`;
};

export const getAutoWithdrawlErrorText = (user: any, walletSummary: any) => {
  const { portfolio, userData } = user;
  const list = portfolio?.list || [];
  let esignPending = false;
  let resignPending = false;
  for (let i = 0; i < list.length; i++) {
    let portfolio = list[i];
    if (portfolio?.hasLlp && !portfolio?.isEsigned && !esignPending) {
      esignPending = true;
    }
    if (
      portfolio?.hasResignation &&
      portfolio?.shouldResign &&
      !portfolio?.isResigned &&
      !resignPending
    ) {
      resignPending = true;
    }
  }
  const kycDone = userData?.kycDone || false;
  const kycPending = isKycPendingWoCMRCML(user.userData);
  const kycUnderVerification = isKycUnderVerification(user.userData);
  const allowIfOrdersPlaced = getTotalOrdersCheckStatus(
    userData,
    walletSummary
  );

  const commonPrefix = 'Urgent: Vault withdrawals blocked until you complete';
  const commonSuffix = 'from Notification Center';

  if (kycPending) {
    let prefix = `${commonPrefix} your KYC`;
    if (esignPending && resignPending) {
      return `${prefix}, eSign your LLP agreement(s) and resignation letter(s) ${commonSuffix}`;
    } else if (esignPending && !resignPending) {
      return `${prefix}, eSign your LLP agreement(s) ${commonSuffix}`;
    } else if (!esignPending && resignPending) {
      return `${prefix}, eSign your resignation letter(s) ${commonSuffix}`;
    } else if (!esignPending && !resignPending) {
      return `${prefix} ${commonSuffix}`;
    }
  } else if (kycUnderVerification) {
    let prefix = `Urgent: Wait for your KYC to be verified`;
    if (esignPending && resignPending) {
      return `${prefix} and then eSign your LLP agreement(s) and resignation letter(s) ${commonSuffix}`;
    } else if (esignPending && !resignPending) {
      return `${prefix} and then eSign your LLP agreement(s) ${commonSuffix}`;
    } else if (!esignPending && resignPending) {
      return `${prefix} and then eSign your resignation letter(s) ${commonSuffix}`;
    } else if (!esignPending && !resignPending) {
      return prefix;
    }
  } else if (kycDone) {
    let prefix = `${commonPrefix} eSign of your`;
    if (esignPending && resignPending) {
      return `${prefix} LLP agreement(s) and resignation letter(s) ${commonSuffix}`;
    } else if (esignPending && !resignPending) {
      return `${prefix} LLP agreement(s) ${commonSuffix}`;
    } else if (!esignPending && resignPending) {
      return `${prefix} resignation letter(s) ${commonSuffix}`;
    } else if (!allowIfOrdersPlaced) {
      return `Please reach out to invest@gripinvest.in to proceed`;
    }
  }
  if (!allowIfOrdersPlaced) {
    return `Please reach out to invest@gripinvest.in to proceed`;
  }
  return '';
};
