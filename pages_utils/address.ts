import { mediaQueries } from '../components/utils/designSystem';
import { getObjectClassNames } from '../components/utils/designUtils';
import { nriAddressOptions } from '../utils/kyc';
import { residentOptions } from '../utils/user';

const classes: any = getObjectClassNames({
  nriAddressProof: {
    marginBottom: 20,
  },
  addressDetailsForm: {
    [mediaQueries.nonPhone]: {
      flexDirection: 'column',
    },
  },
  addressDetailsFormNew: {
    marginTop: 34,
  },
});

/**
 * common details
 */

export const postUploadDataForm = {
  formData: [
    {
      fieldLayoutClass: classes.addressDetailsForm,
      id: 'addressDetailsForm',
      title: 'Address Proof',
      fields: [
        {
          id: 'aadhaarName',
          type: 'Input',
          title: 'Aadhaar Name',
          validation: 'name',
        },
        {
          id: 'aadharAddress',
          type: 'textarea',
          title: 'Aadhaar Address',
          large: true,
          singleLine: true,
          width: '92%',
        },
      ],
    },
  ],
};

export const postUploadDataFormForCkycDownload = {
  formData: [
    {
      fieldLayoutClass: classes.addressDetailsForm,
      id: 'addressDetailsForm',
      title: 'Address Proof',
      fields: [
        {
          id: 'aadhaarName',
          type: 'Input',
          title: 'Aadhaar Name',
          validation: 'name',
        },
      ],
    },
    {
      fieldLayoutClass: classes.addressDetailsFormNew,
      id: 'addressDetailsForm',
      title: '',
      fields: [
        {
          id: 'aadharAddress',
          type: 'textarea',
          title: 'Aadhaar Address',
          large: true,
          singleLine: true,
          width: '92%',
        },
        {
          id: 'corrAddress',
          type: 'textarea',
          title: 'Correspondence Address',
          large: true,
          singleLine: true,
          width: '92%',
        },
      ],
    },
  ],
};

export const nriPostUploadDataForm = {
  formData: [
    {
      fieldLayoutClass: classes.addressDetailsForm,
      title: 'Address Proof',
      fields: [
        {
          id: 'aadhaarName',
          type: 'Input',
          title: 'Passport Name',
          validation: 'name',
        },
        {
          id: 'aadharAddress',
          type: 'textarea',
          title: 'Passport Address',
          large: true,
          singleLine: true,
          width: '92%',
        },
      ],
    },
  ],
};

/**
 * General User Details
 */

export const uploadFormData = {
  id: 'address',
  title: 'Address Details',
  formData: [
    {
      fields: [
        {
          id: 'residentialStatus',
          type: 'Select',
          title: 'Residential Status',
          options: residentOptions,
          isSmallHeight: true,
        },
      ],
    },
    {
      id: 'addressUploadForm',
      subTitle: 'Address Proof',
      fields: [
        {
          type: 'Hint',
          hint: 'Aadhaar Front and Back side maybe placed in the same document',
        },
        {
          id: 'frontAddress',
          type: 'Upload',
          title: 'Front of Aadhaar Card',
        },
        {
          id: 'backAddress',
          type: 'Upload',
          title: 'Back of Aadhaar Card',
        },
      ],
    },
  ],
};

/**
 * NRI User Details
 */

export const nriUploadFormData = {
  id: 'address',
  title: 'Address Details',
  formData: [
    {
      fields: [
        {
          id: 'residentialStatus',
          type: 'Select',
          title: 'Residential Status',
          options: residentOptions,
          isSmallHeight: true,
        },
      ],
    },
    {
      id: 'passportUploadFields',
      subTitle: 'Upload Your Passport',
      fields: [
        {
          id: 'passportFront',
          type: 'Upload',
          title: 'Front of Passport',
        },
        {
          id: 'passportBack',
          type: 'Upload',
          title: 'Back of Passport',
        },
      ],
    },
    {
      fieldLayoutClass: classes.nriAddressProof,
      id: 'nriAddress',
      subTitle: 'Address Proof',
      fields: [
        {
          id: 'nriAddressOption',
          type: 'Select',
          title: 'Select Address Proof',
          options: nriAddressOptions,
          isSmallHeight: true,
        },
      ],
    },
    {
      fields: [
        {
          id: 'nriAddressProof',
          type: 'Upload',
          title: 'Upload {{option}}',
        },
      ],
    },
  ],
};
