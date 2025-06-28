import { mediaQueries } from '../components/utils/designSystem';
import { getObjectClassNames } from '../components/utils/designUtils';

const classes: any = getObjectClassNames({
  panlayout: {
    [mediaQueries.nonPhone]: {
      display: 'grid',
      gridTemplateColumns: '360px auto',
      gap: 20,
    },
    [mediaQueries.phone]: {
      rowGap: 20,
    },
  },
});

export const failCardData = {
  title: 'PAN Card',
  fields: [
    {
      id: 'pan',
      type: 'Upload',
      failed: true,
      title: 'Unable to fetch the details',
      subTitle: 'Your document is in blurry',
      buttonText: 'Reupload',
    },
  ],
};

export const postUploadDataForm = {
  id: 'panAfterUpload',
  title: 'PAN Card',
  fieldLayoutClass: classes.panlayout,
  fields: [
    {
      id: 'panName',
      type: 'Input',
      title: 'PAN Name',
      validation: 'name',
    },
    {
      id: 'panNumber',
      type: 'Input',
      title: 'PAN Number',
      validation: 'panNumber',
    },
    {
      id: 'panDob',
      type: 'Input',
      title: 'DOB',
      validation: 'dob',
      contentType: 'dob',
    },
    {
      id: 'nomineeName',
      type: 'Input',
      title: 'Son of/Father of/Mother of',
      validation: 'name',
    },
  ],
};

export const uploadFormData = {
  id: 'pan',
  title: 'PAN Card',
  showVerification: true,
  fields: [
    {
      id: 'pan',
      type: 'Upload',
      title: 'Front of PAN Card',
    },
  ],
};
