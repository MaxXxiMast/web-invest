import EsignSkeleton from '../esign-skeleton/EsignSkeleton';
import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import classes from './InvestmentOverviewSkeleton.module.css';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

type Props = {
  showEsign?: boolean;
};

const InvestmentOverviewSkeleton = ({ showEsign = false }: Props) => {
  const isMobileDevice = useMediaQuery('(max-width: 992px)');

  const renderFooter = () => {
    if (showEsign && !isMobileDevice) {
      return null;
    }

    // Mobile sticky footer
    if (isMobileDevice) {
      return (
        <>
          <div className={`flex justify-center ${classes.mt_12}`}>
            <CustomSkeleton
              styles={{
                height: 43,
                width: '100%',
              }}
            />
          </div>
          <div
            className={`flex-column justify-between ${classes.w100} ${classes.mobileFooter}`}
          >
            {showEsign ? (
              <div
                className={`flex justify-center ${classes.esignMobileFooter}`}
              >
                <CustomSkeleton
                  styles={{
                    width: '100%',
                    height: 32,
                  }}
                />
              </div>
            ) : null}
            <CustomSkeleton
              styles={{
                height: 48,
                width: '100%',
              }}
            />
          </div>
        </>
      );
    }

    // Desktop footer
    return (
      <>
        <div className={`flex justify-between ${classes.mt_22}`}>
          <CustomSkeleton
            styles={{
              height: 62,
              width: '30%',
            }}
          />
          <CustomSkeleton
            styles={{
              height: 62,
              width: '60%',
            }}
          />
        </div>
        <div className={`flex justify-center ${classes.mt_12}`}>
          <CustomSkeleton
            styles={{
              height: 43,
              width: '90%',
            }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <div className={`flex items-center ${classes.HeaderSkeleton}`}>
        <CustomSkeleton
          styles={{
            width: 35,
            height: 35,
          }}
        />
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 40,
            marginLeft: 10,
            maxWidth: 350,
          }}
        />
      </div>
      <div
        className={`flex ${classes.w100} ${classes.overviewSkeleton} ${
          showEsign ? 'justify-between' : 'justify-center'
        }`}
      >
        <div className={`flex-column ${classes.w100} ${classes.mainFlex}`}>
          <CustomSkeleton
            className={classes.mobileItem}
            styles={{
              width: '100%',
              height: 98,
            }}
          />
          <div className={`SkeletonCard ${classes.paper}`}>
            <CustomSkeleton
              className={classes.desktopItem}
              styles={{
                width: '100%',
                height: 98,
              }}
            />
            <div className="flex justify-between">
              <CustomSkeleton
                styles={{
                  width: '45%',
                  height: 52,
                }}
              />
              <CustomSkeleton
                styles={{
                  width: '45%',
                  height: 52,
                }}
              />
            </div>

            <div className={`flex justify-between ${classes.mt_29}`}>
              <CustomSkeleton
                styles={{
                  width: '45%',
                  height: 29,
                }}
              />
              <CustomSkeleton
                styles={{
                  width: '45%',
                  height: 29,
                }}
              />
            </div>

            {!isMobileDevice ? (
              <div className={`flex justify-between ${classes.mt_29}`}>
                <CustomSkeleton
                  styles={{
                    width: '45%',
                    height: 29,
                  }}
                />
                <CustomSkeleton
                  styles={{
                    width: '45%',
                    height: 29,
                  }}
                />
              </div>
            ) : (
              <div className={`flex ${classes.mt_29}`}>
                <CustomSkeleton
                  styles={{
                    height: 48,
                    width: '100%',
                  }}
                />
              </div>
            )}

            <div className={`flex ${classes.mt_29}`}>
              <CustomSkeleton
                styles={{
                  height: isMobileDevice ? 32 : 62,
                  width: '100%',
                }}
              />
            </div>
          </div>
          {renderFooter()}
        </div>
        {showEsign && <EsignSkeleton />}
      </div>
    </>
  );
};

export default InvestmentOverviewSkeleton;
