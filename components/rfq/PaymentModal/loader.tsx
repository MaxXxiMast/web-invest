import Skeleton from '@mui/material/Skeleton';
import styles from './PaymentModal.module.css';

export default function PaymentModalLoader() {
  return (
    <div className={`flex-column ${styles.skeletonContainer}`}>
      <Skeleton animation="wave" variant="rounded" height={28} width={168} />
      <div className={`flex justify-between items-center `}>
        <Skeleton animation="wave" variant="rounded" height={41} width={168} />
        <Skeleton animation="wave" variant="rounded" height={21} width={168} />
      </div>
      <Skeleton animation="wave" variant="rounded" height={28} width={'100%'} />
      <Skeleton animation="wave" variant="rounded" height={96} width={'100%'} />
      <Skeleton animation="wave" variant="rounded" height={52} width={'100%'} />
      <div className={`flex ${styles.tagsSkeleton}`}>
        {Array.from(Array(5), (e, k) => {
          return (
            <Skeleton
              key={`skeleton-tag-${k}`}
              animation="wave"
              variant="rounded"
              height={28}
              width={49}
              style={{
                borderRadius: '50%',
              }}
            />
          );
        })}
      </div>

      <Skeleton animation="wave" variant="rounded" height={52} width={'100%'} />
      <Skeleton animation="wave" variant="rounded" height={52} width={'100%'} />
      <Skeleton animation="wave" variant="rounded" height={52} width={'100%'} />
    </div>
  );
}
