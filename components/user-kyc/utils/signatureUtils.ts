type statusType = {
  status: 'success' | 'failure' | 'processing';
  title: string;
  subtitle?: string;
  icon?: string;
  btnText?: string;
  lottieType?: string;
};

export const SignatureStatus: statusType[] = [
  {
    status: 'failure',
    title: 'There was a problem with verification',
    btnText: 'Re-upload Signature',
    icon: 'DangerTriangle.svg',
    lottieType: 'warning',
  },
  {
    status: 'success',
    title: 'Signature Verified',
    subtitle: 'Redirecting you to the next step...',
    icon: 'check-circle.svg',
    lottieType: 'completed',
  },
  {
    status: 'processing',
    title: 'Verifying your Signature',
    subtitle: 'It’ll take up to 10 seconds',
    icon: 'scan.svg',
    lottieType: 'verifying',
  },
];
