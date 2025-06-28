import { useRouter } from 'next/router';
import React from 'react';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import Button from '../primitives/Button';
import Image from '../primitives/Image';
import styles from './FallBackComponent.module.css';

const FallbackComponent: React.FC = () => {
  const router = useRouter();

  return (
    <div className={`flex-column items-center ${styles.fallbackContainer}`}>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}commons/BrokenLink.svg`}
        width={110}
        height={110}
        layout="fixed"
        alt={'play-button'}
      />
      <p className={styles.fallbackHeader}>Something&apos;s Not Right!</p>
      <p className={styles.fallbackContent}>
        It&apos;s not you, it&apos;s us. We are working to resolve this issue as quickly
        as possible.
      </p>
      <Button onClick={() => router.reload()} width={'100%'}>
        Reload
      </Button>
    </div>
  );
};

export default FallbackComponent;
