import { dateFormatter, isToday } from '../../../utils/dateFormatter';

/**
 * This function determines the status of the "Invest Now" button based on various conditions.
 * Below is a table outlining the conditions, statuses, and expected results:
 *
 * | Condition                                                                       | Status                                  | isSubmitDisabled | Message                                                                           |
 * |----------------------------------------------------------------------------------|-----------------------------------------|-----------------|-----------------------------------------------------------------------------------|
 * | PAN KYC is pending verification                                                  | KYC Pending Verification                | true            | "Our internal team is reviewing your documents. It will be reviewed within 24-48 hours." |
 * | Bank KYC is pending verification, and Nominee KYC is complete                    | KYC Pending Verification                | true            | "Our internal team is reviewing your documents. It will be reviewed within 24-48 hours." |
 * | Either Bank or Liveness KYC is pending verification, and AOF KYC is complete     | KYC Pending Verification                | true            | "Our internal team is reviewing your documents. It will be reviewed within 24-48 hours." |
 * | Depository KYC is pending verification                                           | KYC Pending Verification                | true            | "Our internal team is reviewing your documents. It will be reviewed within 24-48 hours." |
 * | Filtered KYC is not complete                                                     | KYC Not Complete                        | false           | null                                                                              |
 * | Asset is RFQ, and the user is not debarred                                       | Asset is RFQ and User is Not Debarred   | false           | null                                                                              |
 * | Asset is not RFQ                                                                 | Asset is Not RFQ                        | false           | null                                                                              |
 * | User is debarred, and the debarment ends today                                   | User Debarred Until 5 PM Today          | true            | "You are debarred from debt market till 5 PM IST today as [reason]."              |
 * | User is debarred, and the debarment ends in the future                           | User Debarred Beyond Today              | true            | "As per SEBI regulations you are not permitted to invest in debt market till [formatted date] as [reason]." |
 * | None of the above conditions are met                                             | Default Case                            | false           | null                                                                              |
 */

export const getInvestNowButtonStatus = (
  kycConfigStatus: any,
  debarmentData: any,
  isAssetRFQ: boolean
) => {
  let kycStatus: any = {};
  kycConfigStatus?.kycTypes?.forEach((kyc: any) => {
    kycStatus = {
      ...kycStatus,
      [kyc.name]: {
        isKYCComplete: kyc.isKYCComplete,
        isKYCPendingVerification: kyc?.isKYCPendingVerification,
      },
    };
  });
  // check if kyc is pending verification
  if (
    kycStatus?.pan?.isKYCPendingVerification ||
    (kycStatus?.bank?.isKYCPendingVerification &&
      kycStatus?.nominee?.isKYCComplete) ||
    ((kycStatus?.bank?.isKYCPendingVerification ||
      kycStatus?.liveness?.isKYCPendingVerification) &&
      kycStatus?.aof?.isKYCComplete) ||
    kycStatus?.depository?.isKYCPendingVerification
  ) {
    return {
      isSubmitDisabled: true,
      message:
        'Our internal team is reviewing your documents. It will be reviewed within 24-48 hours',
    };
  }
  // check if kyc is not complete
  if (!kycConfigStatus?.isFilteredKYCComplete) {
    return { isSubmitDisabled: false, message: null };
  }
  // check if user is debarred or asset is non RFQ
  if ((isAssetRFQ && !debarmentData?.isDebarred) || !isAssetRFQ) {
    return { isSubmitDisabled: false, message: null };
  }
  const debarrDate = debarmentData?.debarredDetails?.till;
  const reason =
    debarmentData?.debarredDetails?.reason || 'your last order was not paid';

  if (debarrDate) {
    if (isToday(debarrDate)) {
      return {
        isSubmitDisabled: true,
        message: `You are debarred from debt market till 5 PM IST today as ${reason}.`,
      };
    } else {
      return {
        isSubmitDisabled: true,
        message: `As per SEBI regulations you are not permitted to invest in debt market till ${dateFormatter(
          {
            dateTime: debarrDate,
            dateFormat: 'MMM DD, YYYY',
          }
        )} as ${reason}.`,
      };
    }
  }
  return { isSubmitDisabled: false, message: null };
};
