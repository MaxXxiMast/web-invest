import React from 'react';
import Link from 'next/link';
import styles from './MfCalculatorNote.module.css';

const MfCalculatorNote = React.memo(() => {
  return (
    <p className={`TandC ${styles.TandC}`} data-testid="mf-calculator-note">
      By Continuing, I consent to sharing my Personal Information with the
      chosen AMC, and agree to{' '}
      <Link
        href={'/legal#termsAndConditions'}
        target="_blank"
        prefetch={false}
        data-testid="redirection-link"
        className={styles.linkStyle}
      >
        T&Cs
      </Link>{' '}
      &{' '}
      <Link
        href={'/legal#privacy'}
        target={'_blank'}
        prefetch={false}
        data-testid="redirection-link"
        className={styles.linkStyle}
      >
        Privacy Policy
      </Link>
    </p>
  );
});

MfCalculatorNote.displayName = 'MfCalculatorNote';

export default MfCalculatorNote;
