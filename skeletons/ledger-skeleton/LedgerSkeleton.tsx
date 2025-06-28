import LedgerTableSkeleton from '../ledger-table-skeleton/LedgerTable';
import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import classes from './LedgetSkeleton.module.css';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

function LedgerSkeleton() {
  const isMobileDevice = useMediaQuery('(max-width: 992px)');

  const announcementCard = () => (
    <CustomSkeleton
      styles={{
        width: 335,
        height: 200,
      }}
    />
  );

  if (isMobileDevice) {
    return (
      <div
        className={`flex-column width100 containerNew ${classes.mobileContainer}`}
      >
        <CustomSkeleton
          className={classes.mb_6}
          styles={{
            width: 360,
            height: 30,
          }}
        />
        <CustomSkeleton
          className={classes.mb_6}
          styles={{
            width: 360,
            height: 30,
          }}
        />
        <div
          className={`flex width100 justify-between ${classes.mobileContainer}`}
        >
          <CustomSkeleton
            className={classes.mb_30}
            styles={{
              width: 149,
              height: 22,
            }}
          />
          <CustomSkeleton
            className={classes.mb_30}
            styles={{
              width: 91,
              height: 22,
            }}
          />
        </div>

        <div className={`flex-column width100`}>
          <LedgerTableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex width100 containerNew">
      <div>
        <div className={`flex width100`}>
          <div>
            <CustomSkeleton
              className={classes.mb_6}
              styles={{
                width: 567,
                height: 30,
              }}
            />
          </div>
        </div>

        <div className={classes.divider} />
        <div className="flex width100">
          <div className={classes.leftSide}>
            <div className={`flex width100 ${classes.mb_30}`}>
              <CustomSkeleton
                styles={{
                  width: 216,
                  height: 30,
                }}
              />
              <div className={`flex width100 justify-end`}>
                <CustomSkeleton
                  styles={{
                    width: 166,
                    height: 30,
                  }}
                />
              </div>
            </div>
            <LedgerTableSkeleton />
          </div>
          <div className={classes.rightSide}>{announcementCard()}</div>
        </div>
      </div>
    </div>
  );
}

export default LedgerSkeleton;
