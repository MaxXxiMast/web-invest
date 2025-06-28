const kycStepSortingArr = [
  {
    name: 'poa',
    key: 'address',
  },
  {
    name: 'bank',
    key: 'bank',
  },
  {
    name: 'other_details',
    key: 'other',
  },
  {
    name: 'nominee_details',
    key: 'nominee',
  },
  {
    name: 'liveness',
    key: 'liveness',
  },
  {
    name: 'signature',
    key: 'signature',
  },
  {
    name: 'demat',
    key: 'depository',
  },
  {
    name: 'aof',
    key: 'aof',
  },
];

// https://gripinvest.atlassian.net/browse/PT-25984
// Make OBPP KYC mandatory for FD

export const getContent = ({
  userKycData,
  isOldKYCComplete,
  isInvestedUser,
  uccStatus,
  isUserFDInvested,
  isUserOBPPInvested,
  subStatusMapping,
  page,
  commentsCountData,
  contentMapping,
  commonMessages,
}) => {
  let isObppKycComplete = true;
  let isAnyStepComplete = false;
  let isAllKYCStepsComplete = true;
  // CASE 8 & 15
  for (let doc in userKycData) {
    if (
      !userKycData[doc]?.isKYCComplete ||
      userKycData[doc]?.isKYCPendingVerification
    ) {
      isObppKycComplete = false;
    }
    if (userKycData[doc]?.isKYCComplete) {
      isAnyStepComplete = true;
    }
    if (
      !userKycData[doc]?.isKYCComplete &&
      !userKycData[doc]?.isKYCPendingVerification
    ) {
      isAllKYCStepsComplete = false;
    }
    if (
      Number.isInteger(userKycData[doc]?.optionalFields?.substatus) &&
      !userKycData[doc]?.fields?.status &&
      ['pan', 'depository', 'liveness', 'bank'].includes(userKycData[doc]?.name)
    ) {
      let rejectedDoc = userKycData[doc]?.name;
      let reasonOfRejectingDoc =
        subStatusMapping?.[userKycData[doc]?.name]?.[
          userKycData[doc]?.optionalFields?.substatus
        ];
      return {
        ...contentMapping['kyc doc got rejected'],
        mobile: {
          ...contentMapping['kyc doc got rejected'].mobile,
          heading: contentMapping[
            'kyc doc got rejected'
          ].mobile.heading.replace('<rejectedDoc>', rejectedDoc),
          subHeading: contentMapping[
            'kyc doc got rejected'
          ].mobile.subHeading.replace(
            '<reasonOfRejectingDoc>',
            reasonOfRejectingDoc
          ),
        },
        desktop: {
          ...contentMapping['kyc doc got rejected'].desktop,
          heading: contentMapping[
            'kyc doc got rejected'
          ].desktop.heading.replace('<rejectedDoc>', rejectedDoc),
          subHeading: contentMapping[
            'kyc doc got rejected'
          ].desktop.subHeading.replace(
            '<reasonOfRejectingDoc>',
            reasonOfRejectingDoc
          ),
        },
        visibilty: true,
        showToolTip: true,
      };
    }
  }
  if (
    !userKycData?.pan?.isKYCComplete &&
    !userKycData?.pan?.isKYCPendingVerification &&
    !isOldKYCComplete &&
    !isInvestedUser &&
    !isAnyStepComplete
  ) {
    // CASE 1
    return {
      ...contentMapping['new user'],
      visibilty: true,
    };
  }
  // const isFDKycComplete =
  //   userKycData?.pan?.isKYCComplete &&
  //   userKycData?.bank?.isKYCComplete &&
  //   userKycData?.nominee?.isKYCComplete &&
  //   userKycData?.other?.isKYCComplete;
  if (
    // isFDKycComplete &&
    !isUserOBPPInvested
  ) {
    // if (!isObppKycComplete) {
    //   if (isUserFDInvested && !isAllKYCStepsComplete) {
    //     // CASE 10
    //     return {
    //       ...contentMapping['fd kyc completed done & user is invested in fd'],
    //       visibilty: page === '/discover',
    //     };
    //   } else {
    //     // CASE 9
    //     return {
    //       ...contentMapping[
    //         'fd kyc completed/partial done & user is not invested'
    //       ],
    //       visibilty: page === '/discover',
    //     };
    //   }
    // }
    const uccCreatedAt = new Date(uccStatus?.createdAt);
    const today = new Date();
    const differenceInMillis = today.valueOf() - uccCreatedAt.valueOf();
    const differenceInDays = Math.floor(
      differenceInMillis / (1000 * 60 * 60 * 24)
    );
    if (differenceInDays < 30) {
      // CASE 11 & 12
      return {
        ...contentMapping['kyc completed & ready for higher returns'],
        visibilty: page === '/discover',
      };
    } else {
      if (isUserFDInvested) {
        // CASE 13
        return {
          ...contentMapping['kyc completed & ready for higher returns'],
          visibilty: page === '/discover',
        };
      }
    }
    // else {
    //     // CASE 14
    //     return {
    //       ...contentMapping['kyc completed & ready for fds'],
    //       visibilty: page === '/discover',
    //     };
    //   }
    // }
  }
  let totalCommentCount = 0;
  let sortedComments: any = kycStepSortingArr;
  for (let doc in commentsCountData) {
    let index = sortedComments.findIndex((p: any) => p?.name === doc);
    if (index !== -1) {
      sortedComments[index].commentsCount = commentsCountData[doc];
      totalCommentCount += commentsCountData[doc];
    }
  }
  let showCommentBox = !sortedComments.some(
    (step: any) =>
      step.commentsCount === 0 &&
      totalCommentCount >= 3 &&
      (userKycData?.[step.key]?.isKYCPendingVerification ||
        userKycData?.[step.key]?.isKYCComplete)
  );
  if (
    !userKycData?.bank?.isKYCComplete ||
    !userKycData?.nominee?.isKYCComplete ||
    !userKycData?.other?.isKYCComplete
  ) {
    if (isOldKYCComplete && !userKycData?.address?.isKYCComplete) {
      if (isInvestedUser) {
        // CASE 3
        return {
          ...contentMapping['old kyc done and invested'],
          learnMore: true,
          visibilty: true,
          mobileSubHeading: true,
        };
      } else {
        // CASE 2
        return {
          ...contentMapping['old KYC done, not invested'],
          visibilty: true,
        };
      }
    }
    // CASE 7
    if (userKycData?.pan?.isKYCPendingVerification) {
      return {
        ...contentMapping['kyc details being verified'],
        visibilty: true,
      };
    }
    if (userKycData?.bank?.isKYCPendingVerification) {
      if (
        userKycData?.depository?.isKYCPendingVerification ||
        userKycData?.depository?.isKYCComplete
      ) {
        // CASE 6
        return {
          ...contentMapping['kyc details being verified'],
          visibilty: true,
        };
      } else {
        // CASE 5
        return {
          ...contentMapping['partial fd kyc not done, but pan available'],
          subHeading: showCommentBox
            ? totalCommentCount < 3
              ? commonMessages.ifFacingIssue
              : commonMessages.issueSubmitted
            : "It won't take more than 2 minutes",
          visibilty: true,
          needHelp: totalCommentCount < 3,
          mobileSubHeading: true,
        };
      }
    }
    // CASE 4
    return {
      ...contentMapping['partial fd kyc not done, but pan available'],
      subHeading: showCommentBox
        ? totalCommentCount < 3
          ? commonMessages.ifFacingIssue
          : commonMessages.issueSubmitted
        : "It won't take more than 2 minutes",
      visibilty: true,
      needHelp: totalCommentCount < 3,
      mobileSubHeading: true,
    };
  }
  if (!isAllKYCStepsComplete) {
    return {
      ...contentMapping['partial fd kyc not done, but pan available'],
      subHeading: showCommentBox
        ? totalCommentCount < 3
          ? commonMessages.ifFacingIssue
          : commonMessages.issueSubmitted
        : "It won't take more than 2 minutes",
      visibilty: true,
      needHelp: totalCommentCount < 3,
      mobileSubHeading: true,
    };
  }
  return {};
};
