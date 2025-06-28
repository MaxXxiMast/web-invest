import React from 'react';
import { useRouter } from 'next/router';

// Components
import Image from '../../../primitives/Image';
import Button from '../../../primitives/Button';
import StyledLink from '../../common/StyledLink';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import { livenessErrorStates } from '../../utils/identityUtils';
import { LivenessErrorType } from '../../utils/models';

// Styles
import classes from './KycLiveness.module.css';

type LocationErrorProps = {
  type?: LivenessErrorType;
  handleCallBack: () => void;
};

const LocationError = ({
  type = 'outOfIndia',
  handleCallBack,
}: LocationErrorProps) => {
  const LocationErrorInfo = livenessErrorStates[type];
  const router = useRouter();
  return (
    <div className={classes.LocationContainer}>
      <div className={classes.LivenessLabel}>
        <span>{LocationErrorInfo.title}</span>
      </div>
      <div className={classes.locationErrorContainer}>
        <div className="flex">
          <div className={classes.locationImageWrapper}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/user-location.svg`}
              alt="user-location"
              height={24}
              width={24}
              layout="fixed"
            />
          </div>
          <div>
            <div className={classes.locationErrorTitle}>
              {LocationErrorInfo.subtitle}
            </div>
            <div className={classes.locationInfo}>
              {LocationErrorInfo.description1}
            </div>
            {LocationErrorInfo.description2 ? (
              <div className={classes.locationInfo}>
                {LocationErrorInfo.description2}
              </div>
            ) : null}
            {LocationErrorInfo.instructions?.length > 0 && (
              <div className={classes.locationInstr}>
                <ul className={classes.locationInfo}>
                  {LocationErrorInfo.instructions.map(
                    (instr: string, _idx: number) => (
                      <li key={`location_instr_${instr}`}>{instr}</li>
                    )
                  )}
                  {/* DO NOT SHOW this line if the browser is not detected or the browser is Chrome */}
                  {navigator?.userAgent &&
                    !/Chrome/.test(navigator.userAgent) && (
                      <li>Try using Google Chrome</li>
                    )}
                </ul>
              </div>
            )}
            {LocationErrorInfo.tooltipInfo && (
              <div className={`${classes.tooltipInfo} ${classes.locationInfo}`}>
                <span className={`icon-info ${classes.infoIcon}`} />
                {LocationErrorInfo.tooltipInfo}
              </div>
            )}
          </div>
        </div>
        {LocationErrorInfo.styledLink && (
          <StyledLink
            title={LocationErrorInfo.styledLink?.title}
            onClick={() =>
              window.open(LocationErrorInfo.styledLink?.link, '_blank')
            }
          />
        )}
        <div className={classes.locationButtonGroup}>
          <Button
            width={'100%'}
            onClick={handleCallBack}
            variant={LocationErrorInfo.variant}
            className={classes.PrimaryButton}
          >
            {LocationErrorInfo.continueLater}
          </Button>
          {LocationErrorInfo.nriOptions && (
            <Button
              width={'100%'}
              className={classes.PrimaryButton}
              onClick={() => router.push('/assets#active#startupequity')}
            >
              {LocationErrorInfo.nriOptions}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationError;
