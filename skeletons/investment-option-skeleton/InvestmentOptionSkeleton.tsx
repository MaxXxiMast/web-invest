import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import classes from './InvestmentOptionSkeleton.module.css';

type Props = {
  isRightContainer?: boolean;
};

const InvestmentOptionSkeleton = ({ isRightContainer = false }: Props) => {
  const isMobile = useMediaQuery();
  const optionItem = (index: number) => {
    return (
      <div
        className={`SkeletonCard ${classes.itemPaper}`}
        key={`investment_option_${index}`}
      >
        <div className={`flex-column ${classes.innerWrapper}`}>
          <CustomSkeleton
            styles={{
              width: 56,
              height: 56,
            }}
            className={classes.circularSkeleton}
          />
          <div className={`flex ${classes.w100} ${classes.rightFlex}`}>
            <div className="flex">
              <CustomSkeleton
                styles={{
                  width: 40,
                  height: 18,
                }}
              />
            </div>
            <CustomSkeleton
              styles={{
                width: '100%',
                height: isMobile ? 87 : 110,
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (!isMobile && isRightContainer) {
    return (
      <div
        className={`flex-column SkeletonPaper ${classes.mainRightContainer} `}
      >
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 53,
          }}
        />
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 135,
          }}
        />
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 247,
          }}
        />
      </div>
    );
  }

  return (
    <div className={`flex-column ${classes.mainWrapper}`}>
      <div className={`flex-column ${classes.title}`}>
        {isMobile ? (
          <CustomSkeleton
            styles={{
              width: '100%',
              height: 135,
            }}
          />
        ) : null}
        <CustomSkeleton
          styles={{
            width: 212,
            height: 34,
          }}
        />
      </div>
      <div className={`flex ${classes.itemWrapper}`}>
        {Array.from(Array(3), (e, i) => {
          return optionItem(i);
        })}
      </div>
    </div>
  );
};

export default InvestmentOptionSkeleton;
