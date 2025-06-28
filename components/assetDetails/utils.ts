const generateYoutubeIframeFromURL = (url: URL): string => {
  return `<iframe width="560" height="315" src="${url}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
};

export const processContent = (content: string): string => {
  const isImageCenter = content?.includes('<p>image-center');
  let finalContent = isImageCenter
    ? content.replace(
        '<p>image-center',
        '<p style="display: flex; justify-content: center;">'
      )
    : content;
  try {
    [
      ['youtube-embeded', 'youtube-embeded'],
      ['youtube-embeded</span>', '<span>youtube-embeded'],
    ].forEach((wrapperTextArray: string[]): void => {
      const regexText = content.match(
        new RegExp(wrapperTextArray[0] + '(.*)' + wrapperTextArray[1])
      );
      if (regexText && regexText[1]) {
        const youtubeURL = regexText[1].trim();
        const textToReplace = `${wrapperTextArray[0]} ${youtubeURL} ${wrapperTextArray[1]}`;
        finalContent = finalContent.replace(
          textToReplace,
          generateYoutubeIframeFromURL(youtubeURL as unknown as URL)
        );
      }
    });
  } catch (e) {}
  return finalContent;
};

export const getDocumentStatus = (kycObject: any = {}, id: number | string) => {
  let status = 'Pending';
  if (!kycObject) {
    return status;
  }
  if (kycObject[id]) {
    if (kycObject[id].status === 0 || kycObject[id].status === 'pending') {
      status = 'Pending';
    }
    if (kycObject[id].status === 1 || kycObject[id].status === 'verified') {
      status = 'Approved';
    }
    if (
      kycObject[id].status === 2 ||
      kycObject[id].status === 'pending verification'
    ) {
      status = 'Submitted';
    }
    if (
      (kycObject[id].status === 2 ||
        kycObject[id].status === 'pending verification') &&
      kycObject[id]?.subStatus === 4
    ) {
      status = 'Pending Verification';
    }
    if (kycObject[id].status === 3 || kycObject[id].status === 'rejected') {
      status = 'Rejected';
    }
  }
  return status;
};

export const getNriAddressDocumentStatus = (kycObj: any) => {
  const addressProofs = ['aadhaar', 'passport'];
  const submitDocStatusArr = [];
  addressProofs.forEach((ele: string) => {
    submitDocStatusArr.push(getDocumentStatus(kycObj, ele));
  });
  return submitDocStatusArr.filter((el) => el !== 'Pending')[0] || 'Pending';
};

export const getAssetDetailSchema = (asset: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'InvestmentOrDeposit',
    name: asset?.header,
    amount: {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      minValue: asset?.minAmount,
      maxValue: asset?.maxAmount,
    },
    interestRate: asset?.irr,
  };
};

export const experimentUserCategoryCheck = (
  userType: string,
  userId: number
) => {
  if (userType === 'even') {
    return userId % 2 === 0;
  } else if (userType === 'odd') {
    return userId % 2 === 1;
  } else if (userType === 'all') {
    return true;
  }
  return false;
};
