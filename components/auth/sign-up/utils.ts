export const secondaryFieldName = (typeLoginID: string | null) => {
  let objectToReturn = {
    placeHolder: '',
    field: '',
  };
  switch (typeLoginID) {
    case 'email': {
      objectToReturn.placeHolder = 'Phone Number';
      objectToReturn.field = 'mobile';
      break;
    }
    case 'mobile': {
      objectToReturn.placeHolder = 'Email Address';
      objectToReturn.field = 'email';
      break;
    }
    default: {
      objectToReturn.placeHolder = 'Secondary Information';
      objectToReturn.field = 'Secondary Information';
      break;
    }
  }
  return objectToReturn;
};
