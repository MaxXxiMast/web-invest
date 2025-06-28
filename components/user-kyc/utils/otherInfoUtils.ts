import { SelectModel } from './models';

type OptionsModel = {
  label: string;
  value: any;
};

export const genderOptions: OptionsModel[] = [
  {
    label: 'Male',
    value: 'M',
  },
  {
    label: 'Female',
    value: 'F',
  },
  {
    label: 'Other',
    value: 'O',
  },
];

export const occupation: SelectModel[] = [
  {
    labelKey: 'Self Employed',
    value: 'self employed',
  },
  {
    labelKey: 'Business',
    value: 'business',
  },
  {
    labelKey: 'Employee',
    value: 'employee',
  },
  {
    labelKey: 'Unemployed',
    value: 'unemployed',
  },
  {
    labelKey: 'Retired',
    value: 'retired',
  },
  {
    labelKey: 'Private Sector Service',
    value: 'private sector service',
  },
  {
    labelKey: 'Public Sector',
    value: 'public sector',
  },
  {
    labelKey: 'Professional',
    value: 'professional',
  },
  {
    labelKey: 'Agriculturist',
    value: 'agriculturist',
  },
  {
    labelKey: 'Housewife',
    value: 'housewife',
  },
  {
    labelKey: 'Student',
    value: 'student',
  },
  {
    labelKey: 'Forex Dealer',
    value: 'forex dealer',
  },
  {
    labelKey: 'Government Service',
    value: 'government service',
  },
  {
    labelKey: 'Others',
    value: 'others',
  },
];

export const incomeOptions: SelectModel[] = [
  {
    value: 'BELOW 1 LAC',
    labelKey: 'BELOW 1 LAC',
  },
  {
    value: '1-5 LAC',
    labelKey: '1-5 LAC',
  },
  {
    value: '5-10 LAC',
    labelKey: '5-10 LAC',
  },
  {
    value: '10-25 LAC',
    labelKey: '10-25 LAC',
  },
  {
    value: '> 25 LAC',
    labelKey: '> 25 LAC',
  },
];

export const maritalStatusOptions: SelectModel[] = [
  {
    value: 'married',
    labelKey: 'Married',
  },
  {
    value: 'unmarried',
    labelKey: 'Unmarried',
  },
  {
    value: 'widowed',
    labelKey: 'Widowed',
  },
  {
    value: 'divorced',
    labelKey: 'Divorced',
  },
  {
    value: 'separated',
    labelKey: 'Separated',
  },
];

export const nationalityOptions: SelectModel[] = [
  { labelKey: 'Resident Indian', value: 'resident_indian' },
  { labelKey: 'NRI', value: 'nri' },
  { labelKey: 'OCI', value: 'oci' },
  { labelKey: 'Others', value: 'others' },
];

export const nationalityValueToOptions = (value: string) => {
  const selectedValue = convertToOptionsNationality(value)
  return (
    nationalityOptions.find((item) => item?.value === selectedValue)?.labelKey || ''
  );
};

export const occupationEnum = [
  '',
  'self employed',
  'business',
  'employee',
  'unemployed',
  'retired',
  'private sector service',
  'public sector',
  'professional',
  'agriculturist',
  'housewife',
  'student',
  'forex dealer',
  'government service',
  'others',
];

export const convertToOptionsNationality = (nationality: string) => {
  if (nationality?.toLowerCase() === 'indian') {
    return 'resident_indian';
  }

  return nationality;
};

export const qualificationOptions: SelectModel[] = [
  {
    value: 'Under Graduate',
    labelKey:
      '<strong>Under Graduate</strong> (Do not have a bachelor’s degree)',
  },
  {
    value: 'Graduate',
    labelKey: '<strong>Graduate</strong> (Have a bachelor’s degree)',
  },
  {
    value: 'Post Graduate',
    labelKey:
      '<strong>Post Graduate</strong> (Have a bachelor’s degree and higher degree)',
  },
];
