import { mediaQueries } from '../components/utils/designSystem';
import countryList from 'country-list';
import { getObjectClassNames } from '../components/utils/designUtils';
import { residentOptions } from '../utils/user';

const convertCountry = (countryName: string) => {
  return {
    labelKey: countryName,
    value: countryName.toLowerCase(),
  };
};
const nationalityConvert = countryList
  .getNames()
  .map((country) => convertCountry(country));

const userOccupationOptions = [
  { labelKey: 'Self Employed', value: 'self employed' },
  { labelKey: 'Business', value: 'business' },
  { labelKey: 'Employee', value: 'employee' },
  { labelKey: 'Unemployed', value: 'unemployed' },
  { labelKey: 'Retired', value: 'retired' },
];

const classes: any = getObjectClassNames({
  nomineeAddress: {
    [mediaQueries.nonPhone]: {
      width: '80% !important',
    },
  },
  formControlRoot: {
    [mediaQueries.phone]: {
      minWidth: '215px !important',
    },
  },
  accreditedLayout: {
    [mediaQueries.phone]: {
      marginTop: 20,
    },
  },
});

export const dinOptions = [
  {
    value: true,
    label: 'Yes',
  },
  {
    value: false,
    label: 'No',
  },
];
export const politicallyExposedPersonOptions = [
  { labelKey: 'Yes', value: 'yes' },
  { labelKey: 'No', value: 'no' },
  {
    labelKey: 'Related to politically exposed person',
    value: 'related to pep',
  },
  { labelKey: 'Not applicable', value: 'not applicable' },
];

export const postUploadDataForm = {
  id: 'other',
  title: 'Other Details',
  formData: [
    {
      title: 'Other Details',
      fields: [
        {
          id: 'residentialStatus',
          type: 'Select',
          title: 'Residential Status*',
          singleLine: true,
          options: residentOptions,
          disable: 'disableResidence',
          isSmallHeight: true,
        },
        {
          id: 'nationality',
          type: 'Select',
          title: 'Country Residing In',
          singleLine: true,
          options: nationalityConvert,
          disable: 'disableNationality',
          isSmallHeight: true,
        },
        {
          id: 'occupation',
          type: 'Select',
          title: 'Occupation',
          singleLine: true,
          options: userOccupationOptions,
          isSmallHeight: true,
        },
        {
          id: 'politicallyExposedPerson',
          type: 'Select',
          title: 'Politically Exposed Person',
          singleLine: true,
          options: politicallyExposedPersonOptions,
          isSmallHeight: true,
        },
        {
          id: 'din',
          type: 'radio',
          title: 'Do you have Director Identification Number?',
          options: dinOptions,
          singleLine: true,
        },
        {
          id: 'tin',
          type: 'Input',
          title: 'Tin',
          singleLine: true,
          validation: 'number',
        },
        {
          id: 'nomineeName',
          type: 'Input',
          title: 'Nominee Name*',
          singleLine: true,
          validation: 'number',
        },
      ],
    },
  ],
};

export const hideFields = ['countryOfBirth', 'placeOfBirth'];

export const accreditedPostUploadDataForm = {
  id: 'other',
  title: 'Other Details',
  formData: [
    {
      fieldLayoutClass: classes.accreditedLayout,
      title: 'Other Details',
      fields: [
        {
          id: 'countryOfBirth',
          type: 'Select',
          title: 'Country of Birth*',
          singleLine: true,
          options: nationalityConvert,
          accredited: true,
          isSmallHeight: true,
          classes: {
            formControlRoot: classes.formControlRoot,
          },
        },
        {
          id: 'placeOfBirth',
          type: 'Input',
          title: 'City of Birth*',
          validation: 'city',
          accredited: true,
          singleLine: true,
        },
        {
          id: 'residentialStatus',
          type: 'Select',
          title: 'Residential Status*',
          singleLine: true,
          options: residentOptions,
          isSmallHeight: true,
          disable: 'disableResidence',
        },
        {
          id: 'nationality',
          type: 'Select',
          title: 'Country Residing In*',
          singleLine: true,
          options: nationalityConvert,
          disable: 'disableNationality',
          isSmallHeight: true,
        },
        {
          id: 'occupation',
          type: 'Select',
          title: 'Occupation*',
          singleLine: true,
          options: userOccupationOptions,
          isSmallHeight: true,
        },
        {
          id: 'politicallyExposedPerson',
          type: 'Select',
          title: 'Politically Exposed Person*',
          singleLine: true,
          options: politicallyExposedPersonOptions,
          isSmallHeight: true,
        },
        {
          id: 'din',
          type: 'radio',
          title: 'Do you have Director Identification Number?',
          options: dinOptions,
          singleLine: true,
        },
        {
          id: 'dematNo',
          type: 'Input',
          singleLine: true,
          title: 'Demat Account Number (Optional)',
          validation: 'number',
          accredited: true,
        },
        {
          id: 'tin',
          type: 'Input',
          title: 'Tin*',
          singleLine: true,
          validation: 'number',
        },
        {
          id: 'nomineeName',
          type: 'Input',
          title: 'Nominee Name*',
          singleLine: true,
          validation: 'number',
        },
        {
          id: 'nomineeEmail',
          type: 'Input',
          title: 'Nominee Email*',
          singleLine: true,
          validation: 'emailID',
          accredited: true,
        },
        {
          id: 'nomineeDob',
          type: 'Input',
          title: 'Nominee DOB*',
          singleLine: true,
          validation: 'number',
          accredited: true,
          contentType: 'dob',
        },
        {
          id: 'nomineeAddress',
          type: 'textarea',
          title: 'Nominee Address*',
          singleLine: true,
          validation: 'number',
          accredited: true,
          classes: {
            root: classes.nomineeAddress,
          },
        },
      ],
    },
  ],
};

export const dinNo = {
  id: 'dinNo',
  type: 'Input',
  title: 'Director Identification Number',
  singleLine: true,
  accredited: true,
};
