import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import classes from './EsignSkeleton.module.css';

const EsignSkeleton = () => {
  return (
    <>
      {/* MOBILE SKELETON */}
      <div className={`flex-column width100 ${classes.mobileEsign}`}>
        <CustomSkeleton
          styles={{
            height: 23,
            width: '30%',
          }}
        />
        <CustomSkeleton
          styles={{
            height: 45,
            width: '100%',
          }}
        />
        <CustomSkeleton
          styles={{
            height: 23,
            width: '30%',
          }}
        />
      </div>

      {/* DESKTOP SKELETON */}
      <div className={`flex-column width100 ${classes.mainFlex}`}>
        <CustomSkeleton
          styles={{
            width: '50%',
            height: 33,
          }}
        />
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 69,
          }}
          className={classes.mt_19}
        />
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 33,
          }}
          className={classes.mt_32}
        />
        <div className={`flex width100 justify-between ${classes.mt_16}`}>
          <CustomSkeleton
            styles={{
              width: '20%',
              height: 62,
            }}
          />
          <CustomSkeleton
            styles={{
              width: '70%',
              height: 62,
            }}
          />
        </div>
        <div className={`flex width100 justify-center ${classes.mt_16}`}>
          <CustomSkeleton
            styles={{
              width: '90%',
              height: 43,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default EsignSkeleton;
