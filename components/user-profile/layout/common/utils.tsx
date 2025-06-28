import dynamic from 'next/dynamic';
import General from '../../generaldetails';

const Documents = dynamic(() => import('../../mydocuments'), {
  ssr: false,
});

const Support = dynamic(() => import('../../support'), {
  ssr: false,
});

export const SectionMapping = {
  accountdetails: {
    title: 'Account Details',
    component: <General />,
  },
  mydocuments: {
    title: 'My Documents',
    component: <Documents />,
  },
  support: {
    title: 'Support',
    component: <Support />,
  },
  termsandconditions: {
    title: 'Terms and Privacy Policies',
    component: <Support accessibilityLabel="termsAndPolicies" />,
  },
};
